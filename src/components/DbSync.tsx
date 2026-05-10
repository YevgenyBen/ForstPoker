"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const POLL_MS = 5000;

/**
 * Polls a lightweight DB digest; when it changes, refreshes server components so UI
 * stays in sync across tabs/devices without WebSockets (fits Neon + Firebase App Hosting).
 */
export function DbSync() {
  const router = useRouter();
  const lastV = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      try {
        const r = await fetch("/api/realtime/digest", {
          credentials: "include",
          cache: "no-store",
        });
        if (!r.ok || cancelled) return;
        const data = (await r.json()) as { v: string };
        if (lastV.current !== null && lastV.current !== data.v) {
          router.refresh();
        }
        lastV.current = data.v;
      } catch {
        /* offline / transient errors — skip */
      }
    };

    void tick();
    const interval = setInterval(() => void tick(), POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return null;
}
