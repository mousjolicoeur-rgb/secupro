import { createClient } from "@supabase/supabase-js";

/**
 * Client navigateur / composants "use client" : clé **anon** uniquement.
 * Ne pas utiliser SUPABASE_SERVICE_ROLE_KEY ici (exposition + bypass RLS dangereux).
 */
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.local.supabase.co";
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — set them in .env.local"
    );
  }
}

export const supabase = createClient(url, anon);
