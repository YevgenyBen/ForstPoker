import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getGameDetail } from "@/actions/games";
import { getViewer } from "@/lib/auth/session";
import { canDeleteGames } from "@/lib/auth/gameAdmin";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { JoinGameButton } from "@/components/JoinGameButton";
import { GameLedgerForm } from "@/components/GameLedgerForm";
import { CloseGameButton } from "@/components/CloseGameButton";
import { CancelScheduledGameButton } from "@/components/CancelScheduledGameButton";
import { DeleteGameButton } from "@/components/DeleteGameButton";
import { OpenGameButton } from "@/components/OpenGameButton";
import { LocationWazeLink } from "@/components/LocationWazeLink";
import { GameRsvpPanel } from "@/components/GameRsvpPanel";
import {
  formatDateDdMmYyyy,
  formatDateTimeDdMmYyyyHm,
} from "@/lib/formatDate";

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

  const {
    game,
    members,
    ledger,
    bankNis,
    settlements,
    closerName,
    isMember,
    initiatorUsername,
    initiatorLocation,
    rsvp,
    myRsvp,
  } = detail;
  const isScheduled = game.status === "scheduled";
  const canDeleteGame =
    v.kind === "member" && canDeleteGames(v.user.email);
  const canCancelScheduled =
    v.kind === "member" &&
    isScheduled &&
    (game.createdBy === v.user.id || canDeleteGames(v.user.email));
  const t = await getTranslations("games");

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
            {game.status === "scheduled"
              ? t("statusScheduled")
              : game.status === "open"
                ? t("statusOpen")
                : t("statusClosed")}
            {game.status === "scheduled" && game.scheduledStartAt
              ? ` · ${formatDateDdMmYyyy(game.scheduledStartAt)}`
              : game.status !== "scheduled"
                ? ` · ${formatDateTimeDdMmYyyyHm(game.createdAt)}`
                : ""}
          </p>
        </div>
        <LocaleSwitcher />
      </header>

      {isScheduled && (
        <section className="space-y-2 rounded-xl border border-[var(--fp-brass)]/35 bg-[var(--fp-brass)]/8 p-4 text-sm">
          <p dir="auto">
            <span className="font-semibold text-[var(--fp-ink)]">{t("hostLabel")}: </span>
            {initiatorUsername}
          </p>
          {game.notes?.trim() ? (
            <p className="text-[var(--fp-ink)]" dir="auto">
              {game.notes}
            </p>
          ) : null}
          <p dir="auto">
            <span className="font-semibold text-[var(--fp-ink)]">{t("locationShort")}: </span>
            <LocationWazeLink
              address={game.location?.trim() || initiatorLocation?.trim() || ""}
              openInWazeLabel={t("openInWaze")}
            />
          </p>
        </section>
      )}

      {isScheduled && rsvp && (
        <>
          <GameRsvpPanel gameId={gameId} myRsvp={myRsvp} />

          {(isMember || canCancelScheduled) && (
            <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--fp-wood-mid)]/25 bg-[var(--fp-panel)] p-4">
              <div className="flex flex-wrap items-center gap-3">
                {isMember && <OpenGameButton gameId={gameId} />}
              </div>
              {canCancelScheduled && (
                <div className="ms-auto shrink-0">
                  <CancelScheduledGameButton gameId={gameId} />
                </div>
              )}
            </section>
          )}

          <section className="space-y-4">
            <h2 className="font-semibold text-[var(--fp-ink)]">{t("rsvpPlayersHeading")}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--fp-win)]/35 bg-[var(--fp-win)]/6 p-3">
                <h3 className="mb-2 text-sm font-semibold text-[var(--fp-win)]">
                  {t("rsvpComingList")}
                </h3>
                {rsvp.yes.length === 0 ? (
                  <p className="text-sm text-[var(--fp-secondary)]">{t("rsvpEmptyColumn")}</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {rsvp.yes.map((p) => (
                      <li key={p.userId} dir="auto">
                        {p.username}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-[var(--fp-brass)]/35 bg-[var(--fp-brass)]/8 p-3">
                <h3 className="mb-2 text-sm font-semibold text-[var(--fp-brass)]">
                  {t("rsvpMaybeList")}
                </h3>
                {rsvp.maybe.length === 0 ? (
                  <p className="text-sm text-[var(--fp-secondary)]">{t("rsvpEmptyColumn")}</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {rsvp.maybe.map((p) => (
                      <li key={p.userId} dir="auto">
                        {p.username}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-[var(--fp-wood-mid)]/35 bg-[var(--fp-parchment)]/40 p-3">
                <h3 className="mb-2 text-sm font-semibold text-[var(--fp-secondary)]">
                  {t("rsvpNotList")}
                </h3>
                {rsvp.no.length === 0 ? (
                  <p className="text-sm text-[var(--fp-secondary)]">{t("rsvpEmptyColumn")}</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {rsvp.no.map((p) => (
                      <li key={p.userId} dir="auto">
                        {p.username}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {!isScheduled && (
        <>
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
                  <span className="text-[var(--fp-secondary)]">
                    {formatDateTimeDdMmYyyyHm(m.joinedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="rounded-xl border border-[var(--fp-brass)]/35 bg-[var(--fp-parchment)]/45 px-4 py-3 shadow-sm"
            aria-label={t("bankAria")}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[var(--fp-ink)]">{t("bank")}</span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  bankNis >= 0 ? "text-[var(--fp-moss)]" : "text-[var(--fp-loss)]"
                }`}
                dir="ltr"
              >
                {money(bankNis)}
              </span>
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-[var(--fp-ink)]">{t("ledger")}</h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--fp-wood-mid)]/25">
              {ledger.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm italic text-[var(--fp-secondary)]">
                  {t("ledgerEmpty")}
                </p>
              ) : (
                <table className="w-full min-w-[320px] text-sm">
                  <thead className="bg-[var(--fp-parchment)] text-[var(--fp-ink)]">
                    <tr>
                      <th className="px-2 py-2 text-start font-semibold">{t("members")}</th>
                      <th className="px-2 py-2 text-start font-semibold">type</th>
                      <th className="px-2 py-2 text-end font-semibold">{t("amountNis")}</th>
                      <th className="px-2 py-2 text-start font-semibold">time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((row) => (
                      <tr key={row.id} className="border-t border-[var(--fp-wood-mid)]/15">
                        <td className="px-2 py-2" dir="auto">
                          {row.username}
                        </td>
                        <td className="px-2 py-2">
                          {row.kind === "buy_in" ? t("buyIn") : t("ledgerBuyOut")}
                        </td>
                        <td className="px-2 py-2 text-end tabular-nums" dir="ltr">
                          {money(row.amountNis)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-[var(--fp-secondary)]">
                          {formatDateTimeDdMmYyyyHm(row.recordedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {game.status === "open" && isMember && (
            <GameLedgerForm gameId={gameId} />
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
        </>
      )}

      {canDeleteGame && !isScheduled && (
        <section className="rounded-xl border border-[var(--fp-loss)]/35 bg-[var(--fp-loss)]/5 p-4">
          <p className="mb-3 text-sm leading-snug text-[var(--fp-loss)]">
            {t("deleteGameWarning")}
          </p>
          <DeleteGameButton gameId={gameId} />
        </section>
      )}
    </main>
  );
}
