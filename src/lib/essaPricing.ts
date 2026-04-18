/**
 * ESSA — Edward's Sports Science Academy
 * Facility pricing catalog. Single source of truth for all in-person
 * lesson, package, group, clinic, rental, and program pricing.
 *
 * Stripe Price IDs for items wired to checkout are listed alongside.
 * Items without a stripe_price_id are "Contact us" / inquiry only.
 */

export type LessonCategory = "private" | "group" | "clinic" | "rental" | "program";

export type PrivateLesson = {
  id: string;
  name: string;
  shortName: string;
  durationMinutes: number;
  priceCents: number;
  stripePriceId: string;
  category: "hitting" | "pitching" | "catching" | "fielding" | "speed";
  icon: string;
  description: string;
};

export type LessonPackage = {
  id: string;
  name: string;
  lessonCount: number;
  perLessonPriceCents: number;
  totalPriceCents: number;
  savingsPercent: number;
  stripePriceId: string;
  appliesTo: ("hitting" | "pitching" | "catching" | "fielding" | "speed")[];
  description: string;
};

export type GroupLesson = {
  id: string;
  name: string;
  durationMinutes: number;
  pricePerAthleteCents: number;
  minAthletes: number;
  maxAthletes: number;
  description: string;
};

export type Clinic = {
  id: string;
  name: string;
  durationLabel: string;
  pricePerAthleteCents: number;
  minAthletes: number;
  maxAthletes: number;
  description: string;
};

export type FacilityRental = {
  id: string;
  name: string;
  unitLabel: string; // "/hour", "package", etc.
  priceCents: number;
  description: string;
};

export type RecurringProgram = {
  id: string;
  name: string;
  ageGroup: string;
  cadence: string;
  priceCents: number;
  description: string;
};

// ============================================================================
// PRIVATE LESSONS (1-on-1, 30 minutes)
// ============================================================================

export const PRIVATE_LESSONS: PrivateLesson[] = [
  {
    id: "hitting",
    name: "Baseball / Softball Hitting",
    shortName: "Hitting",
    durationMinutes: 30,
    priceCents: 7500,
    stripePriceId: "price_1TNOqoPhXS410TO5GlOR65O9",
    category: "hitting",
    icon: "🥎",
    description: "Mechanics, exit velo, contact quality. Cage-based 1-on-1.",
  },
  {
    id: "pitching",
    name: "Baseball Pitching",
    shortName: "Pitching",
    durationMinutes: 30,
    priceCents: 8500,
    stripePriceId: "price_1TNOqpPhXS410TO5ftYKnyIo",
    category: "pitching",
    icon: "⚾",
    description: "Velocity, command, sequencing. Mound-based 1-on-1.",
  },
  {
    id: "softball_pitching",
    name: "Softball Pitching",
    shortName: "Softball Pitching",
    durationMinutes: 30,
    priceCents: 8500,
    stripePriceId: "price_1TNOqpPhXS410TO5ftYKnyIo",
    category: "pitching",
    icon: "🥎",
    description: "Windmill mechanics, spin, locations. 1-on-1 with specialist.",
  },
  {
    id: "catching",
    name: "Catching Specialty",
    shortName: "Catching",
    durationMinutes: 30,
    priceCents: 8500,
    stripePriceId: "price_1TNOqqPhXS410TO50iQX5ica",
    category: "catching",
    icon: "🧤",
    description: "Pop time, blocking, framing, game-calling.",
  },
  {
    id: "fielding",
    name: "Position-Specific Fielding",
    shortName: "Fielding",
    durationMinutes: 30,
    priceCents: 7500,
    stripePriceId: "price_1TNOqsPhXS410TO5eqyEZQmm",
    category: "fielding",
    icon: "⚾",
    description: "Footwork, range, transfers. Infield or outfield.",
  },
  {
    id: "speed",
    name: "Speed & Agility",
    shortName: "Speed & Agility",
    durationMinutes: 30,
    priceCents: 6500,
    stripePriceId: "price_1TNOqtPhXS410TO573t1vAda",
    category: "speed",
    icon: "⚡",
    description: "60-yard, base stealing, first-step quickness.",
  },
];

// ============================================================================
// LESSON PACKAGES (5 / 10 / 20 with progressive discount)
// ============================================================================

