import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const { data: existing } = await supabaseAdmin
      .from("societes")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ societe_id: existing.id });
    }

    // Crée la société avec subscription_status='trial'
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

    if (error || !societe) {
      console.error("[Register] Erreur création société:", error);
      return NextResponse.json(
        { error: "Impossible de créer la société." },
        { status: 500 }
      );
    }

    return NextResponse.json({ societe_id: societe.id });
  } catch (err: unknown) {
    console.error("[Register]", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
