// lib/nomba.ts
// Thin server-side client for the Nomba payment gateway.
// Docs: https://developer.nomba.com/
//
// IMPORTANT: this file talks to Nomba with your client secret — never import
// it from a client component. Only call it from route handlers / server actions.

const NOMBA_ENV = (process.env.NOMBA_ENV ?? "sandbox") as "sandbox" | "production";
const NOMBA_CLIENT_ID = process.env.NOMBA_CLIENT_ID ?? "dummy-client-id";
const NOMBA_CLIENT_SECRET = process.env.NOMBA_CLIENT_SECRET ?? "dummy-client-secret";
const NOMBA_ACCOUNT_ID = process.env.NOMBA_ACCOUNT_ID ?? "dummy-account-id";
const NOMBA_WEBHOOK_SECRET = process.env.NOMBA_WEBHOOK_SECRET ?? "dummy-webhook-secret";

export const isNombaConfigured = Boolean(
  process.env.NOMBA_CLIENT_ID && process.env.NOMBA_CLIENT_SECRET && process.env.NOMBA_ACCOUNT_ID
);

const BASE_URL = NOMBA_ENV === "production" ? "https://api.nomba.com" : "https://sandbox.nomba.com";

// Sandbox checkout + transaction-lookup endpoints live under a different path
// prefix than production. Auth (/v1/auth/token/issue) is identical in both.
const CHECKOUT_ORDER_PATH = NOMBA_ENV === "production" ? "/v1/checkout/order" : "/sandbox/checkout/order";
const CHECKOUT_TX_PATH =
  NOMBA_ENV === "production" ? "/v1/transactions/accounts/single" : "/sandbox/checkout/transaction";

type NombaTokenResponse = {
  code: string;
  description: string;
  data?: { access_token: string; refresh_token: string; expiresAt: string };
};

