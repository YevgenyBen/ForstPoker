"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { addLedgerEntry } from "@/actions/games";

type Props = {
  gameId: string;
};

export function GameLedgerForm({ gameId }: Props) {
  const t = useTranslations("games");
  const router = useRouter();
  const [kind, setKind] = useState<"buy_in" | "buy_out">("buy_in");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const n = parseInt(amount, 10);
    if (!Number.isFinite(n) || n < 1) {
      setError("invalid");
      setLoading(false);
      return;
    }
    const res = await addLedgerEntry({
      gameId,
      kind,
      amountNis: n,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-[var(--fp-wood-mid)]/25 bg-[var(--fp-parchment)]/40 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setKind("buy_in")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            kind === "buy_in"
              ? "bg-[var(--fp-moss)] text-white"
              : "bg-white/90 text-neutral-900 shadow-sm"
          }`}
        >
          {t("buyIn")}
        </button>
        <button
          type="button"
          onClick={() => setKind("buy_out")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            kind === "buy_out"
              ? "bg-[var(--fp-felt)] text-white"
              : "bg-white/90 text-neutral-900 shadow-sm"
          }`}
        >
          {t("buyOut")}
        </button>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--fp-ink)]">{t("amountNis")}</label>
        <input
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={loading}
          className="w-full rounded-lg border border-[var(--fp-wood-mid)]/40 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-500"
          dir="ltr"
        />
      </div>
      {error && (
        <p className="rounded-lg border border-[var(--fp-loss)]/40 bg-[var(--fp-loss)]/12 px-3 py-2 text-sm font-medium text-[var(--fp-loss)]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-11 rounded-xl bg-[var(--fp-moss)] font-semibold text-white shadow-sm disabled:opacity-50"
      >
        {t("addEntry")}
      </button>
    </form>
  );
}
