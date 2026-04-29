import { WifiOff } from "lucide-react";
import { useFacilityReservationsRealtime } from "@/hooks/useFacilityReservationsRealtime";

/**
 * Small badge that shows when the facility realtime channel has dropped.
 * Disappears within ~1s of reconnection. Mount once near the top of any
 * facility view that already calls useFacilityReservationsRealtime — or
 * just mount this component directly and skip the hook call elsewhere.
 *
 * Note: this calls the hook itself, so the parent should NOT also call
 * useFacilityReservationsRealtime() — pick one or the other.
 */
export const RealtimeStatusBadge = () => {
  const { status } = useFacilityReservationsRealtime();
  if (status !== "disconnected") return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[11px] font-medium"
    >
      <WifiOff className="w-3 h-3" />
      Reconnecting…
    </div>
  );
};
