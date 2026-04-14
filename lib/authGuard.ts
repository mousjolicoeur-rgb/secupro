import { supabase } from "./supabaseClient";

export type ApprovalStatus = "approved" | "pending" | "unauthenticated";

/**
 * Vérifie la session et le statut d'approbation du profil.
 * Appelé au montage des pages protégées.
 */
export async function getApprovalStatus(): Promise<ApprovalStatus> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return "unauthenticated";

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_approved")
    .eq("id", session.user.id)
    .single();

  return profile?.is_approved === true ? "approved" : "pending";
}
