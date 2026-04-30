import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes protégées : toute requête vers ces préfixes exige une session valide.
// Si l'utilisateur n'est pas authentifié → redirection vers /login?next=<chemin>.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/agents",
  "/performance",
  "/provisioning",
  "/espace-societe",
  "/secuia",
  "/agent",
];

export async function middleware(request: NextRequest) {
  // On crée une réponse mutable pour que @supabase/ssr puisse rafraîchir
  // le cookie de session si nécessaire (rotation silencieuse du token).
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Écriture dans la requête (pour les Server Components en aval)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Écriture dans la réponse (pour que le navigateur persiste les cookies)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ⚠️  On utilise getUser() et NON getSession() :
  // getSession() lit uniquement le cookie sans valider le JWT côté serveur
  // → le payload peut être forgé. getUser() valide le token auprès de Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    // Redirection vers /login en conservant l'URL cible dans ?next=
    // pour pouvoir y renvoyer l'utilisateur après connexion réussie.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est déjà connecté et accède à /login,
  // on le renvoie directement vers /dashboard (évite le double-login).
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Toutes les routes sauf les ressources statiques Next.js et les fichiers publics.
    // Exclut : _next/static, _next/image, sw.js, manifest.json, icons/, images...
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons/|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
