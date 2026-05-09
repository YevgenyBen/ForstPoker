/**
 * True when OAuth popups / redirect handoffs are unreliable (IDE Simple Browser, webviews).
 * Cursor/VS Code embed Chromium with an Electron user agent; Firebase Google auth expects a normal browser.
 */
export function isIdeEmbeddedPreview(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const ua = navigator.userAgent;
  if (/Electron\//i.test(ua)) return true;
  if (/vscode-webview/i.test(ua)) return true;
  return false;
}
