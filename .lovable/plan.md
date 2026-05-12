# VAULT Scheduling OS — Internal Booking & Calendar Hub

## 1. Audit of what already exists (will be reused, not replaced)

**Pages already shipping booking/scheduling:**
- `/admin/facility` — `OwnerFacility` + `DayGridView`, `WeekView`, `MultiResourceBookingWizard`, `ReservationDialog`, `FloorPlanEditor`, `FacilitySettingsPanel`
- `/admin/essa-bookings` — `OwnerEssaBookings` (private-lesson ops)
- `/coach/schedule` — `CoachSchedule` (personal day/week)
- `/coach/essa-day` — `CoachEssaDay` (today's lessons for the coach)
- `/coach/lessons` — `CoachLessons` (assigned remote/in-person lessons)
- Client-facing (untouched): `/book-session`, `/remote-lessons`, `/lesson-packages`, `/find-coach`

**Tables already in place (will be reused):**
- `facility_reservations` — has `space_id`, `coach_user_id`, `coach_availability_id`, `status`, `created_by`, `recurrence_rule`, `cancellation_reason`. This is already the canonical "booking" row.
- `facility_spaces` + `facility_settings` + `facility_hours` — resource catalog
- `coach_availability` — recurring weekly blocks per coach
- `remote_lessons`, `marketplace_bookings`, `session_bookings`, `lesson_credits` — legacy/specialized (read-only joins)
- `schedule_assignments` — training-plan assignments

**Verdict:** the data model is solid. We do **not** need new core tables — only thin additions for buffer time, audit trail, blackout blocks, and a unified status enum. The fix is **organization + access control + a single ops cockpit** on top of what exists.

## 2. Architecture — additive, not a rewrite

```text
                   ┌───────────────────────────────────┐
                   │   /ops  (Scheduling OS hub)       │  ← NEW shell
                   │   AuthGuard + role gate           │
                   └────────────┬──────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   /ops/calendar          /ops/bookings           /ops/resources
   day/week/month         table + filters         spaces + blackouts
        │                       │                       │
        └────────── reads/writes via ────────────────────┘
                    useSchedulingOps (new hook)
                              │
       ┌──────────────────────┼─────────────────────────┐
       ▼                      ▼                         ▼
  facility_reservations   coach_availability     facility_spaces
  remote_lessons (RO)     coach_blackouts (NEW)  facility_settings
  marketplace_bookings(RO)
```

- **No legacy table is altered.** The legacy WebRTC, Course Access, and Baseball booking systems remain locked per project memory.
- All new UI lives under `/ops/*` and reuses the existing components (`DayGridView`, `WeekView`, `ReservationDialog`, `MultiResourceBookingWizard`).
- One new edge function (`scheduling-mutate`) wraps create/update/cancel so we get atomic conflict checks + audit logging in one place.

## 3. Role / permission model

| Capability | Admin / Owner | Coach | Client |
|---|---|---|---|
| Access `/ops/*` | ✅ | ✅ | ❌ (404 redirect via `<AuthGuard requireRole={['owner','coach']}/>`) |
| See all coach calendars | ✅ | ❌ (own only) | — |
| Create/cancel any booking | ✅ | ✅ own + assigned | — |
| Reassign coach on a booking | ✅ | ❌ | — |
| Edit `facility_spaces` / blackouts | ✅ | ❌ | — |
| Override availability | ✅ | ❌ | — |
| Audit log view | ✅ | ❌ | — |

Enforcement layers (defense in depth):
1. **Route gate** — `<AuthGuard requireRole>` blocks render
2. **Nav visibility** — `Navbar`/sidebar hides `/ops` for non-staff
3. **RLS** — all new policies use the existing `has_role()` security-definer; coaches see WHERE `coach_user_id = auth.uid()`, owners see all
4. **Edge function** — `scheduling-mutate` re-checks role server-side before any write

## 4. Dashboard & calendar structure

### `/ops` (default landing — "Today")
- Top strip: today's count by status (Confirmed / Pending / Completed / No-show / Canceled)
- Left: today's timeline grouped by coach (admin) or own day (coach)
- Right: quick actions — New booking · Block time · Find conflict
- Realtime badge using existing `RealtimeStatusBadge`

### `/ops/calendar`
- Toggle: **Day · Week · Month**
- Filters: coach, space, booking type, status
- Reuses `DayGridView` / `WeekView`; adds a lightweight Month grid
- Click cell → `ReservationDialog` (existing) extended with new booking-type & buffer fields
- Drag-to-reschedule (admin-only) calling `scheduling-mutate`

### `/ops/bookings`
- Searchable, filterable table (coach, client, type, location, date range, status)
- Bulk actions: confirm, cancel, mark no-show, export CSV
- Row drawer: full detail + audit history

### `/ops/resources`
- Spaces, hours, blackouts (uses `FacilitySettingsPanel` + `FloorPlanEditor`)
- New: per-space buffer minutes, allowed booking types

### `/ops/coaches` (admin only)
- Per-coach availability editor (reuses `CoachAvailabilitySync`)
- Blackout windows
- Quick "view as coach" link

## 5. Reusable booking workflow

One hook, one server entrypoint, used by every surface:

```text
useSchedulingOps()
  ├─ list({ from, to, coachId?, spaceId?, status?, type? })
  ├─ create(draft)        ──► edge: scheduling-mutate (action:'create')
  ├─ update(id, patch)    ──► edge: scheduling-mutate (action:'update')
  ├─ cancel(id, reason)   ──► edge: scheduling-mutate (action:'cancel')
  └─ subscribe()          (realtime channel on facility_reservations)
```

The `scheduling-mutate` edge function:
1. Validates role + ownership
2. Runs `lock_facility_reservation_window(space_id, coach_id, starts_at, ends_at, buffer_min)` — a new SECURITY DEFINER RPC that takes a row-lock on conflicting rows and returns a conflict code if any exist (or with the buffer)
3. Inserts/updates `facility_reservations`
4. Writes a row to `scheduling_audit_log`
5. Returns the saved booking

This guarantees **no double-booking** even under concurrent clicks, and gives us **full auditability** out of the box.

## 6. Phased implementation

**Phase 1 — Access shell + cockpit (small, ships immediately)**
- Add `<AuthGuard requireRole={['owner','coach']}>` capability
- New routes `/ops`, `/ops/calendar`, `/ops/bookings`, `/ops/resources`, `/ops/coaches`
- New `OpsLayout` with sidebar; nav entry visible only to staff
- "Today" cockpit reading existing `facility_reservations`

**Phase 2 — Unified calendar + filters**
- Mount existing `DayGridView`/`WeekView` under `/ops/calendar` with admin/coach scoping
- Add Month view (lightweight grid)
- Filter bar (coach / space / type / status)

**Phase 3 — Booking lifecycle hardening (DB + edge)**
- Migration: add `booking_type`, `buffer_before_min`, `buffer_after_min`, `internal_notes` columns to `facility_reservations`; add `scheduling_audit_log` and `coach_blackouts` tables; add `lock_facility_reservation_window` RPC
- New `scheduling-mutate` edge function
- Refactor `ReservationDialog` to use it
- Status enum normalized: `pending | confirmed | completed | canceled | no_show`

**Phase 4 — Coach self-service & admin overrides**
- Coach availability editor under `/ops/coaches/me`
- Admin "view as coach" + reassign action
- Bulk actions on bookings table
- CSV export + simple operational report (bookings/coach/week, utilization/space)

**Phase 5 — Polish**
- Mobile-tuned day view for coaches on the floor
- Drag-to-reschedule (admin)
- Realtime conflict badges
- Empty/loading/error states standardized

## 7. What is explicitly NOT changing
- `/book-session`, `/remote-lessons`, `/lesson-packages`, `/find-coach` (client-facing flows) — untouched
- Legacy WebRTC, Course Access, Baseball booking — untouched (per Core memory)
- `marketplace_bookings`, `remote_lessons`, `session_bookings` schemas — read-only joins in the new UI
- Existing `/admin/facility` and `/coach/schedule` keep working; `/ops` becomes the canonical hub and old routes can later redirect once parity is proven

## Technical details (for engineering)

- **Auth gate component:** extend existing `AuthGuard` to accept `requireRole?: AppRole[]`. If user lacks role → redirect to `/dashboard` (or `/` for non-auth).
- **RLS additions:** every new table uses `has_role(auth.uid(),'owner')` or `coach_user_id = auth.uid()` patterns — no recursive policies.
- **No price/payment work.** Internal scheduling does not touch the checkout service we just unified.
- **Idempotency:** `scheduling-mutate` accepts an optional client `idempotency_key` to dedupe accidental double-submits.
- **Realtime:** `ALTER PUBLICATION supabase_realtime ADD TABLE facility_reservations` (verify if not already added) so the cockpit and calendars update live.
- **Mobile:** stays inside the same Capacitor shell; no native changes needed.

Approve this plan and I'll start with Phase 1 (access shell + cockpit) and Phase 3's migration in parallel, since those are the foundation everything else builds on.
