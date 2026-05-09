import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";
import { getAppUser } from "@/lib/auth/session";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getAppUser();
  if (user) {
    redirect(`/${locale}/games`);
  }
  await getTranslations("auth");

  return (
    <main className="flex flex-1 flex-col justify-center py-8">
      <LoginForm />
    </main>
  );
}
