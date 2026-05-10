"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setGameRsvp } from "@/actions/games";

type Rsvp = "yes" | "maybe" | "no";

export function GameRsvpPanel({
  gameId,
  myRsvp,
}: {
  gameId: string;
  myRsvp: Rsvp | null;
}) {
  const router = useRouter();
  const t = useTranslations("games");

  async function pick(status: Rsvp) {
    const r = await setGameRsvp(gameId, status);
    if (r.ok) router.refresh();
  }

  function btnClass(active: boolean) {
    return `min-h-11 flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
      active
        ? "bg-[var(--fp-moss)] text-white shadow-md"
        : "border border-[var(--fp-wood-mid)]/40 bg-[var(--fp-field-bg)] text-[var(--fp-ink)] hover:bg-[var(--fp-parchment)]"
    }`;
  }

  return (
    <section className="rounded-xl border border-[var(--fp-wood-mid)]/25 bg-[var(--fp-panel)] p-4">
      <h2 className="mb-3 font-semibold text-[var(--fp-ink)]">{t("rsvpYourPick")}</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btnClass(myRsvp === "yes")}
          onClick={() => void pick("yes")}
        >
          {t("rsvpCall")}
        </button>
        <button
          type="button"
          className={btnClass(myRsvp === "maybe")}
          onClick={() => void pick("maybe")}
        >
          {t("rsvpCheck")}
        </button>
        <button
          type="button"
          className={btnClass(myRsvp === "no")}
          onClick={() => void pick("no")}
        >
          {t("rsvpFold")}
        </button>
      </div>
    </section>
  );
}
