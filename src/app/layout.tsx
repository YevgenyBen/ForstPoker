import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forest Poker",
  description: "Buy-in / buy-out tracker for home games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={rubik.variable}>
      <body className="min-h-dvh bg-[var(--fp-bg)] text-[var(--fp-ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
