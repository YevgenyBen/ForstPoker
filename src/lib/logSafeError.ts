/**
 * Sanitize strings before logging so tokens/keys are not printed to the browser or server console.
 */
export function redactSensitiveText(s: string): string {
  let out = s.replace(
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_.-]+/g,
    "[redacted:jwt]"
  );
  out = out.replace(
    /-----BEGIN[A-Z ]+-----[\s\S]*?-----END[A-Z ]+-----/g,
    "[redacted:pem]"
  );
  out = out.replace(
    /\b(?:sk_live_|sk_test_|AIza)[A-Za-z0-9_-]{16,}\b/g,
    "[redacted:key]"
  );
  out = out.replace(/\b[a-f0-9]{64}\b/gi, "[redacted:hex]");
  return out;
}

/**
 * Logs `console.error` with a stable prefix. Omits raw secrets; Firebase-style `{ code, message }`
 * and `Error` messages are passed through {@link redactSensitiveText} when needed.
 */
export function safeConsoleError(context: string, err: unknown): void {
  if (err === null || err === undefined) {
    console.error(`[${context}]`, err);
    return;
  }

  const maybeCode =
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string"
      ? (err as { code: string }).code
      : undefined;

  if (maybeCode !== undefined) {
    const message =
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof (err as { message: unknown }).message === "string"
        ? redactSensitiveText((err as { message: string }).message)
        : undefined;
    const name =
      typeof err === "object" &&
      err !== null &&
      "name" in err &&
      typeof (err as { name: unknown }).name === "string"
        ? (err as { name: string }).name
        : undefined;
    console.error(`[${context}]`, { code: maybeCode, name, message });
    return;
  }

  if (err instanceof Error) {
    console.error(`[${context}]`, {
      name: err.name,
      message: redactSensitiveText(err.message),
    });
    return;
  }

  console.error(`[${context}]`, redactSensitiveText(String(err)));
}
