import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

// Match all routes except API, Next internals, static files (next-intl recommended shape)
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
