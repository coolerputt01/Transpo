import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createCheckoutOrder } from "@/lib/nomba";
import { getCurrentProfile, createPendingWalletFunding } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json(
      { ok: false, message: "You need to be signed in to fund your wallet." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount);
  const purpose = body?.purpose ?? "escrow";

  if (!amount || amount <= 0) {
    return NextResponse.json({ ok: false, message: "Enter a valid amount." }, { status: 400 });
  }

  const orderReference = `WALLET-${profile.id}-${randomUUID()}`;
  const origin = req.nextUrl.origin;

  try {
    const pending = await createPendingWalletFunding({
      profileId: profile.id,
      email: profile.email,
      amount,
      purpose,
      orderReference
    });

    if (!pending.ok) {
      return NextResponse.json(pending, { status: 500 });
    }

    const order = await createCheckoutOrder({
      orderReference,
      amount,
      customerEmail: profile.email,
      callbackUrl: `${origin}/wallet/callback?orderReference=${orderReference}`,
      orderMetaData: { purpose }
    });

    return NextResponse.json({ ok: true, checkoutLink: order.data.checkoutLink, orderReference });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Could not start payment." },
      { status: 500 }
    );
  }
}