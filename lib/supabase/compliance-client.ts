import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server-side read-only client for the compliance-rgpd Supabase project.
 *  Use ONLY in API routes — never import in "use client" files. */
export function createComplianceClient(): SupabaseClient {
  const url = process.env.COMPLIANCE_SUPABASE_URL;
  const key = process.env.COMPLIANCE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing COMPLIANCE_SUPABASE_URL or COMPLIANCE_SUPABASE_ANON_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db:   { schema: "public" },
  });
}
