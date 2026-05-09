import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";
import { getViewer } from "@/lib/auth/session";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const v = await getViewer();
  if (v.kind === "member") redirect(`/${locale}/games`);
  if (v.kind === "needs_onboarding") redirect(`/${locale}/onboarding`);
  await getTranslations("auth");

  return (
    <main className="flex flex-1 flex-col justify-center py-8">
      <LoginForm />
    </main>
  );
}
