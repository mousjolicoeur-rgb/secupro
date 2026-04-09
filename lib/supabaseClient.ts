import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

const browserAuth = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
};

/** Schéma explicite — aligné sur les tables créées dans Supabase (public). */
const dbPublic = { schema: "public" as const };

export const supabase: SupabaseClient = createClient(url, anon, {
  auth: browserAuth,
  db: dbPublic,
});

/**
 * Même URL + ANON_KEY, en-têtes supplémentaires pour les INSERT sur `rapports`
 * (éviter cache intermédiaire / forcer PostgREST à traiter le corps comme prévu).
 * Pas de persistance auth séparée : évite deux clients qui écrivent le même storage.
 */
export const supabaseRapportsInsert: SupabaseClient = createClient(url, anon, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: dbPublic,
  global: {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Prefer: "params=single-object",
    },
  },
});
