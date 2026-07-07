import { NextRequest, NextResponse } from "next/server";
import { verifyTransferStatus } from "@/lib/nomba";
import { markWithdrawalCompleted, markWithdrawalFailedAndRefund } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const merchantTxRef = req.nextUrl.searchParams.get("ref");
  if (!merchantTxRef) {
    return NextResponse.json({ ok: false, message: "Missing reference." }, { status: 400 });
  }

  try {
    const result = await verifyTransferStatus(merchantTxRef);
    const status = String(result.data?.status ?? "");

    if (/success/i.test(status)) {
      await markWithdrawalCompleted(merchantTxRef);
      return NextResponse.json({ ok: true, status: "completed" });
    }

    if (/fail/i.test(status)) {
      await markWithdrawalFailedAndRefund(merchantTxRef);
      return NextResponse.json({ ok: true, status: "failed" });
    }

    return NextResponse.json({ ok: true, status: "processing" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Could not check status." },
      { status: 500 }
    );
  }
}