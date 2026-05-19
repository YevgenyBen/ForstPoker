"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type RefreshContextValue = {
  pending: boolean;
  run: (action: () => Promise<boolean>) => Promise<boolean>;
};

const ActionRefreshContext = createContext<RefreshContextValue | null>(null);

export function ActionRefreshProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (action: () => Promise<boolean>) => {
      setPending(true);
      try {
        const ok = await action();
        if (ok) await router.refresh();
        return ok;
      } finally {
        setPending(false);
      }
    },
    [router]
  );

  return (
    <ActionRefreshContext.Provider value={{ pending, run }}>
      {children}
    </ActionRefreshContext.Provider>
  );
}

/** Run a server action; on success await `router.refresh()` before clearing pending. */
export function useActionRefresh() {
  const router = useRouter();
  const boundary = useContext(ActionRefreshContext);
  const [localPending, setLocalPending] = useState(false);

  const run = useCallback(
    async (action: () => Promise<boolean>) => {
      if (boundary) return boundary.run(action);
      setLocalPending(true);
      try {
        const ok = await action();
        if (ok) await router.refresh();
        return ok;
      } finally {
        setLocalPending(false);
      }
    },
    [boundary, router]
  );

  return { pending: boundary?.pending ?? localPending, run };
}
