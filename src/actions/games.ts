"use server";

import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  appUsers,
  gameMembers,
  games,
  ledgerEntries,
  settlements,
} from "@/db/schema";
import { getViewer } from "@/lib/auth/session";
import { canDeleteGames } from "@/lib/auth/gameAdmin";
import {
  computeNetByUser,
  minimizeTransfers,
  netSum,
} from "@/lib/settlement";

const titleSchema = z.string().trim().min(1).max(120);
const amountSchema = z.coerce.number().int().positive();

async function requireUser() {
  const locale = await getLocale();
  const v = await getViewer();
  if (v.kind === "guest") redirect(`/${locale}/login`);
  if (v.kind === "needs_onboarding") redirect(`/${locale}/onboarding`);
  return { user: v.user, locale };
}

export async function createGame(formData: FormData) {
  const { user, locale } = await requireUser();
  const title = titleSchema.safeParse(formData.get("title"));
  if (!title.success) return;

  const [game] = await db
    .insert(games)
    .values({
      title: title.data,
      createdBy: user.id,
      status: "open",
    })
    .returning({ id: games.id });

  await db.insert(gameMembers).values({
    gameId: game!.id,
    userId: user.id,
  });

  revalidatePath(`/${locale}/games`);
  redirect(`/${locale}/games/${game!.id}`);
}

export async function joinGame(gameId: string) {
  const { user, locale } = await requireUser();

  const [g] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!g || g.status !== "open") return { error: "closed" as const };

  await db.insert(gameMembers).values({ gameId, userId: user.id }).onConflictDoNothing();

  revalidatePath(`/${locale}/games`);
  revalidatePath(`/${locale}/games/${gameId}`);
  return { ok: true as const };
}

export async function addLedgerEntry(input: {
  gameId: string;
  kind: "buy_in" | "buy_out";
  amountNis: number;
  note?: string | null;
}) {
  const { user, locale } = await requireUser();
  const amount = amountSchema.safeParse(input.amountNis);
  if (!amount.success) return { error: "invalid_amount" as const };

  const [g] = await db.select().from(games).where(eq(games.id, input.gameId)).limit(1);
  if (!g || g.status !== "open") return { error: "closed" as const };

  const [member] = await db
    .select()
    .from(gameMembers)
    .where(
      and(eq(gameMembers.gameId, input.gameId), eq(gameMembers.userId, user.id))
    )
    .limit(1);
  if (!member) return { error: "not_member" as const };

  await db.insert(ledgerEntries).values({
    gameId: input.gameId,
    userId: user.id,
    kind: input.kind,
    amountNis: amount.data,
    note: input.note?.trim() || null,
  });

  revalidatePath(`/${locale}/games`);
  revalidatePath(`/${locale}/games/${input.gameId}`);
  revalidatePath(`/${locale}/history`);
  return { ok: true as const };
}

