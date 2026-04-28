import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { computeOverall, templateByKey, TemplateKey } from "@/lib/evaluations/templates";
import { toast } from "@/hooks/use-toast";

export interface EvaluationRow {
  id: string;
  athlete_user_id: string;
  evaluator_user_id: string;
  template_key: string;
  age_group: string;
  scores: Record<string, number>;
  category_notes: Record<string, string>;
  session_note: string | null;
  session_label: string | null;
  overall_score: number | null;
  evaluated_at: string;
  created_at: string;
}

export const usePlayerEvaluations = (athleteId?: string | null) => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["player-evaluations", athleteId],
    enabled: !!athleteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_evaluations" as any)
        .select("*")
        .eq("athlete_user_id", athleteId!)
        .order("evaluated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as EvaluationRow[];
    },
  });

  const save = useMutation({
    mutationFn: async (input: {
      athleteId: string;
      templateKey: TemplateKey;
      ageGroup: string;
      scores: Record<string, number>;
      categoryNotes: Record<string, string>;
      sessionNote?: string;
      sessionLabel?: string;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not authenticated");

      const tpl = templateByKey(input.templateKey);
      const overall = computeOverall(tpl, input.scores);

      const { data, error } = await supabase
        .from("player_evaluations" as any)
        .insert({
          athlete_user_id: input.athleteId,
          evaluator_user_id: u.user.id,
          template_key: input.templateKey,
          age_group: input.ageGroup,
          scores: input.scores,
          category_notes: input.categoryNotes,
          session_note: input.sessionNote ?? null,
          session_label: input.sessionLabel ?? null,
          overall_score: overall,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["player-evaluations"] });
      toast({ title: "Evaluation saved", description: "Scores recorded for this session." });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save", description: e.message, variant: "destructive" }),
  });

  return { evaluations: list.data ?? [], isLoading: list.isLoading, save };
};
