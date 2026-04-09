import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "boss_admin_auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
