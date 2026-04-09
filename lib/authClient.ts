import { supabase } from "@/lib/supabaseClient";

export async function isAuthenticatedClient(): Promise<boolean> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return false;
  return Boolean(data.session);
}

