import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createGame, listGames } from "@/actions/games";
import { getViewer } from "@/lib/auth/session";
import { canDeleteGames } from "@/lib/auth/gameAdmin";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { DeleteGameButton } from "@/components/DeleteGameButton";

type ListedGame = {
  id: string;
  title: string;
  createdAt: Date;
};

function GameListRow({
  g,
  locale,
  tf,
  variant,
  showGameDelete,
  statusText,
}: {
  g: ListedGame;
  locale: string;
  tf: (d: Date) => string;
  variant: "open" | "closed";
  showGameDelete: boolean;
  statusText: string;
}) {
  const rowClass =
    variant === "open"
      ? "flex items-stretch gap-2 rounded-xl border-2 border-[var(--fp-win)] bg-[var(--fp-panel)] transition hover:bg-[var(--fp-win)]/8"
      : "flex items-stretch gap-2 rounded-xl border-2 border-[var(--fp-wood-mid)]/25 bg-[var(--fp-panel)] transition hover:bg-[var(--fp-parchment)]";
  const statusClass =
    variant === "open" ? "text-[var(--fp-win)]" : "text-[var(--fp-secondary)]";

  return (
    <li>
      <div className={rowClass}>
        <Link
          href={`/${locale}/games/${g.id}`}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3"
        >
          <span className="font-medium" dir="auto">
            {g.title}
          </span>
          <span className="flex shrink-0 items-center gap-2 text-sm">
            <span className={statusClass}>{statusText}</span>
            <span className="text-[var(--fp-secondary)]">{tf(g.createdAt)}</span>
          </span>
        </Link>
        {showGameDelete && (
          <div className="flex shrink-0 items-center border-s border-[var(--fp-wood-mid)]/20 px-2 py-2">
            <DeleteGameButton gameId={g.id} compact />
          </div>
        )}
      </div>
    </li>
  );
}

export default async function GamesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const v = await getViewer();
  if (v.kind === "guest") redirect(`/${locale}/login`);
  if (v.kind === "needs_onboarding") redirect(`/${locale}/onboarding`);
  const user = v.user;

  const games = await listGames();
  const openGames = games.filter((g) => g.status === "open");
  const closedGames = games.filter((g) => g.status === "closed");
  const t = await getTranslations("games");
  const showGameDelete = canDeleteGames(user.email);
  const tf = (d: Date) =>
    new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fp-ink)]">{t("title")}</h1>
          <p className="text-sm text-[var(--fp-secondary)]" dir="auto">
            {user.username}
          </p>
        </div>
        <LocaleSwitcher />
      </header>

      <section className="rounded-2xl border border-[var(--fp-wood-mid)]/30 bg-[var(--fp-panel)] p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-[var(--fp-ink)]">{t("create")}</h2>
        <form action={createGame}>
          <button
            type="submit"
            className="min-h-11 rounded-xl bg-[var(--fp-moss)] px-6 font-semibold text-white"
          >
            {t("submitCreate")}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-[var(--fp-ink)]">{t("title")}</h2>
        {games.length === 0 ? (
          <p className="rounded-xl bg-[var(--fp-parchment)]/60 px-4 py-8 text-center text-[var(--fp-secondary)]">
            {t("empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {openGames.length > 0 && (
              <ul className="space-y-2">
                {openGames.map((g) => (
                  <GameListRow
                    key={g.id}
                    g={g}
                    locale={locale}
                    tf={tf}
                    variant="open"
                    showGameDelete={showGameDelete}
                    statusText={t("statusOpen")}
                  />
                ))}
              </ul>
            )}
            {closedGames.length > 0 && (
              <ul className="space-y-2">
                {closedGames.map((g) => (
                  <GameListRow
                    key={g.id}
                    g={g}
                    locale={locale}
                    tf={tf}
                    variant="closed"
                    showGameDelete={showGameDelete}
                    statusText={t("statusClosed")}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
