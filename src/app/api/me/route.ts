import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      preferredLocale: user.preferredLocale,
    },
  });
}