// Small in-memory cache — helps on a warm Next.js server process; a cold
// serverless invocation will just fetch a fresh token (tokens last 30 min).
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) {
    return cachedToken.accessToken;
  }

  const res = await fetch(`${BASE_URL}/v1/auth/token/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accountId: NOMBA_ACCOUNT_ID },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: NOMBA_CLIENT_ID,
      client_secret: NOMBA_CLIENT_SECRET
    }),
    cache: "no-store"
  });

  const json = (await res.json()) as NombaTokenResponse;

  if (!res.ok || !json.data?.access_token) {
    throw new Error(json.description || "Failed to authenticate with Nomba.");
  }

  cachedToken = {
    accessToken: json.data.access_token,
    expiresAt: new Date(json.data.expiresAt).getTime()
  };

  return cachedToken.accessToken;
}

async function nombaFetch<T extends { code?: string; description?: string }>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accountId: NOMBA_ACCOUNT_ID,
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  const json = (await res.json()) as T;

  if (!res.ok || json.code !== "00") {
    throw new Error(json.description || `Nomba request to ${path} failed.`);
  }

  return json;
}

export type CreateCheckoutOrderPayload = {
  orderReference: string;
  amount: number;
  customerEmail: string;
  callbackUrl: string;
  currency?: string;
  customerId?: string;
  allowedPaymentMethods?: string[];
  orderMetaData?: Record<string, string>;
};

export type CreateCheckoutOrderResult = {
  code: string;
  description: string;
  data: { checkoutLink: string; orderReference: string };
};

export async function createCheckoutOrder(
  payload: CreateCheckoutOrderPayload
): Promise<CreateCheckoutOrderResult> {
  return nombaFetch<CreateCheckoutOrderResult>(CHECKOUT_ORDER_PATH, {
    method: "POST",
    body: JSON.stringify({
      order: {
        orderReference: payload.orderReference,
        amount: payload.amount.toFixed(2),
        currency: payload.currency ?? "NGN",
        customerEmail: payload.customerEmail,
        callbackUrl: payload.callbackUrl,
        customerId: payload.customerId,
        allowedPaymentMethods: payload.allowedPaymentMethods ?? ["Card", "Transfer"],
        orderMetaData: payload.orderMetaData
      }
    })
  });
}

export type NombaTransactionStatus = {
  code: string;
  description: string;
  data: {
    status?: string;
    success?: boolean;
    message?: string;
    order?: Record<string, unknown>;
    transactionDetails?: Record<string, unknown>;
  };
};

// Always re-verify server-side before crediting a wallet — never trust the
// webhook body or the client-side redirect alone.
export async function verifyCheckoutTransaction(orderReference: string): Promise<NombaTransactionStatus> {
  const query =
    NOMBA_ENV === "production"
      ? `?orderReference=${encodeURIComponent(orderReference)}`
      : `?idType=orderReference&id=${encodeURIComponent(orderReference)}`;

  return nombaFetch<NombaTransactionStatus>(`${CHECKOUT_TX_PATH}${query}`, { method: "GET" });
}

// --- Webhook signature verification -----------------------------------------
//
// Nomba signs webhooks with an HMAC-SHA256 digest over specific payload
// fields plus a timestamp, base64-encoded
// (https://developer.nomba.com/products/webhooks/signature-verification-new).
// The exact header names aren't published — confirm them against your
// dashboard/webhook config once you have real credentials, and adjust
// SIGNATURE_HEADER / TIMESTAMP_HEADER below if they differ.
const SIGNATURE_HEADER = "signature";
const TIMESTAMP_HEADER = "timestamp";

type NombaWebhookPayload = {
  event_type: string;
  requestId: string;
  data: {
    merchant?: { userId?: string; walletId?: string };
    transaction?: { transactionId?: string; type?: string; time?: string; responseCode?: string };
    order?: { orderReference?: string };
    [key: string]: unknown;
  };
};

export async function verifyNombaWebhookSignature(rawBody: string, headers: Headers): Promise<boolean> {
  const receivedSignature = headers.get(SIGNATURE_HEADER);
  const timestamp = headers.get(TIMESTAMP_HEADER);
  if (!receivedSignature || !timestamp) return false;

  let payload: NombaWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const hashingPayload = [
    payload.event_type ?? "",
    payload.requestId ?? "",
    payload.data?.merchant?.userId ?? "",
    payload.data?.merchant?.walletId ?? "",
    payload.data?.transaction?.transactionId ?? "",
    payload.data?.transaction?.type ?? "",
    payload.data?.transaction?.time ?? "",
    payload.data?.transaction?.responseCode ?? ""
  ].join(":");

  const message = `${hashingPayload}:${timestamp}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(NOMBA_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const computedSignature = Buffer.from(signatureBuffer).toString("base64");

  if (computedSignature.length !== receivedSignature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computedSignature.length; i++) {
    mismatch |= computedSignature.charCodeAt(i) ^ receivedSignature.charCodeAt(i);
  }
  return mismatch === 0;
}

export function extractOrderReference(rawBody: string): string | null {
  try {
    const parsed = JSON.parse(rawBody) as NombaWebhookPayload;
    return parsed.data?.order?.orderReference ?? null;
  } catch {
    return null;
  }
}

export type NombaBank = { code: string; name: string; nipCode?: string | null; logo?: string };

let cachedBanks: NombaBank[] | null = null;

// Bank codes rarely change — cache for the life of the server process.
export async function fetchBanks(): Promise<NombaBank[]> {
  if (cachedBanks) return cachedBanks;

  const res = await nombaFetch<{ code: string; description: string; data: NombaBank[] }>(
    "/v1/transfers/banks",
    { method: "GET" }
  );

  cachedBanks = res.data;
  return cachedBanks;
}

export type BankLookupResult = { accountNumber: string; accountName: string };

// Always call this before a transfer so the user can confirm who they're paying.
export async function lookupBankAccount(accountNumber: string, bankCode: string): Promise<BankLookupResult> {
  const res = await nombaFetch<{ code: string; description: string; data: BankLookupResult }>(
    "/v1/transfers/bank/lookup",
    { method: "POST", body: JSON.stringify({ accountNumber, bankCode }) }
  );
  return res.data;
}

export type InitiateBankTransferPayload = {
  amount: number;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  merchantTxRef: string;
  senderName: string;
  narration?: string;
};

export type BankTransferResult = {
  code?: string;
  successful?: boolean;
  status?: string; // "SUCCESS" | "PENDING_BILLING" | "FAILED" | ...
  message?: string;
  description?: string;
  data: { id?: string; status?: string };
};

export async function initiateBankTransfer(payload: InitiateBankTransferPayload): Promise<BankTransferResult> {
  const token = await getAccessToken();

  // Transfers respond with a different success envelope (top-level
  // `successful`/`status`, not the `code: "00"` shape everything else uses),
  // so this bypasses nombaFetch's code==="00" check.
  const res = await fetch(`${BASE_URL}/v2/transfers/bank`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accountId: NOMBA_ACCOUNT_ID
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const json = (await res.json()) as BankTransferResult;

  // 201 = accepted but still processing (NIBSS delay) — not an error.
  if (!res.ok && res.status !== 201) {
    throw new Error(json.message || json.description || "Bank transfer failed.");
  }

  return json;
}

export type TransferStatusResult = { code: string; description: string; data: { status?: string; [key: string]: unknown } };

export async function verifyTransferStatus(transactionRef: string): Promise<TransferStatusResult> {
  return nombaFetch<TransferStatusResult>(
    `/v1/transactions/accounts/single?transactionRef=${encodeURIComponent(transactionRef)}`,
    { method: "GET" }
  );
}