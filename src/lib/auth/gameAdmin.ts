/**
 * Comma-separated emails in GAME_ADMIN_EMAIL may delete any game (destructive).
 */
export function getGameAdminEmails(): Set<string> {
  const raw = process.env.GAME_ADMIN_EMAIL ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function canDeleteGames(email: string | null | undefined): boolean {
  if (!email) return false;
  return getGameAdminEmails().has(email.trim().toLowerCase());
}
