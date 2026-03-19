import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ParentLink {
  id: string;
  parent_user_id: string;
  athlete_user_id: string;
  status: string;
  linked_at: string | null;
  link_code: string;
  created_at: string;
}

export interface LinkedAthleteData {
  profile: {
    display_name: string;
    avatar_url: string | null;
    position: string | null;
    graduation_year: number | null;
    height_inches: number | null;
    weight_lbs: number | null;
    sport_type: string;
  } | null;
  development_score: {
    overall_score: number;
    training_consistency: number;
    skill_development: number;
    work_ethic: number;
    weekly_focus: string | null;
    lessons_attended: number;
    lessons_missed: number;
    homework_completed: number;
    homework_total: number;
  } | null;
  recent_kpis: Array<{
    kpi_name: string;
    kpi_category: string;
    kpi_value: number;
    kpi_unit: string | null;
    recorded_at: string;
  }> | null;
  recent_lessons: Array<{
    id: string;
    lesson_focus: string | null;
    strengths_observed: string | null;
    areas_for_improvement: string | null;
    ai_summary: string | null;
    created_at: string;
  }> | null;
  checkins: Array<{
    checkin_date: string;
    energy_level: number | null;
    mood: number | null;
    training_completed: boolean | null;
    soreness_level: number | null;
  }> | null;
  recruiting: {
    commitment_status: string;
    committed_school: string | null;
    gpa: number | null;
    division_target: string[];
  } | null;
}

export const useParentPortal = () => {
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [athleteData, setAthleteData] = useState<Record<string, LinkedAthleteData>>({});
  const { toast } = useToast();

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("parent_athlete_links")
        .select("*")
        .eq("parent_user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks((data as any[]) || []);
    } catch (err) {
      console.error("Error fetching parent links:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const linkAthlete = async (athleteEmail: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Find athlete by email via profiles
    const { data: profileData } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", athleteEmail.toLowerCase())
      .maybeSingle();

    if (!profileData) {
      toast({ title: "Athlete not found", description: "No account found with that email.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("parent_athlete_links").insert({
      parent_user_id: session.user.id,
      athlete_user_id: profileData.user_id,
    } as any);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already linked", description: "You already have a link to this athlete.", variant: "destructive" });
      } else {
        throw error;
      }
      return;
    }

    toast({ title: "Link request sent", description: "Your athlete will need to approve the connection." });
    await fetchLinks();
  };

  const fetchAthleteData = async (athleteUserId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const { data, error } = await supabase.rpc("get_parent_athlete_data", {
        p_parent_id: session.user.id,
        p_athlete_id: athleteUserId,
      });

      if (error) throw error;
      setAthleteData((prev) => ({ ...prev, [athleteUserId]: data as unknown as LinkedAthleteData }));
    } catch (err) {
      console.error("Error fetching athlete data:", err);
    }
  };

  const activeLinks = links.filter((l) => l.status === "active");
  const pendingLinks = links.filter((l) => l.status === "pending");

  return {
    links, activeLinks, pendingLinks, loading,
    athleteData, linkAthlete, fetchAthleteData, refetch: fetchLinks,
  };
};
