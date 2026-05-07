import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeSociete } from "@/lib/emails";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2023-10-16" as any,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Après confirmCardSetup : associe le moyen de paiement à l’abonnement d’essai. */
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

    const body = (await req.json()) as {
      societe_id?: string;
      subscription_id?: string;
      payment_method_id?: string;
    };

    const { societe_id, subscription_id, payment_method_id } = body;
    if (!societe_id || !subscription_id || !payment_method_id) {
      return NextResponse.json(
        { error: "societe_id, subscription_id et payment_method_id requis." },
        { status: 400 }
      );
    }

    const { data: societe, error: socErr } = await supabaseAdmin
      .from("societes")
      .select("user_id, stripe_subscription_id")
      .eq("id", societe_id)
      .single();

    if (socErr || !societe) {
      return NextResponse.json({ error: "Société introuvable." }, { status: 404 });
    }

    if (societe.user_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    if (societe.stripe_subscription_id !== subscription_id) {
      return NextResponse.json({ error: "Abonnement incorrect." }, { status: 400 });
    }

    try {
      await stripe.subscriptions.update(subscription_id, {
        default_payment_method: payment_method_id,
      });
    } catch (err) {
      console.warn("[Stripe attach PM] (peut être déjà défini par Stripe):", err);
    }

    try {
      const { data: socRow } = await supabaseAdmin
        .from("societes")
        .select("nom, email_contact")
        .eq("id", societe_id)
        .single();

      if (socRow?.email_contact) {
        const sub = await stripe.subscriptions.retrieve(subscription_id);
        await sendWelcomeSociete(socRow.email_contact, socRow.nom ?? "Client", {
          trialEnd: sub.trial_end ?? undefined,
        });
      }
    } catch (emailErr) {
      console.warn("[Email] sendWelcomeSociete (inscription CB):", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[Stripe attach PM]", err);
    const msg = err instanceof Error ? err.message : "Erreur serveur.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
