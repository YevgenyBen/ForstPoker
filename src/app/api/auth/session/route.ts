import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }
    const auth = getAdminAuth();
    const expiresIn = SESSION_MAX_AGE_MS;
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "session_failed" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
