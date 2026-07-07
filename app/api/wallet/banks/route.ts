import { NextResponse } from "next/server";
import { fetchBanks } from "@/lib/nomba";

export async function GET() {
  try {
    const banks = await fetchBanks();
    return NextResponse.json({ ok: true, banks });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Could not load banks." },
      { status: 500 }
    );
  }
}