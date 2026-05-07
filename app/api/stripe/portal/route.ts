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

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { societe_id } = (await req.json()) as { societe_id?: string };

    if (!societe_id) {
      return NextResponse.json(
        { error: "societe_id est obligatoire." },
        { status: 400 }
      );
    }

    // Récupère le stripe_customer_id stocké par le webhook checkout
    const { data: societe, error } = await supabaseAdmin
      .from("societes")
      .select("stripe_customer_id, nom")
      .eq("id", societe_id)
      .single();

    if (error || !societe) {
      return NextResponse.json({ error: "Société introuvable." }, { status: 404 });
    }

    if (!societe.stripe_customer_id) {
      return NextResponse.json(
        { error: "Aucun abonnement Stripe actif pour cette société." },
        { status: 422 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://secupro.app";

    const session = await stripe.billingPortal.sessions.create({
      customer: societe.stripe_customer_id,
      return_url: `${appUrl}/espace-societe/support`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[Stripe Portal]", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
