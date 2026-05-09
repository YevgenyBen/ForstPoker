"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { joinGame } from "@/actions/games";

type Props = {
  gameId: string;
  isMember: boolean;
};

export function JoinGameButton({ gameId, isMember }: Props) {
  const t = useTranslations("games");
  const router = useRouter();

  async function handleJoin() {
    await joinGame(gameId);
    router.refresh();
  }

  if (isMember) {
    return (
      <span className="inline-flex rounded-lg bg-[var(--fp-sage)] px-3 py-1 text-sm font-medium text-[var(--fp-pine)]">
        {t("joined")}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleJoin}
      className="rounded-xl bg-[var(--fp-moss)] px-4 py-2 font-semibold text-white"
    >
      {t("join")}
    </button>
  );
}
