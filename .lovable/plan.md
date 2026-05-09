This is a multi-turn plan. One Lovable turn cannot honestly ship all five AI modules + three bug fixes + Camps Day 3 well. I'm splitting it so each turn ships something complete and testable, and camps still launch on schedule.

## Turn A (this turn) — Stop the bleeding + Camps Day 3

**1. Diagnose & fix the three "spins forever" pages**

Root cause analysis from the code:

- `BookSession.tsx` — `loadingCoaches` is initialized `false` and never set `true`, BUT auth logs show `bad_jwt / missing sub claim` 403s. When the auth fetch hangs/fails, the coach query never resolves and the empty grid + the in-page subcomponents that gate on `getSession()` look like a spinner.
- `GroupSessions.tsx` — same pattern: `getSession()` then if no session, `return` without populating data; the page is hardcoded to render a full-page `Loader2` when `loading === true`. The 5-second safety timeout exists but anything that throws inside the `.then` chain (e.g. RLS error on `group_sessions`) leaves UI half-rendered.
- `LessonPackages.tsx` — `setLoading(false)` is only called inside `fetchPackages` after the await. If the query throws (RLS / table missing for unauthed users), `loading` stays `true` and never recovers because there's no `.catch` / `finally`.

Fixes (frontend-only, no schema changes):
- Wrap every initial-load fetch in `try/finally` and always clear loading.
- Replace `if (loading) return <FullPageSpinner/>` with skeleton + content fallback so a stalled query never blocks the entire screen.
- Add a 6s hard timeout on each initial query using existing `withTimeout` from `src/lib/queryTimeout.ts`.
- For `BookSession` and `GroupSessions`, surface a clear "Sign in to continue" empty state when there's no session instead of leaving the page blank.

**2. Camps Day 3 — public registration UI**

Build the three public pages on top of the Day 2 backend that's already deployed:
- `/camps` — landing page listing the two cohorts (Ages 7-10 @ Ross Field, Ages 11-15 @ Gravelly Brook), 4 weeks of sessions, pricing, capacity remaining (live).
- `/camps/register/:cohortId` — multi-step form (player info → session selection → review → Stripe Checkout), invokes `register-for-camp`.
- `/camps/success` and `/camps/cancel` — confirmation + cancellation flow that calls `cancel-camp-registration`.

All UI uses existing design tokens (gold primary on dark steel). Mobile-first since user is on a 402px viewport.

**3. Memory update**
Add a memory entry locking down camp pricing, venues, and the Day 0–3 scope so future turns don't drift.

## Turn B (next turn) — AI Coach Notes + AI Risk Monitor

These two have the most existing infrastructure to build on:
- **AI Coach Notes** — extend `generate-lesson-analysis` (already exists, uses Lovable AI) to produce the "what changed / what to do next" summary format and surface it on the coach + parent dashboards.
- **AI Risk Monitor** — new edge function `ai-risk-monitor` that runs on a schedule (cron) over `athlete_kpis`, `workload_logs`, `coach_lesson_feedback` and writes flags to a new `athlete_risk_flags` table. UI: red/amber chip on the dashboard + a flags panel.

## Turn C — AI Onboarding Assessor + AI Development Engine

- **Onboarding Assessor** — wire a new `ai-onboarding-assessor` edge function called at the end of `AthleteOnboarding.tsx`, consuming age/position/goals/metrics + optional video URL, returning a starting plan stored in `athlete_starting_plans`. This wraps the existing rule-based `analyzeAthlete` engine in `src/lib/intelligence/engine.ts` with an LLM layer that turns it into a narrative.
- **Development Engine** — weekly cron edge function `ai-weekly-block-generator` that reads each athlete's recent KPIs/check-ins/feedback, calls Lovable AI, and writes a structured weekly block to `athlete_weekly_blocks`. Surface in `WeeklyCalendar.tsx`.

## Turn D — AI Parent Mode + polish

- **AI Parent Mode** — toggle in the parent portal that translates the most recent coach notes + KPI deltas into plain-English updates via Lovable AI; cached per (athlete, week).
- Final polish: dashboard "where now / what next / why it matters" answer cards added to athlete + parent dashboards (the user explicitly called this out).

## Why this split

- All five AI modules require new tables + RLS + edge functions + cron schedules + UI on multiple dashboards. Done in one turn, none of it would be tested. Done across four turns, each shipment is verifiable end-to-end.
- Camps launch is on a hard deadline (next Mon-Tues). Day 3 has to ship this turn.
- The spinning bugs are blocking real users right now and have to ship this turn.

## Technical notes

- All AI calls go through the Lovable AI Gateway (`LOVABLE_API_KEY`, model `google/gemini-2.5-flash` for cost, `gemini-2.5-pro` for the Risk Monitor where reasoning matters).
- New tables (`athlete_risk_flags`, `athlete_starting_plans`, `athlete_weekly_blocks`, `parent_mode_summaries`) all RLS-scoped to `auth.uid()` via existing patterns.
- Cron jobs use the existing `pg_cron + CRON_SECRET` pattern already wired.
- No changes to legacy WebRTC, Course Access, or Baseball booking systems (per memory).
- Tryouts pricing memory (always free) preserved — camps are paid, separate product.

## Confirm before I execute Turn A

If you want me to compress turns (e.g. ship Risk Monitor in Turn A too), say so and I'll re-plan. Otherwise approve and I'll execute Turn A end-to-end: spin fixes + Camps Day 3 + memory update.