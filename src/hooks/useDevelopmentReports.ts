import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface DevReportRow {
  id: string;
  athlete_user_id: string;
  generated_by: string;
  program_label: string;
  age_group: string;
  template_key: string;
  payload: Record<string, unknown>;
  coach_notes: string | null;
  goals: string | null;
  overall_score: number | null;
  generated_at: string;
}

export const useDevelopmentReports = (athleteId?: string | null) => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["development-reports", athleteId],
    enabled: !!athleteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("development_reports" as any)
        .select("*")
        .eq("athlete_user_id", athleteId!)
        .order("generated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DevReportRow[];
    },
  });

  const save = useMutation({
    mutationFn: async (input: {
      athleteId: string;
      programLabel: string;
      ageGroup: string;
      templateKey: string;
      payload: Record<string, unknown>;
      coachNotes?: string;
      goals?: string;
      overallScore?: number | null;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("development_reports" as any)
        .insert({
          athlete_user_id: input.athleteId,
          generated_by: u.user.id,
          program_label: input.programLabel,
          age_group: input.ageGroup,
          template_key: input.templateKey,
          payload: input.payload,
          coach_notes: input.coachNotes ?? null,
          goals: input.goals ?? null,
          overall_score: input.overallScore ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["development-reports"] });
      toast({ title: "Report saved", description: "Snapshot stored for parent access." });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save report", description: e.message, variant: "destructive" }),
  });

  return { reports: list.data ?? [], isLoading: list.isLoading, save };
};
