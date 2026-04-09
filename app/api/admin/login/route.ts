import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "boss_admin_auth";

export async function POST(request: Request) {
  const password = process.env.BOSS_ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "BOSS_ADMIN_PASSWORD is not set on the server" },
      { status: 500 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.password !== password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
