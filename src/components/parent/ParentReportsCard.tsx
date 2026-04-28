import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown } from "lucide-react";
import { format } from "date-fns";
import { templateByKey } from "@/lib/evaluations/templates";
import {
  generateDevelopmentReportPDF,
} from "@/lib/evaluations/developmentReport";
import { toast } from "@/hooks/use-toast";

interface Props {
  athleteId: string;
  athleteName: string;
}

interface SavedReport {
  id: string;
  program_label: string;
  age_group: string;
  template_key: string;
  payload: Record<string, unknown>;
  coach_notes: string | null;
  goals: string | null;
  overall_score: number | null;
  generated_at: string;
}

const ParentReportsCard = ({ athleteId, athleteName }: Props) => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["parent-dev-reports", athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("development_reports" as any)
        .select("*")
        .eq("athlete_user_id", athleteId)
        .order("generated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SavedReport[];
    },
  });

  const handleDownload = (r: SavedReport) => {
    try {
      const tpl = templateByKey(r.template_key);
      const p = r.payload as any;
      const goalsArr = (r.goals ?? "")
        .split("\n").map((g) => g.trim()).filter(Boolean);

      // Re-render PDF from the snapshot's averaged scores so we get the same
      // styled output even if evaluations change later.
      const fakeEval = {
        id: "snapshot",
        athlete_user_id: athleteId,
        evaluator_user_id: "",
        template_key: r.template_key,
        age_group: r.age_group,
        scores: p.averaged_scores ?? {},
        category_notes: {},
        session_note: null,
        session_label: null,
        overall_score: r.overall_score,
        evaluated_at: r.generated_at,
        created_at: r.generated_at,
      };

      const { doc, fileName } = generateDevelopmentReportPDF({
        athleteName,
        programLabel: r.program_label,
        ageLabel: p.age_label,
        template: tpl,
        evaluations: [fakeEval as any],
        metrics: p.metrics ?? [],
        coachName: p.coach_name ?? undefined,
        coachNotes: r.coach_notes ?? undefined,
        goals: goalsArr,
      });
      doc.save(fileName);
    } catch (e) {
      toast({ title: "Download failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="mt-3 p-3 bg-secondary/40 rounded-xl flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading reports…
      </div>
    );
  }
  if (!reports?.length) return null;

  const latest = reports[0];
  return (
    <div className="mt-3 p-3 bg-primary/5 rounded-xl flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Latest development report</p>
        <p className="text-sm text-foreground font-medium truncate">{latest.program_label}</p>
        <p className="text-[11px] text-muted-foreground">
          {format(new Date(latest.generated_at), "MMM d, yyyy")}
          {latest.overall_score != null ? ` · ${latest.overall_score.toFixed(1)}/10` : ""}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload(latest); }}
      >
        <FileDown className="w-3.5 h-3.5 mr-1" /> Download
      </Button>
    </div>
  );
};

export default ParentReportsCard;
