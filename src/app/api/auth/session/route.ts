import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
    }
    const idToken = (body as { idToken?: string }).idToken;
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
    console.error("[session POST]", e);
    const message = e instanceof Error ? e.message : "session_failed";
    const detail =
      process.env.NODE_ENV === "development"
        ? message
        : "session_failed";
    return NextResponse.json({ error: detail }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
