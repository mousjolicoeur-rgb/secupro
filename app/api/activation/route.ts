import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { code, societe_id } = (await req.json()) as {
      code?: string;
      societe_id?: string;
    };

    if (!code || !societe_id) {
      return NextResponse.json(
        { error: "code et societe_id sont obligatoires." },
        { status: 400 }
      );
    }

    // Normalise le code (majuscules, tirets)
    const normalizedCode = code.trim().toUpperCase();

    // Vérifie que le code correspond à cette société
    const { data: societe, error } = await supabaseAdmin
      .from("societes")
      .select("id, activation_code, subscription_status")
      .eq("id", societe_id)
      .single();

    if (error || !societe) {
      return NextResponse.json({ error: "Société introuvable." }, { status: 404 });
    }

    if (societe.subscription_status === "active") {
      // Déjà activé — on laisse passer sans erreur
      return NextResponse.json({ success: true, already_active: true });
    }

    if (!societe.activation_code || societe.activation_code !== normalizedCode) {
      return NextResponse.json(
        { error: "Code d'activation invalide. Vérifiez votre email SecuPRO." },
        { status: 422 }
      );
    }

    // Code valide → passe subscription_status à 'active'
    const { error: updateError } = await supabaseAdmin
      .from("societes")
      .update({ subscription_status: "active" })
      .eq("id", societe_id);

    if (updateError) {
      console.error("[Activation]", updateError);
      return NextResponse.json({ error: "Erreur lors de l'activation." }, { status: 500 });
    }

    console.log(`[Activation] Société ${societe_id} activée avec succès.`);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[Activation]", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
