import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2023-10-16" as any,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function extractSetupClientSecret(
  pending: Stripe.SetupIntent | string | null | undefined
): string | null {
  if (!pending) return null;
  if (typeof pending === "object" && pending.client_secret) {
    return pending.client_secret;
  }
  return null;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get("Authorization");
    const token =
      authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: userErr,
    } = await supabaseAuth.auth.getUser(token);

    if (userErr || !user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    const body = (await req.json()) as { societe_id?: string };
    const societeId = body.societe_id;
    if (!societeId || !/^[0-9a-f-]{36}$/i.test(societeId)) {
      return NextResponse.json({ error: "societe_id invalide." }, { status: 400 });
    }

    const { data: societe, error: socErr } = await supabaseAdmin
      .from("societes")
      .select(
        "id, user_id, email_contact, nom, stripe_customer_id, stripe_subscription_id"
      )
      .eq("id", societeId)
      .single();

    if (socErr || !societe) {
      return NextResponse.json({ error: "Société introuvable." }, { status: 404 });
    }

    if (societe.user_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const priceId = process.env.STRIPE_PRICE_ESSENTIEL;
    if (!priceId) {
      return NextResponse.json(
        { error: "Configuration Stripe incomplète (STRIPE_PRICE_ESSENTIEL)." },
        { status: 500 }
      );
    }

    let customerId = societe.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: societe.email_contact ?? user.email ?? undefined,
        metadata: { societe_id: societeId },
        name: societe.nom ?? undefined,
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("societes")
        .update({ stripe_customer_id: customerId })
        .eq("id", societeId);
    }

    // Souscription existante : réutiliser le SetupIntent en attente si besoin
    if (societe.stripe_subscription_id) {
      const existing = await stripe.subscriptions.retrieve(
        societe.stripe_subscription_id as string,
        { expand: ["pending_setup_intent"] }
      );

      if (existing.status === "trialing" && existing.default_payment_method) {
        return NextResponse.json({ already_complete: true });
      }

      const secret = extractSetupClientSecret(existing.pending_setup_intent);
      if (secret) {
        return NextResponse.json({
          client_secret: secret,
          subscription_id: existing.id,
        });
      }

      // Abonnement bloqué sans intent exploitable : on en crée un nouveau lié au client
      if (existing.status === "incomplete" || existing.status === "past_due") {
        await stripe.subscriptions.cancel(existing.id);
      }
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 7,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      metadata: { societe_id: societeId },
      expand: ["pending_setup_intent"],
    });

    await supabaseAdmin
      .from("societes")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
      })
      .eq("id", societeId);

    let clientSecret = extractSetupClientSecret(subscription.pending_setup_intent);

    if (!clientSecret && typeof subscription.pending_setup_intent === "string") {
      const si = await stripe.setupIntents.retrieve(
        subscription.pending_setup_intent
      );
      clientSecret = si.client_secret;
    }

    // Filet de sécurité : SetupIntent manuel + attachement après confirmation côté client
    if (!clientSecret) {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
        usage: "off_session",
        metadata: {
          societe_id: societeId,
          subscription_id: subscription.id,
        },
      });
      clientSecret = setupIntent.client_secret;

      await supabaseAdmin
        .from("societes")
        .update({
          stripe_subscription_id: subscription.id,
        })
        .eq("id", societeId);
    }

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Impossible de préparer la saisie carte." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      client_secret: clientSecret,
      subscription_id: subscription.id,
    });
  } catch (err: unknown) {
    console.error("[Stripe setup]", err);
    const msg = err instanceof Error ? err.message : "Erreur serveur.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
