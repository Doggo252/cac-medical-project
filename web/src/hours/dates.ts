/** Date helpers for the tracker. All local time, because the log is the user's day. */

export function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function currentMonth(): string {
  return todayIso().slice(0, 7);
}

/** "2027-01-01" → "January 1, 2027". Parsed at noon to dodge timezone edges. */
export function formatLongDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
