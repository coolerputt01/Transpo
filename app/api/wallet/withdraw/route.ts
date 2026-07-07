import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { initiateBankTransfer } from "@/lib/nomba";
import {
  getCurrentProfile,
  debitWalletForWithdrawal,
  markWithdrawalCompleted,
  markWithdrawalFailedAndRefund
} from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ ok: false, message: "You need to be signed in to withdraw." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  const accountNumber: string | undefined = body?.accountNumber;
  const bankCode: string | undefined = body?.bankCode;
  const accountName: string | undefined = body?.accountName;

  if (!amount || amount <= 0 || !accountNumber || !bankCode || !accountName) {
    return NextResponse.json({ ok: false, message: "Fill in all withdrawal details." }, { status: 400 });
  }

  const merchantTxRef = `WD-${profile.id}-${randomUUID()}`;

  // Debit first, atomically. We never call an external transfer against a
  // balance we haven't reserved.
  const debited = await debitWalletForWithdrawal({
    profileId: profile.id,
    email: profile.email,
    amount,
    bankCode,
    accountNumber,
    accountName,
    merchantTxRef
  });

  if (!debited.ok) {
    return NextResponse.json(debited, { status: 400 });
  }

  try {
    const transfer = await initiateBankTransfer({
      amount,
      accountNumber,
      accountName,
      bankCode,
      merchantTxRef,
      senderName: profile.name,
      narration: "Wallet withdrawal"
    });

    const status = transfer.data?.status ?? transfer.status;

    if (status === "SUCCESS") {
      await markWithdrawalCompleted(merchantTxRef);
      return NextResponse.json({ ok: true, status: "completed", merchantTxRef });
    }

    if (status === "FAILED") {
      await markWithdrawalFailedAndRefund(merchantTxRef);
      return NextResponse.json(
        { ok: false, message: transfer.message ?? "Transfer failed. Your wallet has been refunded." },
        { status: 400 }
      );
    }

    // Still processing (e.g. PENDING_BILLING / HTTP 201) — resolved by polling below.
    return NextResponse.json({ ok: true, status: "processing", merchantTxRef });
  } catch (error) {
    // The call itself failed (network/validation) — refund immediately.
    await markWithdrawalFailedAndRefund(merchantTxRef);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Could not process withdrawal." },
      { status: 500 }
    );
  }
}