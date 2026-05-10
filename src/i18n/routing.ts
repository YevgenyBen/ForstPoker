import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "he"],
  defaultLocale: "en",
  localePrefix: "always",
  /** URL carries locale (/en/..., /he/...); avoid NEXT_LOCALE cookie (conflicts with Firebase Hosting __session budget). */
  localeDetection: false,
  localeCookie: false,
});
