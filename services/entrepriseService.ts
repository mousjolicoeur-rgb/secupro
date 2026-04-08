import { supabase } from "@/lib/supabaseClient";

export type EntrepriseRow = {
  id: string;
  nom: string;
};

/** Vérifie le code dans la table `entreprises` (colonne `code_activation`). */
export async function checkActivationCode(
  code: string
): Promise<EntrepriseRow | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("entreprises")
    .select("id, nom")
    .eq("code_activation", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return data as EntrepriseRow;
}
