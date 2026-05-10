import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getViewer } from "@/lib/auth/session";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { PlayerProfileForm } from "@/components/PlayerProfileForm";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const v = await getViewer();
  if (v.kind === "guest") redirect(`/${locale}/login`);
  if (v.kind === "needs_onboarding") redirect(`/${locale}/onboarding`);

  const user = v.user;
  const t = await getTranslations("player");

  return (
    <main className="flex flex-1 flex-col gap-6 pb-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fp-ink)]">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--fp-secondary)]">{t("subtitle")}</p>
        </div>
        <LocaleSwitcher />
      </header>

      <section className="rounded-2xl border border-[var(--fp-wood-mid)]/30 bg-[var(--fp-panel)] p-4 shadow-sm">
        <PlayerProfileForm
          key={`${user.username}|${user.location ?? ""}`}
          initialUsername={user.username}
          initialLocation={user.location ?? ""}
        />
      </section>
    </main>
  );
}
