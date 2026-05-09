import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers } from "@/db/schema";

const SESSION_COOKIE = "__session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

export async function verifySessionCookie(): Promise<
  { uid: string; email?: string } | null
> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(token, true);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

export async function getAppUser() {
  const session = await verifySessionCookie();
  if (!session) return null;
  const [row] = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.firebaseUid, session.uid))
    .limit(1);
  return row ?? null;
}

export { SESSION_COOKIE, SESSION_MAX_AGE_MS };
