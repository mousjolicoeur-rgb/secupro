import { createBrowserClient } from "@supabase/ssr";

/**
 * Client navigateur / composants "use client" : clé **anon** uniquement.
 * Utilise createBrowserClient (@supabase/ssr) pour stocker la session dans
 * les cookies — indispensable pour que le middleware Next.js (qui lit les
 * cookies, pas localStorage) puisse valider la session côté serveur.
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

export const supabase = createBrowserClient(url, anon);
