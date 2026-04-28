
-- Replace Spring 2026 tryout dates with new schedule
DELETE FROM tryout_events WHERE name LIKE 'Spring 2026 Tryout%';

-- New dates: 5/26, 5/28, 6/2, 6/4, 6/9, 6/11 — all 6:00-8:30 PM ET (22:00-00:30 UTC during EDT)
-- Pair 1 (5/26 & 5/28) published; remaining pairs draft for sequential release
INSERT INTO tryout_events (name, age_group, starts_at, ends_at, location_name, address, price_cents, capacity, waitlist_capacity, status)
VALUES
  ('Spring 2026 Tryout — Ages 9-12',  '9-12',  '2026-05-26 22:00:00+00', '2026-05-27 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'published'),
  ('Spring 2026 Tryout — Ages 13-17', '13-17', '2026-05-26 22:00:00+00', '2026-05-27 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'published'),
  ('Spring 2026 Tryout — Ages 9-12',  '9-12',  '2026-05-28 22:00:00+00', '2026-05-29 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'published'),
  ('Spring 2026 Tryout — Ages 13-17', '13-17', '2026-05-28 22:00:00+00', '2026-05-29 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'published'),
  ('Spring 2026 Tryout — Ages 9-12',  '9-12',  '2026-06-02 22:00:00+00', '2026-06-03 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'draft'),
  ('Spring 2026 Tryout — Ages 13-17', '13-17', '2026-06-02 22:00:00+00', '2026-06-03 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'draft'),
  ('Spring 2026 Tryout — Ages 9-12',  '9-12',  '2026-06-04 22:00:00+00', '2026-06-05 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'draft'),
  ('Spring 2026 Tryout — Ages 13-17', '13-17', '2026-06-04 22:00:00+00', '2026-06-05 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'draft'),
  ('Spring 2026 Tryout — Ages 9-12',  '9-12',  '2026-06-09 22:00:00+00', '2026-06-10 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'draft'),
  ('Spring 2026 Tryout — Ages 13-17', '13-17', '2026-06-09 22:00:00+00', '2026-06-10 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'draft'),
  ('Spring 2026 Tryout — Ages 9-12',  '9-12',  '2026-06-11 22:00:00+00', '2026-06-12 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'draft'),
  ('Spring 2026 Tryout — Ages 13-17', '13-17', '2026-06-11 22:00:00+00', '2026-06-12 00:30:00+00', '22M Training Facility', '31 Park Rd, Tinton Falls, NJ 07724', 0, 24, 12, 'draft');
