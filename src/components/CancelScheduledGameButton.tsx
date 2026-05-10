"use client";

import { useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cancelScheduledGame } from "@/actions/games";

type Props = {
  gameId: string;
  compact?: boolean;
};

export function CancelScheduledGameButton({ gameId, compact }: Props) {
  const t = useTranslations("games");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t("cancelGameConfirm"))) return;
    setLoading(true);
    setError(null);
    const res = await cancelScheduledGame(gameId);
    setLoading(false);
    if ("error" in res) {
      if (res.error === "forbidden") setError(t("cancelGameForbidden"));
      else if (res.error === "not_found") setError(t("cancelGameNotFound"));
      else if (res.error === "bad_state") setError(t("cancelGameBadState"));
      else setError(t("cancelGameFailed"));
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
        onClick={handleCancel}
        disabled={loading}
        className={
          compact
            ? "min-h-9 shrink-0 rounded-lg border-2 border-[var(--fp-loss)] bg-[var(--fp-loss)]/15 px-3 py-1.5 text-sm font-semibold text-[var(--fp-loss)] disabled:opacity-50"
            : "min-h-11 shrink-0 rounded-xl border-2 border-[var(--fp-loss)] bg-[var(--fp-loss)]/15 px-4 font-semibold text-[var(--fp-loss)] disabled:opacity-50"
        }
      >
        {t("cancelGameShort")}
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
