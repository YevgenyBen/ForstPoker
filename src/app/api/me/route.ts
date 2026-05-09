import { NextResponse } from "next/server";
import { getAppUser, verifySessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await verifySessionCookie();
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({
      user: null,
      /** Firebase session cookie present but no `app_users` row yet */
      hasSession: !!session,
    });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      preferredLocale: user.preferredLocale,
    },
    hasSession: true,
  });
}
