"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { joinGame } from "@/actions/games";

type Props = {
  gameId: string;
};

export function JoinGameButton({ gameId }: Props) {
  const t = useTranslations("games");
  const router = useRouter();

  async function handleJoin() {
    await joinGame(gameId);
    router.refresh();
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
