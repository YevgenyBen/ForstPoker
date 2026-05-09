"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export function HtmlLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
