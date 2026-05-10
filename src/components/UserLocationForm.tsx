"use client";

import { useTranslations } from "next-intl";
import { updateMyLocation } from "@/actions/games";

type Props = {
  initialLocation: string | null;
};

export function UserLocationForm({ initialLocation }: Props) {
  const t = useTranslations("games");

  return (
    <form action={updateMyLocation} className="flex flex-col gap-2 rounded-2xl border border-[var(--fp-wood-mid)]/25 bg-[var(--fp-panel)] p-4">
      <div>
        <h3 className="font-semibold text-[var(--fp-ink)]">{t("defaultLocationTitle")}</h3>
        <p className="mt-1 text-sm text-[var(--fp-secondary)]">{t("defaultLocationHint")}</p>
      </div>
      <textarea
        name="location"
        rows={2}
        dir="auto"
        placeholder=""
        defaultValue={initialLocation ?? ""}
        className="min-h-[4.5rem] w-full rounded-xl border border-[var(--fp-wood-mid)]/35 bg-white px-3 py-2 text-sm text-[var(--fp-ink)] shadow-inner"
      />
      <button
        type="submit"
        className="min-h-10 self-start rounded-xl bg-[var(--fp-brass)] px-4 text-sm font-semibold text-[var(--fp-ink)] hover:brightness-105"
      >
        {t("saveLocation")}
      </button>
    </form>
  );
}
