"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const base = `/${locale}`;

  const items = [
    { href: `${base}/games`, label: t("games") },
    { href: `${base}/history`, label: t("history") },
    { href: `${base}/login`, label: t("login") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--fp-wood-mid)] bg-[var(--fp-panel)]/95 backdrop-blur-sm safe-area-pb">
      <div className="mx-auto flex max-w-lg gap-1 px-3 py-2">
        {items.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg p-3 text-center text-sm font-medium transition-[transform,filter,background-color,color,opacity] duration-200 ease-out motion-safe:hover:-translate-y-px motion-safe:hover:brightness-[1.06] motion-safe:active:translate-y-0 motion-safe:active:brightness-[0.96] ${
                active
                  ? "bg-[var(--fp-moss)] text-white"
                  : "text-[var(--fp-ink)] hover:bg-[var(--fp-parchment)]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
