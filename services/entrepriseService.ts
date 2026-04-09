import { supabase } from "@/lib/supabaseClient";

export type EntrepriseRow = {
  id: string;
  nom: string;
};

/** Code d’activation fixe (hors Supabase). */
const ACTIVATION_CODE_FIXE = "BOSS";

/** Même `id` que le dashboard pour les rapports / filtres. */
const ENTREPRISE_BOSS: EntrepriseRow = {
  id: "05054cca-d92c-4a14-a66b-08aef3835cc7",
  nom: "SECUPRO",
};

/** Vérifie le code : d’abord `BOSS`, sinon table `entreprises` (`code_activation`). */
export async function checkActivationCode(
  code: string
): Promise<EntrepriseRow | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  if (normalized === ACTIVATION_CODE_FIXE) {
    return ENTREPRISE_BOSS;
  }

  const { data, error } = await supabase
    .from("entreprises")
    .select("id, nom")
    .eq("code_activation", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return data as EntrepriseRow;
}
