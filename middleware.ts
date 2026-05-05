import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware d'authentification — protège toutes les routes sensibles.
 * Utilise @supabase/ssr pour lire/rafraîchir la session JWT via les cookies.
 * Redirige vers /login?next=<url> si l'utilisateur n'est pas authentifié.
 */
export async function middleware(request: NextRequest) {
  // On crée la réponse de base ; elle sera potentiellement remplacée par setAll
  let response = NextResponse.next({ request });

  // Initialisation du client Supabase compatible Edge Runtime (cookies R/W)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Propage les cookies mis à jour (refresh token) dans la réponse
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() rafraîchit le JWT si nécessaire et retourne l'utilisateur courant.
  // Ne pas utiliser getSession() ici : il ne valide pas le JWT côté serveur.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Utilisateur non authentifié → redirection vers /login avec ?next= pour
  // revenir automatiquement à la page demandée après connexion.
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Routes protégées — dashboard principal
    "/dashboard/:path*",
    // Espace société (administration)
    "/espace-societe/:path*",
    // Espace agent (hub, fiches de paie, planning, docs…)
    "/agent/:path*",
    // Liste des agents (admin)
    "/agents/:path*",
    // Rapports de performance
    "/performance/:path*",
    // Assistant IA SecuIA
    "/secuia/:path*",
    // Dashboard d'exploitation (planning mensuel…)
    "/dashboard-exploitation/:path*",
  ],
};
