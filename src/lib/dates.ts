/** Date helpers. All "day" values are ISO dates (YYYY-MM-DD) in local time. */

/** ISO date (YYYY-MM-DD) for a given Date, in the local timezone. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's ISO date in local time. */
export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now);
}

const WEEKDAYS_DA = [
  'Søndag',
  'Mandag',
  'Tirsdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lørdag',
];

const MONTHS_DA = [
  'januar',
  'februar',
  'marts',
  'april',
  'maj',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'december',
];

/** e.g. "Tirsdag · 21. juli" */
export function formatDayHeading(now: Date = new Date()): string {
  const weekday = WEEKDAYS_DA[now.getDay()];
  const day = now.getDate();
  const month = MONTHS_DA[now.getMonth()];
  return `${weekday} · ${day}. ${month}`;
}

/** e.g. "21. juli" for a YYYY-MM-DD string; returns '' for null. */
export function formatShortDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d}. ${MONTHS_DA[m - 1] ?? ''}`.trim();
}
