import { NextRequest, NextResponse } from "next/server";
import { lookupBankAccount } from "@/lib/nomba";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const accountNumber = body?.accountNumber;
  const bankCode = body?.bankCode;

  if (!accountNumber || !bankCode) {
    return NextResponse.json({ ok: false, message: "Account number and bank are required." }, { status: 400 });
  }

  try {
    const result = await lookupBankAccount(accountNumber, bankCode);
    return NextResponse.json({ ok: true, accountName: result.accountName });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Could not verify that account." },
      { status: 400 }
    );
  }
}