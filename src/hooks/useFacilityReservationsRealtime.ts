import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to live INSERT / UPDATE / DELETE on facility_reservations and
 * invalidate the React Query cache so any DayGridView / WeekView mounted in
 * another admin's browser updates within ~1 second.
 *
 * Phase 2 Sprint 2 hardening:
 *   - Burst handling: invalidations are debounced into a 150ms window so a
 *     50-event burst causes ~1 invalidation, not 50.
 *   - Reconnect: when the channel re-subscribes after a disconnect, we force
 *     a fresh invalidation to backfill anything missed offline.
 *   - Status: returns { status } so a small "Reconnecting…" badge can render
 *     in the parent view when the realtime channel drops.
 *   - Cleanup: removeChannel() is the single source of cleanup truth.
 */
export type RealtimeStatus = "connecting" | "subscribed" | "disconnected";

export const useFacilityReservationsRealtime = () => {
  const qc = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const wasSubscribed = useRef(false);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleInvalidate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["facility-reservations"] });
      }, 150);
    };

    const channel = supabase
      .channel("facility-reservations-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "facility_reservations" },
        () => scheduleInvalidate(),
      )
      .subscribe((sub) => {
        if (sub === "SUBSCRIBED") {
          // If we were previously subscribed and dropped, this is a reconnect:
          // backfill anything we missed while offline.
          if (wasSubscribed.current) {
            qc.invalidateQueries({ queryKey: ["facility-reservations"] });
          }
          wasSubscribed.current = true;
          setStatus("subscribed");
        } else if (sub === "CHANNEL_ERROR" || sub === "TIMED_OUT" || sub === "CLOSED") {
          setStatus("disconnected");
        }
      });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return { status };
};