export async function closeGame(gameId: string) {
  const { user, locale } = await requireUser();

  try {
    await db.transaction(async (tx) => {
      const [g] = await tx
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .for("update")
        .limit(1);

      if (!g) throw new Error("not_found");
      if (g.status !== "open") throw new Error("already_closed");

      const [member] = await tx
        .select()
        .from(gameMembers)
        .where(
          and(eq(gameMembers.gameId, gameId), eq(gameMembers.userId, user.id))
        )
        .limit(1);
      if (!member) throw new Error("not_member");

      const ledger = await tx
        .select({
          userId: ledgerEntries.userId,
          kind: ledgerEntries.kind,
          amountNis: ledgerEntries.amountNis,
        })
        .from(ledgerEntries)
        .where(eq(ledgerEntries.gameId, gameId));

      const netByUser = computeNetByUser(ledger);
      const sum = netSum(netByUser);
      if (sum !== 0) throw new Error("bad_balance");

      const transfers = minimizeTransfers(netByUser);

      await tx
        .update(games)
        .set({
          status: "closed",
          closedAt: new Date(),
          closedBy: user.id,
        })
        .where(eq(games.id, gameId));

      if (transfers.length) {
        await tx.insert(settlements).values(
          transfers.map((t) => ({
            gameId,
            fromUserId: t.fromUserId,
            toUserId: t.toUserId,
            amountNis: t.amountNis,
          }))
        );
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "already_closed") return { error: "already_closed" as const };
    if (msg === "bad_balance") return { error: "bad_balance" as const };
    if (msg === "not_member") return { error: "not_member" as const };
    throw e;
  }

  revalidatePath(`/${locale}/games`);
  revalidatePath(`/${locale}/games/${gameId}`);
  revalidatePath(`/${locale}/history`);
  return { ok: true as const };
}

export async function deleteGame(gameId: string) {
  const { user, locale } = await requireUser();

  if (!canDeleteGames(user.email)) {
    return { error: "forbidden" as const };
  }

  const [g] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!g) return { error: "not_found" as const };

  await db.delete(games).where(eq(games.id, gameId));

  revalidatePath(`/${locale}/games`);
  revalidatePath(`/${locale}/games/${gameId}`);
  revalidatePath(`/${locale}/history`);
  return { ok: true as const };
}

export async function listGames() {
  await requireUser();
  return db
    .select({
      id: games.id,
      title: games.title,
      status: games.status,
      createdAt: games.createdAt,
    })
    .from(games)
    .orderBy(desc(games.createdAt));
}

export async function getGameDetail(gameId: string) {
  const { user } = await requireUser();

  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  if (!game) return null;

  const members = await db
    .select({
      userId: appUsers.id,
      username: appUsers.username,
      joinedAt: gameMembers.joinedAt,
    })
    .from(gameMembers)
    .innerJoin(appUsers, eq(gameMembers.userId, appUsers.id))
    .where(eq(gameMembers.gameId, gameId));

  const ledger = await db
    .select({
      id: ledgerEntries.id,
      userId: ledgerEntries.userId,
      username: appUsers.username,
      kind: ledgerEntries.kind,
      amountNis: ledgerEntries.amountNis,
      note: ledgerEntries.note,
      recordedAt: ledgerEntries.recordedAt,
    })
    .from(ledgerEntries)
    .innerJoin(appUsers, eq(ledgerEntries.userId, appUsers.id))
    .where(eq(ledgerEntries.gameId, gameId))
    .orderBy(ledgerEntries.recordedAt);

  const isMember = members.some((m) => m.userId === user.id);

  let settlementRows: {
    fromUserId: string;
    toUserId: string;
    amountNis: number;
    fromName: string;
    toName: string;
  }[] = [];

  if (game.status === "closed") {
    const rows = await db
      .select({
        fromUserId: settlements.fromUserId,
        toUserId: settlements.toUserId,
        amountNis: settlements.amountNis,
      })
      .from(settlements)
      .where(eq(settlements.gameId, gameId));

    const ids = new Set<string>();
    for (const r of rows) {
      ids.add(r.fromUserId);
      ids.add(r.toUserId);
    }
    const idList = [...ids];
    const names =
      idList.length === 0
        ? []
        : await db
            .select({ id: appUsers.id, username: appUsers.username })
            .from(appUsers)
            .where(inArray(appUsers.id, idList));

    const nameMap = new Map(names.map((n) => [n.id, n.username]));
    settlementRows = rows.map((r) => ({
      ...r,
      fromName: nameMap.get(r.fromUserId) ?? "?",
      toName: nameMap.get(r.toUserId) ?? "?",
    }));
  }

  let closerName: string | null = null;
  if (game.closedBy) {
    const [cr] = await db
      .select({ username: appUsers.username })
      .from(appUsers)
      .where(eq(appUsers.id, game.closedBy))
      .limit(1);
    closerName = cr?.username ?? null;
  }

  return {
    game,
    members,
    ledger,
    settlements: settlementRows,
    closerName,
    isMember,
  };
}

export async function getHistorySummary() {
  const { user } = await requireUser();

  const joined = await db
    .select({ gameId: gameMembers.gameId })
    .from(gameMembers)
    .where(eq(gameMembers.userId, user.id));

  const gameIds = joined.map((j) => j.gameId);
  if (gameIds.length === 0) {
    return { lifetimeNis: 0, rows: [] as { gameId: string; title: string; closedAt: Date | null; netNis: number }[] };
  }

  const closedGames = await db
    .select()
    .from(games)
    .where(and(inArray(games.id, gameIds), eq(games.status, "closed")));

  const ledgerForUser = await db
    .select({
      gameId: ledgerEntries.gameId,
      kind: ledgerEntries.kind,
      amountNis: ledgerEntries.amountNis,
    })
    .from(ledgerEntries)
    .where(
      and(
        eq(ledgerEntries.userId, user.id),
        inArray(ledgerEntries.gameId, gameIds)
      )
    );

  const netByGame = new Map<string, number>();
  for (const row of ledgerForUser) {
    const delta =
      row.kind === "buy_out" ? row.amountNis : -row.amountNis;
    netByGame.set(row.gameId, (netByGame.get(row.gameId) ?? 0) + delta);
  }

  let lifetime = 0;
  const rows: {
    gameId: string;
    title: string;
    closedAt: Date | null;
    netNis: number;
  }[] = [];

  for (const g of closedGames) {
    const net = netByGame.get(g.id) ?? 0;
    lifetime += net;
    rows.push({
      gameId: g.id,
      title: g.title,
      closedAt: g.closedAt,
      netNis: net,
    });
  }

  rows.sort((a, b) => {
    const ta = a.closedAt?.getTime() ?? 0;
    const tb = b.closedAt?.getTime() ?? 0;
    return ta - tb;
  });

  return { lifetimeNis: lifetime, rows };
}
