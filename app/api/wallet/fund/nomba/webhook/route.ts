import { NextRequest, NextResponse } from "next/server";
import { verifyNombaWebhookSignature, verifyCheckoutTransaction, extractOrderReference } from "@/lib/nomba";
import { completeWalletFunding } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const isValid = await verifyNombaWebhookSignature(rawBody, req.headers);
  if (!isValid) {
    return NextResponse.json({ ok: false, message: "Invalid signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const orderReference = extractOrderReference(rawBody);

  if (payload.event_type !== "payment_success" || !orderReference) {
    return NextResponse.json({ ok: true }); // ack, nothing to do
  }

  // Never trust the webhook body alone — re-verify against Nomba directly.
  const verified = await verifyCheckoutTransaction(orderReference);
  const status = verified.data?.status ?? verified.data?.message ?? "";
  const succeeded = verified.data?.success === true || /success/i.test(String(status));

  if (!succeeded) {
    return NextResponse.json({ ok: true });
  }

  const result = await completeWalletFunding(orderReference);
  return NextResponse.json(result);
}