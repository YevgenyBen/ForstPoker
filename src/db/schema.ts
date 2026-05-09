import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const gameStatusEnum = pgEnum("game_status", ["open", "closed"]);
export const ledgerKindEnum = pgEnum("ledger_kind", ["buy_in", "buy_out"]);

export const appUsers = pgTable(
  "app_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firebaseUid: text("firebase_uid").notNull().unique(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    preferredLocale: text("preferred_locale"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("app_users_username_lower_idx").on(sql`lower(${t.username})`),
  ]
);

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  status: gameStatusEnum("status").notNull().default("open"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => appUsers.id),
  closedBy: uuid("closed_by").references(() => appUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const gameMembers = pgTable(
  "game_members",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.userId] })]
);

export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  kind: ledgerKindEnum("kind").notNull(),
  amountNis: integer("amount_nis").notNull(),
  note: text("note"),
  recordedAt: timestamp("recorded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => appUsers.id),
  toUserId: uuid("to_user_id")
    .notNull()
    .references(() => appUsers.id),
  amountNis: integer("amount_nis").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
