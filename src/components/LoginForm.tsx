"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useLocale, useTranslations } from "next-intl";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function establishSession() {
    const auth = getFirebaseAuth();
    const idToken = await auth.currentUser?.getIdToken(true);
    if (!idToken) throw new Error("no_token");
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("session");
    const me = await fetch("/api/me").then((r) => r.json());
    if (!me.user) {
      router.push(`/${locale}/onboarding`);
    } else {
      router.push(`/${locale}/games`);
    }
    router.refresh();
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      await establishSession();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await establishSession();
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!email) {
      setError(t("errors.generic"));
      return;
    }
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      alert("Check your email for reset instructions.");
    } catch {
      setError(t("errors.generic"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6 rounded-2xl border border-[var(--fp-wood-mid)]/30 bg-[var(--fp-panel)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{t("signIn")}</h1>
        <LocaleSwitcher />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full min-h-11 items-center justify-center rounded-xl border border-[var(--fp-wood-mid)] bg-white px-4 font-medium text-[var(--fp-ink)]"
      >
        {t("google")}
      </button>

      <div className="relative text-center text-xs text-[var(--fp-wood-dark)]">
        <span className="bg-[var(--fp-panel)] px-2">or email</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-[var(--fp-parchment)]" />
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">{t("email")}</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--fp-wood-mid)]/40 bg-white px-3 py-2 text-[var(--fp-ink)]"
            dir="ltr"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t("password")}</label>
          <input
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-[var(--fp-wood-mid)]/40 bg-white px-3 py-2 text-[var(--fp-ink)]"
            dir="ltr"
          />
        </div>
        {error && <p className="text-sm text-[var(--fp-loss)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-11 rounded-xl bg-[var(--fp-moss)] font-semibold text-white"
        >
          {mode === "register" ? t("signUp") : t("signIn")}
        </button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "register" : "signin")}
          className="text-[var(--fp-felt)] underline"
        >
          {mode === "signin" ? t("needAccount") : t("haveAccount")}
        </button>
        {mode === "signin" && (
          <button
            type="button"
            onClick={handleForgot}
            className="text-[var(--fp-wood-dark)] underline"
          >
            {t("forgot")}
          </button>
        )}
      </div>
    </div>
  );
}
