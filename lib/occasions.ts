// The occasion calendar.
//
// "Featured This Week" was pinned to `birthday-wish` in a line of JSX, so the
// gallery said the same thing in the week before Diwali as it did in March.
// This makes it date-driven: the banner shows whatever is actually coming up.
//
// React-free and dependency-free, so both the gallery and any future reminder
// job can import it.
//
// SEEDED PER YEAR ON PURPOSE, not computed. Hindu and Islamic festival dates
// are lunar and move every year; a recurring-date table would need a panchang
// or a hijri calendar to be right, and being one day off on Diwali is worse
// than a hardcoded list somebody checks each year. The fixed-date entries
// (Teacher's Day) and the nth-weekday ones (Mother's Day, Friendship Day) are
// listed literally for the same reason: one table, one place to correct.
//
// MAINTENANCE: extend this each year. When the list runs out the gallery falls
// back to `FALLBACK_FEATURED` rather than showing something wrong.

export interface Occasion {
  /** The template the banner should point at. */
  templateId: string;
  /** Shown in the banner, e.g. "Diwali is in 5 days". */
  name: string;
  /** ISO `YYYY-MM-DD`, in IST terms. */
  date: string;
  /**
   * How many days before the date this starts being featured.
   *
   * Also absorbs the error in a lunar date that was looked up rather than
   * computed: a window this wide does not care whether Diwali is the 8th or
   * the 9th.
   */
  leadDays: number;
}

/**
 * Sorted by date. Lunar dates below were looked up, not derived — verify them
 * against a panchang before each year goes live.
 */
export const OCCASIONS: Occasion[] = [
  // ---- 2026 -------------------------------------------------------------
  { templateId: "valentine-ask", name: "Valentine's Day", date: "2026-02-14", leadDays: 12 },
  { templateId: "holi", name: "Holi", date: "2026-03-04", leadDays: 8 },
  { templateId: "eid", name: "Eid", date: "2026-03-20", leadDays: 8 },
  { templateId: "mothers-day", name: "Mother's Day", date: "2026-05-10", leadDays: 8 },
  { templateId: "fathers-day", name: "Father's Day", date: "2026-06-21", leadDays: 8 },
  { templateId: "friendship-day", name: "Friendship Day", date: "2026-08-02", leadDays: 8 },
  { templateId: "rakhi", name: "Raksha Bandhan", date: "2026-08-28", leadDays: 8 },
  { templateId: "teachers-day", name: "Teacher's Day", date: "2026-09-05", leadDays: 6 },
  { templateId: "karwa-chauth", name: "Karwa Chauth", date: "2026-10-29", leadDays: 6 },
  { templateId: "diwali", name: "Diwali", date: "2026-11-08", leadDays: 12 },
  { templateId: "new-year", name: "New Year", date: "2027-01-01", leadDays: 10 },

  // ---- 2027 -------------------------------------------------------------
  { templateId: "valentine-ask", name: "Valentine's Day", date: "2027-02-14", leadDays: 12 },
  { templateId: "eid", name: "Eid", date: "2027-03-10", leadDays: 8 },
  { templateId: "holi", name: "Holi", date: "2027-03-22", leadDays: 8 },
  { templateId: "mothers-day", name: "Mother's Day", date: "2027-05-09", leadDays: 8 },
  { templateId: "fathers-day", name: "Father's Day", date: "2027-06-20", leadDays: 8 },
  { templateId: "friendship-day", name: "Friendship Day", date: "2027-08-01", leadDays: 8 },
  { templateId: "rakhi", name: "Raksha Bandhan", date: "2027-08-17", leadDays: 8 },
  { templateId: "teachers-day", name: "Teacher's Day", date: "2027-09-05", leadDays: 6 },
  { templateId: "karwa-chauth", name: "Karwa Chauth", date: "2027-10-18", leadDays: 6 },
  { templateId: "diwali", name: "Diwali", date: "2027-10-29", leadDays: 12 },
  { templateId: "new-year", name: "New Year", date: "2028-01-01", leadDays: 10 },
];

/** Shown when nothing is coming up — the most broadly useful template. */
export const FALLBACK_FEATURED = "love-letter";

const DAY_MS = 86_400_000;

/**
 * Days from `today` to an occasion, both read as plain calendar dates.
 *
 * Deliberately not a timestamp subtraction on local `Date` objects: a festival
 * is a calendar date, not an instant, and the visitor's clock may be anywhere.
 * Parsing both sides as UTC midnight means "how many sleeps" is the same
 * number regardless of the device's timezone.
 */
function daysUntil(isoDate: string, today: Date): number {
  const target = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(target)) return Number.POSITIVE_INFINITY;
  const now = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return Math.round((target - now) / DAY_MS);
}

export interface FeaturedOccasion {
  occasion: Occasion;
  /** 0 on the day itself. */
  daysAway: number;
}

/**
 * The occasion to feature right now, or null if nothing is close enough.
 *
 * An occasion stays featured on the day itself (`daysAway === 0`) and drops off
 * the day after — nobody wants to be told to send a Rakhi card yesterday.
 */
export function currentOccasion(today: Date = new Date()): FeaturedOccasion | null {
  let best: FeaturedOccasion | null = null;
  for (const occasion of OCCASIONS) {
    const daysAway = daysUntil(occasion.date, today);
    if (daysAway < 0 || daysAway > occasion.leadDays) continue;
    if (!best || daysAway < best.daysAway) best = { occasion, daysAway };
  }
  return best;
}

/** Human copy for the banner badge. */
export function occasionCountdown({ occasion, daysAway }: FeaturedOccasion): string {
  if (daysAway === 0) return `${occasion.name} is today`;
  if (daysAway === 1) return `${occasion.name} is tomorrow`;
  return `${occasion.name} in ${daysAway} days`;
}
