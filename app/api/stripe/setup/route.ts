import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2023-10-16" as any,
});

export async function POST(): Promise<NextResponse> {
  try {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return NextResponse.json({ client_secret: setupIntent.client_secret });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur interne Stripe";
    console.error("[Stripe Setup Error]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
