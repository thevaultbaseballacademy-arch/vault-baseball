import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [tryout, setTryout] = useState<UpcomingTryout | null>(null);
  const [hasAny, setHasAny] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const nowIso = new Date().toISOString();
        let query = supabase
          .from("tryout_events")
          .select("id, name, starts_at, age_group, location_name")
          .eq("status", "published")
          .gte("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(1);

        if (withinDays !== null) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() + withinDays);
          query = query.lte("starts_at", cutoff.toISOString());
        }

        const { data } = await query;

        const { data: anyData } = await supabase
          .from("tryout_events")
          .select("id")
          .eq("status", "published")
          .gte("starts_at", nowIso)
          .limit(1);

        if (!active) return;
        setHasAny((anyData?.length ?? 0) > 0);
        setTryout(data && data.length > 0 ? (data[0] as UpcomingTryout) : null);
      } catch {
        if (active) {
          setTryout(null);
          setHasAny(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [withinDays]);

  return { tryout, hasAny, loading };
};
