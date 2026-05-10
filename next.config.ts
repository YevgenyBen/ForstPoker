import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import pkg from "./package.json";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /** Required for Firebase App Hosting (Cloud Run bundles the standalone server output). */
  output: "standalone",
  /**
   * Turbopack traces only part of `@swc/helpers` into standalone output (often CJS). Runtime still
   * resolves `esm/*` paths → MODULE_NOT_FOUND on Cloud Run. Force-include the full package.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/output#caveats
   */
  outputFileTracingIncludes: {
    "**": ["./node_modules/@swc/helpers/**/*"],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  serverExternalPackages: ["firebase-admin", "firebase", "@neondatabase/serverless", "ws"],
  /** Firebase `signInWithPopup` needs this; default COOP blocks `window.closed` cross-origin. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
