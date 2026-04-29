ALTER TABLE public.facility_reservations
  ADD COLUMN IF NOT EXISTS coach_availability_id uuid,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS credit_id uuid;

COMMENT ON COLUMN public.facility_reservations.coach_availability_id IS
  'Placeholder: future FK to coach_availability slot that fulfilled this booking.';
COMMENT ON COLUMN public.facility_reservations.cancellation_reason IS
  'Placeholder: free-text reason captured when a reservation is cancelled (customer/no-show/coach/weather).';
COMMENT ON COLUMN public.facility_reservations.credit_id IS
  'Placeholder: future FK to prepaid lesson credit consumed by this booking.';