import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to live INSERT / UPDATE / DELETE on facility_reservations and
 * invalidate the relevant React Query cache so any DayGridView / WeekView
 * mounted in another admin's browser updates within ~1 second.
 *
 * Phase 2 keeps the scope minimal: bookings only, not spaces or coach
 * availability (per Master Build Spec §18 decision).
 */
export const useFacilityReservationsRealtime = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("facility-reservations-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "facility_reservations" },
        () => {
          // Invalidate every cached range — cheap, the queries will only
          // refetch the visible date window.
          qc.invalidateQueries({ queryKey: ["facility-reservations"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
};
