/** Waze universal link: opens the app if installed, otherwise the web flow. */
export function wazeUrlForAddress(query: string): string | null {
  const q = query.trim();
  if (!q) return null;
  return `https://waze.com/ul?q=${encodeURIComponent(q)}`;
}
