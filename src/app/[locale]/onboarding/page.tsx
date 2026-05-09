import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { completeOnboarding } from "@/actions/onboarding";
import { getAppUser } from "@/lib/auth/session";
import { verifySessionCookie } from "@/lib/auth/session";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await verifySessionCookie();
  if (!session) {
    redirect(`/${locale}/login`);
  }
  const existing = await getAppUser();
  if (existing) {
    redirect(`/${locale}/games`);
  }

  const t = await getTranslations("onboarding");

  return (
    <main className="flex flex-1 flex-col gap-6 py-6">
      <div className="flex justify-end">
        <LocaleSwitcher />
      </div>
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--fp-wood-dark)]">{t("subtitle")}</p>
      </div>

      <form action={completeOnboarding} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            username
          </label>
          <input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={32}
            className="w-full rounded-lg border border-[var(--fp-wood-mid)]/40 bg-[var(--fp-panel)] px-3 py-2"
            dir="auto"
            autoComplete="username"
          />
        </div>
        <button
          type="submit"
          className="w-full min-h-11 rounded-xl bg-[var(--fp-moss)] font-semibold text-white"
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
