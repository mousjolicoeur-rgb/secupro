import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Création société — l’email de bienvenue essai (sendWelcomeSociete) est envoyé
 * après saisie CB : POST /api/stripe/subscription-attach-payment. Le webhook
 * checkout.session.completed l’envoie pour les souscriptions via Stripe Checkout.
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Détails PostgREST / Supabase pour debug client + logs. */
function formatSupabaseError(err: {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}): string {
  const bits: string[] = [err.message];
  if (err.code) bits.push(`code=${err.code}`);
  if (err.details) bits.push(`details=${err.details}`);
  if (err.hint) bits.push(`hint=${err.hint}`);
  return bits.join(" · ");
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { user_id, nom_societe, email } = (await req.json()) as {
      user_id?: string;
      nom_societe?: string;
      email?: string;
    };

    if (!user_id || !nom_societe || !email) {
      return NextResponse.json(
        { error: "user_id, nom_societe et email sont obligatoires." },
        { status: 400 }
      );
    }

    // Vérifie si une société existe déjà pour cet utilisateur
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("societes")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (existingErr) {
      console.error("[Register] Erreur Supabase (lecture société):", {
        message: existingErr.message,
        code: existingErr.code,
        details: existingErr.details,
        hint: existingErr.hint,
      });
      return NextResponse.json(
        { error: formatSupabaseError(existingErr) },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({ societe_id: existing.id });
    }

    // Crée la société avec subscription_status='trial' (colonnes DB : nom, email_contact, …)
    const { data: societe, error } = await supabaseAdmin
      .from("societes")
      .insert({
        user_id,
        nom: nom_societe,
        email_contact: email,
        subscription_status: "trial",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Register] Erreur Supabase (insert societes):", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: formatSupabaseError(error) },
        { status: 500 }
      );
    }

    if (!societe) {
      const msg = "Aucune ligne société retournée après insertion (réponse vide).";
      console.error("[Register]", msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ societe_id: societe.id });
  } catch (err: unknown) {
    console.error("[Register] Exception:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
