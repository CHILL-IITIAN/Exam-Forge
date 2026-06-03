/** Short, URL-safe, time-sortable IDs. Good enough for client-side data. */
export function uid(prefix = ""): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return prefix ? `${prefix}_${t}${r}` : `${t}${r}`;
}
