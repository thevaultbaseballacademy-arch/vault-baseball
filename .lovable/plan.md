# VAULT Stabilization & Production-Hardening Plan

Mode: fix-only. No new features, no redesigns, no removed products. I will land changes in small batches and recheck each major flow before moving on.

---

## What the audit found

**Shape of the app**
- 187 routes in `App.tsx`, all lazy-loaded with `lazyWithRetry` + `Suspense` fallback. Good.
- Global `ErrorBoundary`, `QueryClient` with `staleTime: 5min`, `refetchOnWindowFocus: false`. Good.
- 181 `console.error` sites, 140 untyped `catch` blocks — most are fine, but several swallow errors and leave the UI spinning.
- 20+ files >700 lines (Courses 1.3k, FoundersAccess 1.1k, AthleteKPIForm 1.5k, FacilityScheduling 861, BaselineAudit 763, Index 768, CoachDashboard 733). These are the prime suspects for slow first paint and noisy re-renders.

**Recent regressions still at risk**
- BookSession / GroupSessions / LessonPackages full-page spinners were patched last week — need an end-to-end recheck on mobile.
- Camps Day 3 (`/camps/:cohortId/register`, `/camps/success`) is brand new and hasn't been smoke-tested against Stripe webhook timing.
- IA restructure (4-bucket nav, Coach Network merge) and Eddie context routing — recent enough to harbor mobile/overflow bugs.

**Highest-risk classes of bugs (by category, not exhaustive list)**

1. **Hanging pages** — `useEffect` data loads without a `finally { setLoading(false) }`, or a thrown error inside an async path that the catch swallows silently. Symptom: full-page spinner forever. Same root cause as the BookSession/Group/Packages issue.
2. **Auth-gated route flicker** — pages that read `user` before `useAuth()` resolves, then redirect or render a blank state.
3. **Mobile overflow** — long product titles, tables, and the Marketplace coach grid on 360–414px viewports.
4. **Duplicate fetches** — components that fetch in `useEffect` instead of `useQuery`, causing re-fetch on every mount/route change.
5. **Eddie AI** — context payload + page metadata size, and the chat panel z-index/stacking against modals.
6. **Stripe checkout edges** — success page polling without a hard timeout fallback message; cancel paths that drop the user on a blank state.
7. **Form validation inconsistency** — some forms use Zod, others ad-hoc booleans; error text styling drifts.
8. **Empty/error states** — many list pages render `null` when the query returns `[]` or errors, leaving a blank screen.

---

## Prioritized fix plan (5 batches)

I'll do **Batch 1 → recheck → Batch 2 → recheck**, etc. After each batch I'll report what was touched and what I verified in the preview before moving on.

### Batch 1 — Critical: spinners, blank states, broken flows (P0)
- Sweep every page-level `useEffect` data loader for missing `finally { setLoading(false) }` and unhandled rejections. Add a shared `useSafeAsync` pattern where it keeps recurring.
- Audit BookSession, GroupSessions, LessonPackages, Camps, CampRegister, CampSuccess, FreeEvaluation, RemoteTrainingHub, Marketplace, Tryouts end-to-end. Fix any remaining hang or blank state.
- Add a hard 30s timeout + visible "took too long, retry" CTA on the CampSuccess polling loop and any other polling success page.
- Standardize empty states: every list/grid page renders a `<EmptyState>` component when the query returns `[]` and an `<ErrorState>` with retry when it errors. Build the two components if they don't exist; reuse if they do.
- Audit Stripe cancel/success redirects so neither path lands on a blank screen.

### Batch 2 — Navigation, auth gating, dead ends (P0/P1)
- Verify every link in the 4-bucket nav resolves to a real route (no 404s after the IA restructure).
- Audit `<AuthGuard>` usage — confirm no page does `navigate('/auth')` directly (memory rule).
- Fix auth-flicker: pages that render content before `useAuth().loading === false` get a skeleton instead of a redirect or blank.
- Add a project-wide 404 review: confirm `NotFound.tsx` is wired and links back to home + bucket entries.

### Batch 3 — Mobile responsiveness pass (P1)
- Test the top 15 pages at 360, 390, 414, 768. Fix overflow, clipped CTAs, broken grids, sticky-header overlap.
- Marketplace coach cards, Products grid, Certifications cards, RemoteTrainingHub stat cards, CoachDashboard tables — known suspects.
- Eddie chat panel: verify it doesn't trap focus or sit above modals/sheets on mobile.

### Batch 4 — Performance pass (P2)
- Convert remaining `useEffect`+`fetch` pairs to `useQuery` so React Query handles dedupe + caching.
- Memoize heavy lists (Products, Marketplace, Courses) with `useMemo` for filter results and `React.memo` for cards.
- Split the largest pages (Courses 1.3k, FoundersAccess 1.1k, AthleteKPIForm 1.5k) into smaller components only where it reduces re-renders — no behavior change.
- Convert oversized PNGs to WebP where safe; keep `vault-logo.png` as-is unless transparency is needed elsewhere.

### Batch 5 — Cross-flow verification (P0 gate before "done")
End-to-end smoke test in the preview, mobile + desktop:
1. **Athlete**: land → Free Evaluation → recommendation → Products → checkout open.
2. **Parent**: land → any major page → confirm "what is this / who for / next action" is answered.
3. **Coach**: Certifications → exam flow entry → Marketplace listing path.
4. **Org buyer**: Products → licensing/coach-authority bundle → checkout open.
5. **Event user**: Camps → register flow → success polling.
6. **Eddie**: open on Assess, Train, Get Seen, Scale pages — confirm prompts switch and no console errors.

---

## Constraints I will respect

- No legacy WebRTC, Course Access, or Baseball booking changes.
- No homepage hero copy edits (per prior rule).
- Sport parity: any fix to Baseball gets mirrored on Softball.
- Mobile checkout stays on `openCheckout` utility.
- No cookie banners.
- Risky changes get called out in the batch summary before I ship them.

## Clarifying questions before Batch 1

1. **Scope of "production-ready"** — should I prioritize the 5 athlete/parent/coach/org/event flows above everything else and defer admin/owner internal tools to a later pass? (Recommended: yes.)
2. **Performance budget** — do you want me to convert eager `useEffect` fetches to `useQuery` aggressively (touches ~30 files) or only on pages that demonstrably re-fetch? (Recommended: only on demonstrable offenders to minimize regression risk.)
3. **Empty/error state design** — OK to introduce two shared components `<EmptyState>` and `<ErrorState>` styled to the existing dark/gold system, used everywhere lists render? (Recommended: yes.)
4. **Test budget per batch** — should I use the browser tool to smoke-test each batch (slower but catches real regressions) or only after Batch 5? (Recommended: spot-check P0 batches, full sweep at Batch 5.)

Approve the plan (or answer the 4 questions) and I'll start with Batch 1.