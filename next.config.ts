import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import pkg from "./package.json";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
