"use client";

import { useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { deleteGame } from "@/actions/games";

type Props = {
  gameId: string;
  /** Inline row on games list */
  compact?: boolean;
};

export function DeleteGameButton({ gameId, compact }: Props) {
  const t = useTranslations("games");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("deleteGameConfirm"))) return;
    setLoading(true);
    setError(null);
    const res = await deleteGame(gameId);
    setLoading(false);
    if ("error" in res) {
      if (res.error === "forbidden") setError(t("deleteGameForbidden"));
      else if (res.error === "not_found") setError(t("deleteGameNotFound"));
      else setError(t("deleteGameFailed"));
      return;
    }
    router.refresh();
    if (pathname?.includes(`/games/${gameId}`)) {
      router.push(`/${locale}/games`);
    }
  }

  return (
    <div className={compact ? "flex flex-col items-end gap-1" : "space-y-2"}>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className={
          compact
            ? "min-h-9 shrink-0 rounded-lg border-2 border-[var(--fp-loss)] bg-[var(--fp-loss)]/15 px-3 py-1.5 text-sm font-semibold text-[var(--fp-loss)] disabled:opacity-50"
            : "w-full min-h-11 rounded-xl border-2 border-[var(--fp-loss)] bg-[var(--fp-loss)]/15 font-semibold text-[var(--fp-loss)] disabled:opacity-50"
        }
      >
        {compact ? t("deleteGameShort") : t("deleteGame")}
      </button>
      {error && (
        <p
          className={`rounded-lg border border-[var(--fp-loss)]/40 bg-[var(--fp-loss)]/12 font-medium text-[var(--fp-loss)] ${compact ? "max-w-[min(100%,14rem)] px-2 py-1 text-xs" : "px-3 py-2 text-sm"}`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
