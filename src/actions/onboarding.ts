"use server";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { verifySessionCookie } from "@/lib/auth/session";
import { getAdminAuth } from "@/lib/firebase/admin";

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[\p{L}\p{N}_]+$/u);

export async function completeOnboarding(formData: FormData) {
  const locale = await getLocale();
  const raw = formData.get("username");
  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) {
    return;
  }
  const username = parsed.data;
  const session = await verifySessionCookie();
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const fbUser = await getAdminAuth().getUser(session.uid);
  const email = fbUser.email;
  if (!email) {
    return;
  }

  const [already] = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.firebaseUid, session.uid))
    .limit(1);
  if (already) {
    redirect(`/${locale}/games`);
  }

  const exists = await db
    .select({ id: appUsers.id })
    .from(appUsers)
    .where(sql`lower(${appUsers.username}) = lower(${username})`)
    .limit(1);

  if (exists.length) {
    return;
  }

  await db.insert(appUsers).values({
    firebaseUid: session.uid,
    email,
    username,
  });

  redirect(`/${locale}/games`);
}
