import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAppUser } from "@/lib/auth/session";
import { verifySessionCookie } from "@/lib/auth/session";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { OnboardingForm } from "@/components/OnboardingForm";

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

      <div className="mx-auto w-full max-w-sm rounded-2xl border border-[var(--fp-wood-mid)]/30 bg-[var(--fp-panel)] p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold leading-tight text-[var(--fp-ink)]">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--fp-secondary)]">
            {t("subtitle")}
          </p>
        </div>

        <OnboardingForm />
      </div>
    </main>
  );
}
