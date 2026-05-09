import {
  getApps,
  initializeApp,
  cert,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import path from "node:path";
import fs from "node:fs";

let app: App;

function ensureAbsoluteServiceAccountPath() {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!p || path.isAbsolute(p)) return;
  const abs = path.resolve(process.cwd(), p);
  if (fs.existsSync(abs)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = abs;
  }
}

export function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  ensureAbsoluteServiceAccountPath();

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!fs.existsSync(credPath)) {
      throw new Error(
        `Firebase Admin: service account file not found at ${credPath} (cwd=${process.cwd()})`
      );
    }
    app = initializeApp({ credential: applicationDefault() });
    return app;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin: set GOOGLE_APPLICATION_CREDENTIALS (recommended) or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, with NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    );
  }
  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  return app;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
