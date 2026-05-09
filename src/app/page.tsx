import { redirect } from "next/navigation";

/** Send `/` into locale tree; smart routing happens in `/[locale]/page.tsx`. */
export default function RootPage() {
  redirect("/en");
}
