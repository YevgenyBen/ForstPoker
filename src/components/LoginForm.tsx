"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useLocale, useTranslations } from "next-intl";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isIdeEmbeddedPreview } from "@/lib/auth/oauthEnvironment";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

const GOOGLE_OAUTH_FLAG = "fp_google_oauth_pending";

function authErrorToMessage(
  e: unknown,
  t: (key: string) => string
): string {
  const code =
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "string"
      ? (e as { code: string }).code
      : undefined;
  switch (code) {
    case "auth/email-already-in-use":
      return t("errors.emailInUse");
    case "auth/weak-password":
      return t("errors.weakPassword");
    case "auth/invalid-email":
      return t("errors.invalidEmail");
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return t("errors.invalidCredentials");
    case "auth/too-many-requests":
      return t("errors.tooManyRequests");
    case "auth/network-request-failed":
      return t("errors.network");
    default:
      return t("errors.generic");
  }
}

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [embeddedPreview, setEmbeddedPreview] = useState(false);
  const establishingRef = useRef(false);

  useEffect(() => {
    setEmbeddedPreview(isIdeEmbeddedPreview());
  }, []);

  const establishSession = useCallback(async () => {
    const auth = getFirebaseAuth();
    const idToken = await auth.currentUser?.getIdToken(true);
    if (!idToken) throw new Error("no_token");
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });
    const raw = await res.text();
    let payload: { error?: string; ok?: boolean } = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error(`session_http_${res.status}`);
    }
    if (!res.ok) {
      throw new Error(payload.error ?? `session_${res.status}`);
    }
    const me = (await fetch("/api/me", { credentials: "include" }).then((r) =>
      r.json()
    )) as {
      user: unknown;
      hasSession?: boolean;
    };
    if (me.user) {
      router.push(`/${locale}/games`);
    } else if (me.hasSession) {
      router.push(`/${locale}/onboarding`);
    } else {
      throw new Error("session_not_persisted");
    }
    router.refresh();
  }, [locale, router]);

  /** After OAuth redirect or restored Firebase user: mint __session if missing. */
  const syncServerSessionIfNeeded = useCallback(async () => {
    if (establishingRef.current) return;
    const auth = getFirebaseAuth();
    establishingRef.current = true;
    try {
      await auth.authStateReady();
      if (!auth.currentUser) return;

      const me = (await fetch("/api/me", { credentials: "include" }).then((r) =>
        r.json()
      )) as { user?: unknown; hasSession?: boolean };

      if (me.user || me.hasSession) {
        sessionStorage.removeItem(GOOGLE_OAUTH_FLAG);
        return;
      }

      setLoading(true);
      setError(null);
      await establishSession();
      sessionStorage.removeItem(GOOGLE_OAUTH_FLAG);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "";
      setError(
        msg && msg !== "session_failed"
          ? `${t("errors.generic")} (${msg})`
          : t("errors.generic")
      );
    } finally {
      establishingRef.current = false;
      setLoading(false);
    }
  }, [establishSession, t]);

  /** Complete redirect OAuth state, then sync cookie if Firebase user exists without server session. */
  useEffect(() => {
    const auth = getFirebaseAuth();
    let cancelled = false;

    const run = async () => {
      try {
        await getRedirectResult(auth);
      } catch (e) {
        console.error(e);
      }
      if (cancelled) return;
      await syncServerSessionIfNeeded();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [syncServerSessionIfNeeded]);

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
    } catch (e) {
      console.error(e);
      setError(authErrorToMessage(e, t));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (embeddedPreview) return;
    setError(null);
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      if (isLocalDevHost()) {
        if (establishingRef.current) return;
        establishingRef.current = true;
        try {
          await signInWithPopup(auth, provider);
          await establishSession();
          sessionStorage.removeItem(GOOGLE_OAUTH_FLAG);
        } finally {
          establishingRef.current = false;
        }
      } else {
        sessionStorage.setItem(GOOGLE_OAUTH_FLAG, "1");
        await signInWithRedirect(auth, provider);
      }
    } catch {
      sessionStorage.removeItem(GOOGLE_OAUTH_FLAG);
      setError(t("errors.generic"));
    } finally {
      if (isLocalDevHost()) {
        setLoading(false);
      }
      /* redirect path: page reloads; loading state resets */
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
        <h1 className="text-xl font-semibold text-[var(--fp-ink)]">{t("signIn")}</h1>
        <LocaleSwitcher />
      </div>

      {embeddedPreview && (
        <div
          className="rounded-xl border border-amber-700/40 bg-amber-950/35 px-3 py-3 text-sm text-amber-100"
          role="status"
        >
          <p className="font-semibold text-amber-50">{t("embeddedPreviewTitle")}</p>
          <p className="mt-1 text-xs leading-snug text-amber-100/90">
            {t("embeddedPreviewBody")}
          </p>
          <button
            type="button"
            onClick={() =>
              window.open(window.location.href, "_blank", "noopener,noreferrer")
            }
            className="mt-3 w-full rounded-lg bg-amber-600/90 px-3 py-2 text-center text-sm font-medium text-amber-950 hover:bg-amber-500"
          >
            {t("openExternalBrowser")}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || embeddedPreview}
        title={embeddedPreview ? t("embeddedPreviewBody") : undefined}
        className="flex w-full min-h-11 items-center justify-center rounded-xl border border-[var(--fp-wood-mid)] bg-white px-4 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("google")}
      </button>
      {!embeddedPreview && (
        <p className="text-center text-xs leading-snug text-[var(--fp-secondary)]">{t("googleHint")}</p>
      )}

      <div className="relative text-center text-xs text-[var(--fp-secondary)]">
        <span className="bg-[var(--fp-panel)] px-2">or email</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-[var(--fp-parchment)]" />
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--fp-ink)]">{t("email")}</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--fp-wood-mid)]/40 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-500"
            dir="ltr"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--fp-ink)]">{t("password")}</label>
          <input
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-[var(--fp-wood-mid)]/40 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-500"
            dir="ltr"
          />
        </div>
        {error && (
          <p
            className="rounded-lg border border-[var(--fp-loss)]/40 bg-[var(--fp-loss)]/12 px-3 py-2 text-sm font-medium text-[var(--fp-loss)]"
            role="alert"
          >
            {error}
          </p>
        )}
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
          className="font-medium text-[var(--fp-brass)] underline decoration-[var(--fp-brass)]/70 underline-offset-[5px] hover:brightness-110"
        >
          {mode === "signin" ? t("needAccount") : t("haveAccount")}
        </button>
        {mode === "signin" && (
          <button
            type="button"
            onClick={handleForgot}
            className="font-medium text-[var(--fp-brass)] underline decoration-[var(--fp-brass)]/70 underline-offset-[5px] hover:brightness-110"
          >
            {t("forgot")}
          </button>
        )}
      </div>
    </div>
  );
}
