import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2023-10-16" as any,
});

const PRICE_IDS: Record<string, string | undefined> = {
  starter:    process.env.STRIPE_STARTER_PRICE_ID,
  business:   process.env.STRIPE_BUSINESS_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      plan: "starter" | "business" | "enterprise";
      societe_name: string;
      siret: string;
      nb_agents: string;
      email: string;
      telephone?: string;
    };

    const { plan, societe_name, siret, nb_agents, email, telephone } = body;

    if (!plan || !societe_name || !email) {
      return NextResponse.json(
        { error: "plan, societe_name et email sont obligatoires." },
        { status: 400 }
      );
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID manquant pour le plan "${plan}". Vérifiez les variables d'environnement STRIPE_${plan.toUpperCase()}_PRICE_ID.` },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://secupro.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan,
          societe_name,
          siret:     siret ?? "",
          nb_agents: nb_agents ?? "",
          telephone: telephone ?? "",
        },
      },
      metadata: {
        plan,
        societe_name,
        siret:     siret ?? "",
        nb_agents: nb_agents ?? "",
      },
      allow_promotion_codes: true,
      success_url: `${appUrl}/espace-societe/dashboard?welcome=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/entreprises?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[Stripe Checkout]", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
