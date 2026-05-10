"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { openGame } from "@/actions/games";

export function OpenGameButton({ gameId }: { gameId: string }) {
  const t = useTranslations("games");
  const router = useRouter();

  async function handle() {
    const r = await openGame(gameId);
    if (r.ok) router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handle()}
      className="rounded-xl bg-[var(--fp-moss)] px-4 py-2 font-semibold text-white"
    >
      {t("openTable")}
    </button>
  );
}