export const LESSON_PACKAGES: LessonPackage[] = [
  {
    id: "pkg_5_hitting_fielding",
    name: "5-Lesson Package — Hitting / Fielding",
    lessonCount: 5,
    perLessonPriceCents: 6750,
    totalPriceCents: 33750,
    savingsPercent: 10,
    stripePriceId: "price_1TNOqvPhXS410TO57n6EPrm5",
    appliesTo: ["hitting", "fielding", "speed"],
    description: "Save 10% — book 5 sessions. Use for hitting, fielding, or speed.",
  },
  {
    id: "pkg_10_hitting_fielding",
    name: "10-Lesson Package — Hitting / Fielding",
    lessonCount: 10,
    perLessonPriceCents: 6375,
    totalPriceCents: 63750,
    savingsPercent: 15,
    stripePriceId: "price_1TNOqwPhXS410TO5qqKlobIP",
    appliesTo: ["hitting", "fielding", "speed"],
    description: "Save 15% — most popular. Use across hitting, fielding, or speed.",
  },
  {
    id: "pkg_20_hitting_fielding",
    name: "20-Lesson Package — Hitting / Fielding",
    lessonCount: 20,
    perLessonPriceCents: 6000,
    totalPriceCents: 120000,
    savingsPercent: 20,
    stripePriceId: "price_1TNOqxPhXS410TO5GeIPgLoy",
    appliesTo: ["hitting", "fielding", "speed"],
    description: "Save 20% — best value for committed athletes.",
  },
  {
    id: "pkg_5_pitching_catching",
    name: "5-Lesson Package — Pitching / Catching",
    lessonCount: 5,
    perLessonPriceCents: 7650,
    totalPriceCents: 38250,
    savingsPercent: 10,
    stripePriceId: "price_1TNOqzPhXS410TO5ztMq2ElV",
    appliesTo: ["pitching", "catching"],
    description: "Save 10% — pitching or catching specialty.",
  },
  {
    id: "pkg_10_pitching_catching",
    name: "10-Lesson Package — Pitching / Catching",
    lessonCount: 10,
    perLessonPriceCents: 7225,
    totalPriceCents: 72250,
    savingsPercent: 15,
    stripePriceId: "price_1TNOr0PhXS410TO567HKWXuI",
    appliesTo: ["pitching", "catching"],
    description: "Save 15% — most popular pitching/catching package.",
  },
  {
    id: "pkg_20_pitching_catching",
    name: "20-Lesson Package — Pitching / Catching",
    lessonCount: 20,
    perLessonPriceCents: 6800,
    totalPriceCents: 136000,
    savingsPercent: 20,
    stripePriceId: "price_1TNOr0PhXS410TO5VRWDj8O7",
    appliesTo: ["pitching", "catching"],
    description: "Save 20% — full-season commitment for pitchers/catchers.",
  },
];

// ============================================================================
// GROUP LESSONS (2-4 athletes, 60 min) — inquiry only in Phase 1
// ============================================================================

export const GROUP_LESSONS: GroupLesson[] = [
  {
    id: "group_hitting",
    name: "Hitting Group",
    durationMinutes: 60,
    pricePerAthleteCents: 4500,
    minAthletes: 2,
    maxAthletes: 4,
    description: "Small-group hitting work. 60 min, $45/athlete.",
  },
  {
    id: "group_pitching",
    name: "Pitching Group",
    durationMinutes: 60,
    pricePerAthleteCents: 5500,
    minAthletes: 2,
    maxAthletes: 4,
    description: "Mound work in a small group. 60 min, $55/athlete.",
  },
  {
    id: "group_fielding",
    name: "Fielding Group",
    durationMinutes: 60,
    pricePerAthleteCents: 4500,
    minAthletes: 2,
    maxAthletes: 4,
    description: "Position-specific group reps. 60 min, $45/athlete.",
  },
];

// ============================================================================
// CLINICS (5-15 athletes) — inquiry only in Phase 1
// ============================================================================

