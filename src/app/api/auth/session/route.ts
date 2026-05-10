import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeConsoleError } from "@/lib/logSafeError";
import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/session";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0",
} as const;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "invalid_json_body" },
        { status: 400, headers: NO_STORE }
      );
    }
    const idToken = (body as { idToken?: string }).idToken;
    if (!idToken) {
      return NextResponse.json(
        { error: "idToken required" },
        { status: 400, headers: NO_STORE }
      );
    }
    const auth = getAdminAuth();
    const expiresIn = SESSION_MAX_AGE_MS;
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000,
      path: "/",
    });
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (e) {
    safeConsoleError("api/auth/session POST", e);
    const message = e instanceof Error ? e.message : "session_failed";
    const detail =
      process.env.NODE_ENV === "development"
        ? message
        : "session_failed";
    return NextResponse.json(
      { error: detail },
      { status: 401, headers: NO_STORE }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
