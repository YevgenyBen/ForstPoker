import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getGameDetail } from "@/actions/games";
import { getViewer } from "@/lib/auth/session";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { JoinGameButton } from "@/components/JoinGameButton";
import { GameLedgerForm } from "@/components/GameLedgerForm";
import { CloseGameButton } from "@/components/CloseGameButton";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ locale: string; gameId: string }>;
}) {
  const { locale, gameId } = await params;
  const v = await getViewer();
  if (v.kind === "guest") redirect(`/${locale}/login`);
  if (v.kind === "needs_onboarding") redirect(`/${locale}/onboarding`);

  const detail = await getGameDetail(gameId);
  if (!detail) notFound();

  const { game, members, ledger, settlements, closerName, isMember } = detail;
  const t = await getTranslations("games");

  const tf = (d: Date) =>
    new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);

  const money = (n: number) =>
    new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
      style: "currency",
      currency: "ILS",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <main className="flex flex-1 flex-col gap-6 pb-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link
            href={`/${locale}/games`}
            className="text-sm font-medium text-[var(--fp-brass)] underline decoration-[var(--fp-brass)]/70 underline-offset-[5px] hover:brightness-110"
          >
            ← {t("title")}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-[var(--fp-ink)]" dir="auto">
            {game.title}
          </h1>
          <p className="text-sm text-[var(--fp-secondary)]">
            {game.status === "open" ? t("statusOpen") : t("statusClosed")} ·{" "}
            {tf(game.createdAt)}
          </p>
        </div>
        <LocaleSwitcher />
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--fp-wood-mid)]/25 bg-[var(--fp-panel)] p-4">
        <JoinGameButton gameId={gameId} isMember={isMember} />
        {!isMember && (
          <p className="text-sm text-[var(--fp-secondary)]">{t("nonMemberHint")}</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-[var(--fp-ink)]">{t("members")}</h2>
        <ul className="space-y-1 rounded-xl bg-[var(--fp-parchment)]/50 p-3">
          {members.map((m) => (
            <li key={m.userId} className="flex justify-between text-sm" dir="auto">
              <span>{m.username}</span>
              <span className="text-[var(--fp-secondary)]">{tf(m.joinedAt)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-[var(--fp-ink)]">{t("ledger")}</h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--fp-wood-mid)]/25">
          <table className="w-full min-w-[320px] text-sm">
            <thead className="bg-[var(--fp-parchment)] text-[var(--fp-ink)]">
              <tr>
                <th className="px-2 py-2 text-start font-semibold">{t("members")}</th>
                <th className="px-2 py-2 text-start font-semibold">type</th>
                <th className="px-2 py-2 text-end font-semibold">{t("amountNis")}</th>
                <th className="px-2 py-2 text-start font-semibold">{t("note")}</th>
                <th className="px-2 py-2 text-start font-semibold">time</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((row) => (
                <tr key={row.id} className="border-t border-[var(--fp-wood-mid)]/15">
                  <td className="px-2 py-2" dir="auto">
                    {row.username}
                  </td>
                  <td className="px-2 py-2">{row.kind}</td>
                  <td className="px-2 py-2 text-end tabular-nums" dir="ltr">
                    {money(row.amountNis)}
                  </td>
                  <td className="max-w-[120px] truncate px-2 py-2" dir="auto">
                    {row.note ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-[var(--fp-secondary)]">
                    {tf(row.recordedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {game.status === "open" && (
        <GameLedgerForm gameId={gameId} disabled={!isMember} />
      )}

      {game.status === "open" && isMember && (
        <CloseGameButton gameId={gameId} />
      )}

      {game.status === "closed" && (
        <section>
          <h2 className="mb-2 font-semibold text-[var(--fp-ink)]">{t("settlements")}</h2>
          {settlements.length === 0 ? (
            <p className="text-sm text-[var(--fp-secondary)]">—</p>
          ) : (
            <ul className="space-y-2">
              {settlements.map((s, i) => (
                <li
                  key={`${s.fromUserId}-${s.toUserId}-${i}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--fp-parchment)]/60 px-3 py-2 text-sm"
                >
                  <span dir="auto">
                    <strong>{s.fromName}</strong> {t("from")} →{" "}
                    <strong>{s.toName}</strong>
                  </span>
                  <span className="tabular-nums font-semibold" dir="ltr">
                    {money(s.amountNis)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {closerName && (
            <p className="mt-2 text-sm text-[var(--fp-secondary)]">
              {t("closedBy")}: <span dir="auto">{closerName}</span>
            </p>
          )}
        </section>
      )}
    </main>
  );
}
