import { NextResponse, type NextRequest } from "next/server";

// Note: Supabase auth (supabase-js) persists sessions in localStorage,
// not in cookies — session cannot be read in Edge middleware.
// Route protection is handled client-side in each page component.
// This middleware only handles static rewrites and CSP headers.

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
