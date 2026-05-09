"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { closeGame } from "@/actions/games";

type Props = {
  gameId: string;
  disabled?: boolean;
};

export function CloseGameButton({ gameId, disabled }: Props) {
  const t = useTranslations("games");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClose() {
    if (!confirm(t("closeConfirm"))) return;
    setLoading(true);
    setError(null);
    const res = await closeGame(gameId);
    setLoading(false);
    if (res.error === "bad_balance") setError(t("balanceError"));
    else if (res.error === "already_closed") setError(t("alreadyClosed"));
    else if (res.error) setError(res.error);
    else router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClose}
        disabled={disabled || loading}
        className="w-full min-h-11 rounded-xl border-2 border-[var(--fp-loss)] bg-transparent font-semibold text-[var(--fp-loss)] disabled:opacity-50"
      >
        {t("closeGame")}
      </button>
      {error && <p className="text-sm text-[var(--fp-loss)]">{error}</p>}
    </div>
  );
}
