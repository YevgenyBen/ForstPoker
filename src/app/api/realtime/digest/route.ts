import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { verifySessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0",
} as const;

/**
 * Cheap fingerprint of DB activity so clients can poll and call `router.refresh()`
 * when something relevant changed (Neon + serverless has no push channel to the browser).
 */
export async function GET() {
  const session = await verifySessionCookie();
  if (!session) {
    return NextResponse.json({ v: "guest" }, { headers: NO_STORE });
  }

  const rows = await db.execute(
    sql`SELECT (
      (SELECT COUNT(*)::text FROM app_users) || ':' ||
      (SELECT COUNT(*)::text FROM games) || ':' ||
      (SELECT COUNT(*)::text FROM ledger_entries) || ':' ||
      (SELECT COUNT(*)::text FROM game_members) || ':' ||
      (SELECT COUNT(*)::text FROM settlements) || ':' ||
      COALESCE((SELECT MAX(recorded_at)::text FROM ledger_entries), '') || ':' ||
      COALESCE((SELECT MAX(closed_at)::text FROM games), '') || ':' ||
      COALESCE((SELECT MAX(joined_at)::text FROM game_members), '') || ':' ||
      COALESCE((SELECT MAX(scheduled_start_at)::text FROM games), '')
    ) AS v`
  );

  const row = rows.rows[0] as { v: string } | undefined;
  const v = row?.v ?? "";

  return NextResponse.json({ v }, { headers: NO_STORE });
}
