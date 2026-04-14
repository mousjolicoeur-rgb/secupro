import { NextResponse, type NextRequest } from "next/server";

// Middleware temporairement désactivé — passthrough pur.
// Aucun header CSP injecté. À réactiver une fois l'app stabilisée.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
