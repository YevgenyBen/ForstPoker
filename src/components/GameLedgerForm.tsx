"use client";



import { useState } from "react";

import { useTranslations } from "next-intl";

import { addLedgerEntry } from "@/actions/games";

import { useActionRefresh } from "@/hooks/useActionRefresh";

import { Spinner } from "@/components/Spinner";



type Props = {

  gameId: string;

};



export function GameLedgerForm({ gameId }: Props) {

  const t = useTranslations("games");

  const tCommon = useTranslations("common");

  const { pending, run } = useActionRefresh();

  const [kind, setKind] = useState<"buy_in" | "buy_out">("buy_in");

  const [amount, setAmount] = useState("");

  const [error, setError] = useState<string | null>(null);



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setError(null);

    const n = parseInt(amount, 10);

    if (!Number.isFinite(n) || n < 1) {

      setError("invalid");

      return;

    }

    await run(async () => {

      const res = await addLedgerEntry({

        gameId,

        kind,

        amountNis: n,

      });

      if (res.error) {

        setError(res.error);

        return false;

      }

      setAmount("");

      return true;

    });

  }



  return (

    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-[var(--fp-wood-mid)]/25 bg-[var(--fp-parchment)]/40 p-4">

      <div className="flex gap-2">

        <button

          type="button"

          onClick={() => setKind("buy_in")}

          disabled={pending}

          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 ${

            kind === "buy_in"

              ? "bg-[var(--fp-moss)] text-white"

              : "border border-[var(--fp-wood-mid)]/35 bg-[var(--fp-field-bg)] text-[var(--fp-ink)] shadow-sm"

          }`}

        >

          {t("buyIn")}

        </button>

        <button

          type="button"

          onClick={() => setKind("buy_out")}

          disabled={pending}

          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50 ${

            kind === "buy_out"

              ? "bg-[var(--fp-felt)] text-white"

              : "border border-[var(--fp-wood-mid)]/35 bg-[var(--fp-field-bg)] text-[var(--fp-ink)] shadow-sm"

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

          disabled={pending}

          className="fp-field w-full rounded-lg border border-[var(--fp-wood-mid)]/40 px-3 py-2"

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

        disabled={pending}

        className="flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fp-moss)] font-semibold text-white shadow-sm disabled:opacity-50"

      >

        {pending && <Spinner className="size-4 text-white" />}

        {pending ? tCommon("loading") : t("addEntry")}

      </button>

    </form>

  );

}

