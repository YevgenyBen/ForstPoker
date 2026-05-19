"use client";

import { useTranslations } from "next-intl";
import { joinGame } from "@/actions/games";
import { useActionRefresh } from "@/hooks/useActionRefresh";
import { Spinner } from "@/components/Spinner";

type Props = {
  gameId: string;
};

export function JoinGameButton({ gameId }: Props) {
  const t = useTranslations("games");
  const tCommon = useTranslations("common");
  const { pending, run } = useActionRefresh();

  async function handleJoin() {
    await run(async () => {
      await joinGame(gameId);
      return true;
    });
  }

  return (
    <button
      type="button"
      onClick={() => void handleJoin()}
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fp-moss)] px-4 py-2 font-semibold text-white disabled:opacity-50"
    >
      {pending && <Spinner className="size-4 text-white" />}
      {pending ? tCommon("loading") : t("join")}
    </button>
  );
}
