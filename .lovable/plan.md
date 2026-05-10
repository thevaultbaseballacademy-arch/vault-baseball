
# VAULT OS — Architecture & Rollout Plan

Mode: design first, build second. No rebrand. No products removed. The premium black/gold identity, mobile-first feel, and existing offers all stay. What changes is the **connective tissue** between them.

---

## 1. Audit — what exists today

**Already in place (good foundation):**
- Free Evaluation, Pillar Programs, Bundles, Coach Certification, Coach Marketplace, Recruiting Audit/Hub, Tryouts, Camps, Org Licensing, Eddie AI chat, Athlete/Parent/Coach/Owner dashboards.
- 4-bucket nav (Assess / Train / Get Seen / Scale) was recently introduced in `src/lib/ia.ts`.
- Sport parity (Baseball + Softball), unified onboarding, role system, lesson credit system, Intelligence Engine for drill/program assignment.
- Eddie has sport + page context hooks (`EddieAIChat.tsx`, `useEddieChat.ts`).

**The gap (why it doesn't feel like an OS yet):**
- Product pages, evaluation, recruiting, marketplace, and dashboards each have their own data models and CTAs. They don't share a single "athlete state" object.
- `useEffect` fetches per page → no shared "where am I in the journey" signal.
- Eddie reacts to the page route, but doesn't read the athlete's profile/recommendations to make decisions.
- No "Your Path" surface. Dashboard is a stat board, not a next-action engine.
- Org Command Center exists in pieces (OwnerOverview, TeamHub) but isn't framed as the org product surface.

---

## 2. Revised Information Architecture

Keep the 4 top-level buckets. Re-anchor every existing page underneath them. No new top-level concepts.

```text
ASSESS                TRAIN                 GET SEEN              SCALE
─────────             ─────────             ───────────           ─────────
Free Evaluation       Pillar Programs       Recruiting Audit      Coach Certification
Athlete Profile       Bundles               Recruiting Hub        Coach Marketplace (sell)
Your Path (NEW)       My Programs           Showcases             Org Licensing
Reassessment          Progress OS (NEW)     Tryouts               Team Hub / Practice Plans
Baselines & KPIs      Coach Lessons         Prospect Grader       Facility Scheduling
                      Workload / Arm Care   Wall of Wins          Org Command Center
```

Every page in the app will declare which bucket it belongs to (already partially done in `ia.ts`). This drives nav, breadcrumbs, Eddie context, and "next action" suggestions.

---

## 3. The 5 OS Layers — concrete shape

### Layer 1 — Unified Athlete Profile (the spine)

One canonical object, read by every page, written by evaluation/training/recruiting flows.

```text
AthleteState {
  identity:    user_id, sport, age, role, org_id?
  stage:       baseline | developing | advanced | recruiting | committed
  evaluation:  latest_score, pillar_breakdown, last_taken_at
  training:    active_programs[], completed_programs[], current_streak
  purchases:   active_products[], bundles[], credits
  recruiting:  readiness_score, profile_completeness, tier_target
  events:      tryouts_attended[], camps[], showcases[]
  coaches:     assigned_coach?, recent_lessons[]
  next_action: { kind, label, href, reason }   ← computed by Pathway Engine
}
```

Surface: a single `useAthleteState()` hook + React Query cache. Backed by a thin `vw_athlete_state` view in the DB that joins existing tables (no schema rewrite — it stitches what we already have).

### Layer 2 — Personalized Pathway Engine

Pure function: `computeNextAction(AthleteState) → Recommendation[]`.

Rules (all from existing data, no new ML):
- No evaluation → "Take Free Evaluation".
- Evaluation done, no program → recommend pillar program matching weakest pillar.
- Program in progress → "Continue Week N" + recommend bundle if 70%+ complete.
- Age ≥ 14 + score ≥ threshold + no recruiting profile → "Start Recruiting Audit".
- Recruiting profile incomplete → next missing checklist item.
- Stage = recruiting + no showcase → recommend nearest tryout/showcase.
- Coach role → certification status → marketplace listing.
- Org admin → adoption gap → license expansion CTA.

Lives in `src/lib/pathway/engine.ts`. Returns ranked `Recommendation[]` consumed by Your Path, Eddie, dashboards, and post-evaluation screens.

### Layer 3 — Eddie AI as Operating Intelligence

Eddie stops being "chat about this page" and becomes "decision helper that knows the athlete".

Every Eddie request will include:
- current route + bucket
- `AthleteState` summary (stage, last evaluation, active program, gaps)
- top 3 `Recommendation[]` from the Pathway Engine

Eddie behavior map:

| Context           | Eddie's job |
|-------------------|-------------|
| Evaluation result | Explain pillar scores, name top strength + top gap, surface 1 recommended program. |
| Program page      | Compare to athlete's weakest pillar, explain fit, offer bundle if applicable. |
| Bundle page       | Compare against athlete's purchases + stage, recommend lighter/heavier option. |
| Recruiting        | Read readiness + checklist, name the single highest-leverage missing item. |
| Coach pages       | Certification status → next exam, marketplace readiness, payout setup. |
| Org/License       | Seat usage, adoption %, suggested tier. |
| Anywhere idle     | Surface the current top Pathway recommendation. |

Implementation: extend `useEddieChat` to inject `AthleteState` + recommendations into the system prompt. No new chat UI.

### Layer 4 — Progress OS

A retention layer over existing data. No new product, just a synthesis surface.

Components:
- **Milestones** — derived from program completion %, evaluation deltas, lessons completed, recruiting checklist items.
- **Reassessment cadence** — every 60 days, prompt re-evaluation; show delta vs baseline.
- **Monthly progress summary** — auto-generated card on dashboard ("3 milestones, +6 ADS pts, 2 lessons").
- **Streak/consistency** — already partially in `useActivityFeed`; expose as a single `streak_days` field.
- **What changed / what to do next** — every dashboard visit shows last delta + Pathway recommendation.

### Layer 5 — Organization Command Center

Frame the existing owner/admin pages as the deliverable for the Org License product.

Sections (most exist; this is consolidation, not new pages):
- **Athletes** — roster, stage distribution, evaluation completion rate.
- **Coaches** — certification status, lesson volume, marketplace activity.
- **Programs** — adoption %, completion %, top pillars trained.
- **Outcomes** — recruiting placements, showcase attendance, average ADS lift.
- **Licensing** — seats used / available, renewal date, expansion CTA.

Surface as `/org` (admin/owner only), with cards that link into existing detail pages.

---

## 4. The Unified Athlete Journey

```text
   LAND                ASSESS              TRAIN               GET SEEN           SCALE
   ────                ──────              ─────               ────────           ─────
 Home / Eddie  →   Free Evaluation  →   Your Path (Programs/  →  Recruiting    →  (Coach: Cert+Mktplc)
 entry CTA         (creates Profile)    Bundles + Coach)         Audit + Events    (Org: License+Cmd Ctr)
                          │                   │                       │
                          ▼                   ▼                       ▼
                   AthleteState         Progress OS            Recruiting Hub
                   (one object)         (milestones,           (checklist, contacts,
                                         streaks, deltas)       showcases, profile)
                          ▲                   ▲                       ▲
                          └─── Eddie reads all of these on every page ────┘
```

Every page answers three questions in a single header strip:
1. **What is this?** (one-line description)
2. **Who is it for?** (chip: Athlete / Parent / Coach / Org)
3. **What should I do next?** (Pathway Engine button)

---

## 5. "Your Path" surface

A single screen at `/path` (also embedded as the top card on `/dashboard`):

```text
┌─────────────────────────────────────────────┐
│  YOUR PATH                  Stage: Developing│
│  ─────────────────────────────────────────── │
│  ▸ NEXT ACTION                               │
│    Continue Velocity System — Week 3         │
│    [Resume program]                          │
│                                              │
│  ▸ ALSO RECOMMENDED                          │
│    • Recruiting Audit (you're 14U+)          │
│    • Book a velo check with Coach Bernard    │
│                                              │
│  ▸ THIS MONTH                                │
│    +6 ADS pts · 2 lessons · 9-day streak     │
│    [See progress details]                    │
└─────────────────────────────────────────────┘
```

Driven entirely by `AthleteState` + `computeNextAction`. No new data sources.

---

## 6. Phased rollout

I'll ship in phases, each independently shippable, no rework.

```text
PHASE A — Foundation (the spine)
  A1. Build vw_athlete_state DB view + useAthleteState() hook
  A2. Build pathway engine (pure TS, fully unit-testable)
  A3. Add /path route + dashboard "Your Path" card
  A4. Wire 3-question header strip component (used by every bucket page)

PHASE B — Eddie becomes intelligent
  B1. Inject AthleteState + top recommendations into Eddie prompts
  B2. Eddie behavior map per bucket (Assess / Train / Get Seen / Scale)
  B3. Idle prompts surface top Pathway recommendation

PHASE C — Progress OS
  C1. Milestones derivation from existing tables
  C2. Reassessment cadence + delta display
  C3. Monthly summary card + streak indicator
  C4. "What changed / what next" on dashboard

PHASE D — Org Command Center consolidation
  D1. /org landing under Scale bucket
  D2. Roster, coach activity, program adoption cards
  D3. License seat tracker + expansion CTA
  D4. Outcomes view (placements, showcase attendance, ADS lift)

PHASE E — Connective polish
  E1. Every product page gets Pathway-aware "next step" CTA
  E2. Post-purchase flows route into Your Path, not a generic success page
  E3. Coach + Org variants of Your Path
  E4. End-to-end smoke test of the 5 personas
```

Recommended order: **A → B → C → D → E**. Phase A is the unlock — once `AthleteState` and the Pathway Engine exist, B/C/D are mostly wiring.

---

## 7. Constraints respected

- No rebrand. No homepage hero copy edits.
- No removed products. No removed routes.
- No legacy WebRTC, Course Access, or Baseball booking changes.
- Sport parity preserved (every layer reads `sport` from profile).
- Mobile checkout still uses `openCheckout`.
- No cookie banners.
- Additions are **modular** — `useAthleteState`, `pathway/engine`, `<NextActionStrip>`, `/path`, `/org` consolidation. Existing pages keep working untouched until they opt in.

---

## 8. Open questions before I start Phase A

1. **DB view vs computed in app**: prefer a Postgres view (`vw_athlete_state`) so RLS handles security and dashboards stay fast. OK to add this read-only view? (Recommended: yes.)
2. **Pathway Engine source of truth**: pure TS in `src/lib/pathway/` so it's testable and runs client-side. Edge function only if a recommendation requires data the client can't see. OK? (Recommended: yes.)
3. **Your Path placement**: new `/path` route + embedded card on `/dashboard`. Should `/dashboard` redirect to `/path` for athletes, or keep both? (Recommended: keep both, dashboard embeds the card.)
4. **Eddie prompt size**: injecting `AthleteState` adds ~400–800 tokens per request. OK to accept the cost for the intelligence upgrade? (Recommended: yes — gate the heaviest fields behind the bucket.)

Approve the plan (or answer the 4 questions) and I'll start with **Phase A1 — `vw_athlete_state` view + `useAthleteState()` hook**.
