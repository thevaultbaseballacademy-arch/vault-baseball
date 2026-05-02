import { useMemo } from "react";
import { usePublicTryouts } from "@/hooks/useTryouts";

export interface UpcomingTryout {
  id: string;
  name: string;
  starts_at: string;
  age_group: string | null;
  location_name: string | null;
}

/**
 * Returns the next published tryout event (within optional day window).
 * Used to drive conditional nav visibility + homepage CTA card.
 */
export const useUpcomingTryout = (withinDays: number | null = null) => {
  const { data: events, isLoading } = usePublicTryouts();

  const filteredEvents = useMemo(() => {
    if (!events?.length) return [];
    if (withinDays === null) return events;

    const cutoff = Date.now() + withinDays * 24 * 60 * 60 * 1000;
    return events.filter((event) => new Date(event.starts_at).getTime() <= cutoff);
  }, [events, withinDays]);

  const tryout = (filteredEvents[0] as UpcomingTryout | undefined) ?? null;
  const hasAny = (events?.length ?? 0) > 0;
  const loading = isLoading;

  return { tryout, hasAny, loading };
};
