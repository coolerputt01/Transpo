import { createClient } from "@supabase/supabase-js";
import type { Profile, Delivery, Transaction, UserRole } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function createTranspoUser(payload: SignupPayload) {
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured yet. Add your keys in .env.local."
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
        phone: payload.phone,
        role: payload.role,
        verification_status: "pending"
      }
    }
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  // If email confirmation is required, Supabase returns a user but no session.
  const needsEmailConfirmation = Boolean(data.user) && !data.session;

  return { ok: true, data, needsEmailConfirmation };
}

export async function loginTranspoUser(payload: LoginPayload) {
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured yet. Add your keys in .env.local."
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, data };
}

// Pulls the role out of the logged-in user's metadata, falling back to
// whatever was picked in the UI (useful right after signup, before the
// row/metadata has fully propagated anywhere else you read it from).
export function resolveUserRole(user: { user_metadata?: Record<string, unknown> } | null, fallback: UserRole): UserRole {
  const metaRole = user?.user_metadata?.role;
  if (metaRole === "buyer" || metaRole === "seller" || metaRole === "driver" || metaRole === "storekeeper") {
    return metaRole;
  }
  return fallback;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function fetchTransactionsForProfile(profile: Profile): Promise<Transaction[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .or(`payer_email.eq.${profile.email},recipient_email.eq.${profile.email}`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];
  return data as Transaction[];
}

export async function signOutTranspoUser() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

import type {
  DeliveryWithParticipants,
  SearchableProfile
} from "@/lib/types";

export async function fetchDeliveriesForProfile(
  profile: Profile
): Promise<DeliveryWithParticipants[]> {
  if (!supabase) return [];

  let query = supabase
    .from("deliveries")
    .select(
      "*, seller:seller_id(name,email), driver:driver_id(name,email), storekeeper:storekeeper_id(name,email)"
    )
    .order("created_at", { ascending: false });

  switch (profile.role) {
    case "buyer":
      query = query.eq("buyer_email", profile.email);
      break;
    case "seller":
      query = query.eq("seller_id", profile.id);
      break;
    case "driver":
      query = query.eq("driver_id", profile.id);
      break;
    case "storekeeper":
      query = query.eq("storekeeper_id", profile.id);
      break;
  }

  const { data, error } = await query.limit(20);
  if (error || !data) return [];
  return data as unknown as DeliveryWithParticipants[];
}

export async function searchProfilesByEmail(
  emailQuery: string,
  role: UserRole
): Promise<SearchableProfile[]> {
  if (!supabase || !emailQuery.trim()) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, role, verification_status")
    .eq("role", role)
    .ilike("email", `%${emailQuery.trim()}%`)
    .limit(10);

  if (error || !data) return [];
  return data as SearchableProfile[];
}

export async function createEscrowDelivery(payload: {
  buyerEmail: string;
  sellerId: string;
  sellerEmail: string;
  title: string;
  pickupAddress: string;
  deliveryAddress: string;
  amount: number;
}) {
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet. Add your keys in .env.local." };
  }

  const { data: delivery, error: deliveryError } = await supabase
    .from("deliveries")
    .insert({
      buyer_email: payload.buyerEmail,
      seller_id: payload.sellerId,
      title: payload.title,
      pickup_address: payload.pickupAddress,
      delivery_address: payload.deliveryAddress,
      amount: payload.amount,
      status: "pending"
    })
    .select()
    .single();

  if (deliveryError || !delivery) {
    return { ok: false, message: deliveryError?.message ?? "Could not create delivery." };
  }

  const { error: transactionError } = await supabase.from("transactions").insert({
    payer_email: payload.buyerEmail,
    recipient_email: payload.sellerEmail,
    amount: payload.amount,
    type: "escrow_payment",
    status: "held",
    delivery_id: delivery.id
  });

  if (transactionError) {
    return { ok: false, message: transactionError.message };
  }

  return { ok: true, delivery };
}

export async function confirmEscrowDelivery(deliveryId: string) {
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet. Add your keys in .env.local." };
  }

  const { error } = await supabase.rpc("confirm_escrow_delivery", { delivery_id: deliveryId });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function updateOwnProfile(
  profileId: string,
  updates: { name: string; phone: string }
) {
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet. Add your keys in .env.local." };
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", profileId);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

// --- Wallet funding (Nomba) --------------------------------------------------
// Requires a `wallets` table and a `credit_wallet_funding` Postgres function
// that atomically bumps the balance and marks the transaction complete.
// SQL sketch below.

export async function createPendingWalletFunding(payload: {
  profileId: string;
  email: string;
  amount: number;
  purpose: string;
  orderReference: string;
}) {
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet. Add your keys in .env.local." };
  }

  const { error } = await supabase.from("transactions").insert({
    payer_email: payload.email,
    recipient_email: payload.email,
    amount: payload.amount,
    type: "wallet_funding",
    status: "pending",
    provider_reference: payload.orderReference,
    metadata: { purpose: payload.purpose, profile_id: payload.profileId }
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function completeWalletFunding(orderReference: string) {
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet. Add your keys in .env.local." };
  }

  const { error } = await supabase.rpc("credit_wallet_funding", {
    order_reference: orderReference
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function getWalletBalance(profileId: string): Promise<number> {
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("wallets")
    .select("balance")
    .eq("profile_id", profileId)
    .single();

  if (error || !data) return 0;
  return Number(data.balance ?? 0);
}

// --- Wallet withdrawals (Nomba) ----------------------------------------------
// Debit happens atomically in Postgres BEFORE we ever call Nomba — we never
// want to fire a transfer against a balance we haven't reserved. If the
// transfer fails, refund_wallet_withdrawal puts the money back.

export async function debitWalletForWithdrawal(payload: {
  profileId: string;
  email: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  merchantTxRef: string;
}) {
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet. Add your keys in .env.local." };
  }

  const { data, error } = await supabase.rpc("debit_wallet_for_withdrawal", {
    p_profile_id: payload.profileId,
    p_amount: payload.amount,
    p_merchant_tx_ref: payload.merchantTxRef,
    p_email: payload.email,
    p_bank_code: payload.bankCode,
    p_account_number: payload.accountNumber,
    p_account_name: payload.accountName
  });

  if (error) return { ok: false, message: error.message };
  if (data === false) return { ok: false, message: "Insufficient wallet balance." };
  return { ok: true };
}

export async function markWithdrawalCompleted(merchantTxRef: string) {
  if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
  const { error } = await supabase
    .from("transactions")
    .update({ status: "completed" })
    .eq("provider_reference", merchantTxRef);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function markWithdrawalFailedAndRefund(merchantTxRef: string) {
  if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
  const { error } = await supabase.rpc("refund_wallet_withdrawal", {
    p_merchant_tx_ref: merchantTxRef
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}