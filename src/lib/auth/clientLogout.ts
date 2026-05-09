import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

/** Clears HTTP session cookie and Firebase client auth. */
export async function logoutSession(): Promise<void> {
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
  });
  try {
    await signOut(getFirebaseAuth());
  } catch {
    /* ignore sign-out errors */
  }
}