export const CLINICS: Clinic[] = [
  {
    id: "clinic_half_day",
    name: "Half-Day Clinic",
    durationLabel: "3 hours",
    pricePerAthleteCents: 8900,
    minAthletes: 5,
    maxAthletes: 15,
    description: "$89/athlete — focused 3-hour skill block.",
  },
  {
    id: "clinic_full_day",
    name: "Full-Day Clinic",
    durationLabel: "6 hours",
    pricePerAthleteCents: 14900,
    minAthletes: 5,
    maxAthletes: 15,
    description: "$149/athlete — comprehensive 6-hour day.",
  },
  {
    id: "clinic_weekend",
    name: "Weekend Clinic",
    durationLabel: "2 days",
    pricePerAthleteCents: 24900,
    minAthletes: 5,
    maxAthletes: 15,
    description: "$249/athlete — Saturday + Sunday intensive.",
  },
  {
    id: "clinic_holiday",
    name: "Holiday Break Clinic",
    durationLabel: "5 days",
    pricePerAthleteCents: 49900,
    minAthletes: 5,
    maxAthletes: 15,
    description: "$499/athlete — full-week holiday camp.",
  },
];

// ============================================================================
// FACILITY & TEAM RENTALS — inquiry only in Phase 1
// ============================================================================

export const RENTALS: FacilityRental[] = [
  { id: "rental_full", name: "Full Field / Facility Rental", unitLabel: "/hour", priceCents: 15000, description: "$150/hour — entire facility." },
  { id: "rental_cage", name: "Cage Rental", unitLabel: "/hour per cage", priceCents: 4500, description: "$45/hour — single cage." },
  { id: "rental_practice", name: "Team Practice Package", unitLabel: "2 hours", priceCents: 24900, description: "$249 — 2-hour team practice slot." },
  { id: "rental_monthly", name: "Team Practice Monthly", unitLabel: "4 sessions", priceCents: 89900, description: "$899/mo — 4 team practices." },
  { id: "rental_season", name: "Team Season Rental", unitLabel: "12 weeks", priceCents: 249900, description: "$2,499 — full 12-week season." },
];

// ============================================================================
// RECURRING PROGRAMS — inquiry only in Phase 1
// ============================================================================

export const PROGRAMS: RecurringProgram[] = [
  { id: "prog_youth_skills", name: "Weekly Skills Academy", ageGroup: "8-12", cadence: "monthly", priceCents: 19900, description: "$199/mo — fundamentals for youth." },
  { id: "prog_elite", name: "Elite Development Academy", ageGroup: "13-18", cadence: "monthly", priceCents: 29900, description: "$299/mo — high-school track." },
  { id: "prog_pitching", name: "Pitching Development Program", ageGroup: "all", cadence: "monthly", priceCents: 24900, description: "$249/mo — structured velo + command program." },
  { id: "prog_softball_fastpitch", name: "Softball Fastpitch Academy", ageGroup: "all", cadence: "monthly", priceCents: 27900, description: "$279/mo — windmill specialty program." },
  { id: "prog_summer", name: "Summer Camp", ageGroup: "all", cadence: "weekly", priceCents: 34900, description: "$349/week — summer day camps." },
  { id: "prog_fall_ball", name: "Fall Ball Training", ageGroup: "all", cadence: "8 weeks", priceCents: 49900, description: "$499 — 8-week fall block." },
  { id: "prog_winter", name: "Winter Training Program", ageGroup: "all", cadence: "10 weeks", priceCents: 59900, description: "$599 — 10-week winter block." },
];

// ============================================================================
// HELPERS
// ============================================================================

export const formatPrice = (cents: number): string => {
  const dollars = cents / 100;
  return `$${dollars.toFixed(dollars % 1 === 0 ? 0 : 2)}`;
};

export const getLessonById = (id: string): PrivateLesson | undefined =>
  PRIVATE_LESSONS.find((l) => l.id === id);

export const getPackageById = (id: string): LessonPackage | undefined =>
  LESSON_PACKAGES.find((p) => p.id === id);

/** All Stripe price IDs the facility checkout function should accept. */
export const ALL_FACILITY_PRICE_IDS: string[] = [
  ...PRIVATE_LESSONS.map((l) => l.stripePriceId),
  ...LESSON_PACKAGES.map((p) => p.stripePriceId),
];

/** Cancellation policy text used across booking confirmation UI. */
export const CANCELLATION_POLICY = {
  freeWindowHours: 24,
  withinWindowChargePercent: 50,
  sameDayChargePercent: 100,
  noShowFeeCents: 2500,
  weatherRefund: true,
};
