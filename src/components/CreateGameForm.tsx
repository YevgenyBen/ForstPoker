"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { createGame } from "@/actions/games";

export function CreateGameForm() {
  const t = useTranslations("games");
  const [utcIso, setUtcIso] = useState("");

  return (
    <form action={createGame} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--fp-ink)]">
        <span>{t("scheduledStart")}</span>
        <input
          type="datetime-local"
          required
          className="min-h-11 rounded-xl border border-[var(--fp-wood-mid)]/35 bg-white px-3 py-2 text-[var(--fp-ink)] shadow-inner"
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              setUtcIso("");
              return;
            }
            const d = new Date(v);
            if (!Number.isNaN(d.getTime())) setUtcIso(d.toISOString());
          }}
        />
      </label>
      <input type="hidden" name="scheduled_start_utc" value={utcIso} />
      <label className="flex flex-col gap-1 text-sm font-medium text-[var(--fp-ink)]">
        <span>{t("gameNotes")}</span>
        <textarea
          name="notes"
          rows={3}
          dir="auto"
          className="min-h-[5rem] rounded-xl border border-[var(--fp-wood-mid)]/35 bg-white px-3 py-2 text-[var(--fp-ink)] shadow-inner"
        />
      </label>
      <button
        type="submit"
        disabled={!utcIso}
        className="min-h-11 rounded-xl bg-[var(--fp-moss)] px-6 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        {t("submitCreate")}
      </button>
    </form>
  );
}
