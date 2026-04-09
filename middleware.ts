import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Maintenance forcée (par défaut) — bypass secret avec ?admin=true
  if (url.searchParams.get("admin") === "true") {
    return NextResponse.next();
  }

  const pathname = url.pathname;

  // Avoid loops and never block Next internals / API / static assets
  if (
    pathname === "/maintenance" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".map") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  const rewriteUrl = url.clone();
  rewriteUrl.pathname = "/maintenance";
  // Keep original path visible for debugging (optional)
  rewriteUrl.searchParams.set("from", pathname);
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

