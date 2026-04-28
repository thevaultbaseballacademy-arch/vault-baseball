import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronLeft, Save, FileDown, Loader2, History, ClipboardList, FileText,
} from "lucide-react";
import { format } from "date-fns";
import { templateByKey, templateForAge, TemplateKey, rubricTier, computeOverall } from "@/lib/evaluations/templates";
import { usePlayerEvaluations } from "@/hooks/usePlayerEvaluations";
import { useDevelopmentReports } from "@/hooks/useDevelopmentReports";
import { generateDevelopmentReportPDF, averageScores } from "@/lib/evaluations/developmentReport";

const CoachEvaluateAthlete = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const navigate = useNavigate();

  // Athlete profile
  const { data: athlete, isLoading: profileLoading } = useQuery({
    queryKey: ["athlete-profile-eval", athleteId],
    enabled: !!athleteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, position, graduation_year")
        .eq("user_id", athleteId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const computedAge = athlete?.graduation_year
    ? Math.max(8, Math.min(18, 18 - (athlete.graduation_year - new Date().getFullYear())))
    : 11;

  const { evaluations, isLoading: evalsLoading, save } = usePlayerEvaluations(athleteId);
  const { reports, save: saveReport } = useDevelopmentReports(athleteId);

  const [templateKey, setTemplateKey] = useState<TemplateKey>(
    templateForAge(computedAge).key,
  );
  useEffect(() => {
    setTemplateKey(templateForAge(computedAge).key);
  }, [computedAge]);

  const template = templateByKey(templateKey);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({});
  const [sessionNote, setSessionNote] = useState("");
  const [sessionLabel, setSessionLabel] = useState("");

  const overall = useMemo(() => computeOverall(template, scores), [template, scores]);

  const handleSave = async () => {
    if (!athleteId) return;
    if (Object.keys(scores).length === 0) return;
    await save.mutateAsync({
      athleteId,
      templateKey,
      ageGroup: template.ageGroup,
      scores,
      categoryNotes,
      sessionNote: sessionNote.trim() || undefined,
      sessionLabel: sessionLabel.trim() || undefined,
    });
    setScores({});
    setCategoryNotes({});
    setSessionNote("");
    setSessionLabel("");
  };

  // ── Report generation ────────────────────────────────
  const [programLabel, setProgramLabel] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [goalsText, setGoalsText] = useState("");

  const { data: kpis } = useQuery({
    queryKey: ["athlete-kpis-for-report", athleteId],
    enabled: !!athleteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_kpis")
        .select("kpi_name, kpi_value, kpi_unit, recorded_at")
        .eq("user_id", athleteId!)
        .order("recorded_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  /** Build pre/post metrics from KPIs (first vs latest per metric name) */
  const buildMetrics = () => {
    const map = new Map<string, { pre: number; post: number; unit?: string }>();
    for (const k of kpis ?? []) {
      const existing = map.get(k.kpi_name);
      if (!existing) {
        map.set(k.kpi_name, { pre: k.kpi_value, post: k.kpi_value, unit: k.kpi_unit ?? undefined });
      } else {
        existing.post = k.kpi_value;
      }
    }
    return Array.from(map.entries())
      .filter(([, v]) => v.pre !== v.post)
      .slice(0, 8)
      .map(([label, v]) => ({ label, pre: v.pre, post: v.post, unit: v.unit }));
  };

  const handleGenerateReport = async () => {
    if (!athleteId) return;
    const metrics = buildMetrics();
    const goalsArr = goalsText
      .split("\n")
      .map((g) => g.trim())
      .filter(Boolean);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: coach } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user?.id ?? "")
      .maybeSingle();

    const { doc, fileName, payload } = generateDevelopmentReportPDF({
      athleteName: athlete?.display_name ?? "Athlete",
      programLabel: programLabel.trim() || `${template.label} · ${format(new Date(), "MMM yyyy")}`,
      ageLabel: `Age ${computedAge} · ${format(new Date(), "MMM yyyy")}`,
      template,
      evaluations,
      metrics,
      coachName: coach?.display_name ?? undefined,
      coachNotes: reportNotes,
      goals: goalsArr,
    });

    doc.save(fileName);

    const { overall: ov } = averageScores(template, evaluations);
    await saveReport.mutateAsync({
      athleteId,
      programLabel: programLabel.trim() || `${template.label} · ${format(new Date(), "MMM yyyy")}`,
      ageGroup: template.ageGroup,
      templateKey: template.key,
      payload,
      coachNotes: reportNotes || undefined,
      goals: goalsText || undefined,
      overallScore: ov,
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32">
      <Button variant="ghost" size="sm" onClick={() => navigate("/coach/evaluations")} className="mb-3">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      {/* Athlete header */}
      <div className="flex items-center gap-3 mb-4">
        {athlete?.avatar_url ? (
          <img src={athlete.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-bold">
            {(athlete?.display_name ?? "A").slice(0, 1)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-display truncate">{athlete?.display_name ?? "Athlete"}</h1>
          <div className="text-xs text-muted-foreground">
            {athlete?.position ?? "Pitcher"} · Age {computedAge}
          </div>
        </div>
        <Badge variant="outline">{template.ageGroup}</Badge>
      </div>

      <Tabs defaultValue="score" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="score"><ClipboardList className="w-4 h-4 mr-1" />Score</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-1" />History</TabsTrigger>
          <TabsTrigger value="report"><FileText className="w-4 h-4 mr-1" />Report</TabsTrigger>
        </TabsList>

        {/* SCORE */}
        <TabsContent value="score" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={templateKey} onValueChange={(v) => setTemplateKey(v as TemplateKey)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pitching_9_12">Foundations · Ages 9–12</SelectItem>
                  <SelectItem value="pitching_13_17">Refinement · Ages 13–17</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Session label (e.g. Session 3 of 5)"
                value={sessionLabel}
                onChange={(e) => setSessionLabel(e.target.value)}
                className="h-11"
              />
            </CardContent>
          </Card>

          {template.categories.map((cat) => {
            const value = scores[cat.key];
            return (
              <Card key={cat.key}>
                <CardContent className="pt-5 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold tracking-wide">{cat.label.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">
                        Weight {Math.round(cat.weight * 100)}% · {cat.description}
                      </div>
                    </div>
                    <div className="text-2xl font-display tabular-nums">
                      {value != null ? `${value}/10` : "—"}
                    </div>
                  </div>
                  <Slider
                    value={[value ?? 5]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={([v]) => setScores((s) => ({ ...s, [cat.key]: v }))}
                    className="py-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                    {[1, 3, 5, 7, 10].map((n) => <span key={n}>{n}</span>)}
                  </div>
                  {value != null && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">{rubricTier(value).tier}</span> — {rubricTier(value).description}
                    </div>
                  )}
                  <Input
                    placeholder="Optional category note"
                    value={categoryNotes[cat.key] ?? ""}
                    onChange={(e) => setCategoryNotes((n) => ({ ...n, [cat.key]: e.target.value }))}
                    className="h-10 text-sm"
                  />
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardContent className="pt-5 space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Session note</Label>
              <Textarea
                placeholder="Quick note from this session…"
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {overall != null && (
            <Card className="bg-primary/10 border-primary/40">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Overall (weighted)</div>
                  <div className="text-3xl font-display">{overall.toFixed(2)} / 10</div>
                </div>
                <Badge>{rubricTier(overall).tier}</Badge>
              </CardContent>
            </Card>
          )}

          <div className="sticky bottom-4 pt-2 z-10">
            <Button
              onClick={handleSave}
              disabled={save.isPending || Object.keys(scores).length === 0}
              className="w-full h-14 text-base shadow-lg"
            >
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save evaluation
            </Button>
          </div>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history" className="space-y-3 mt-4">
          {evalsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : evaluations.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No evaluations yet.</CardContent></Card>
          ) : (
            evaluations.map((e) => {
              const tpl = templateByKey(e.template_key);
              return (
                <Card key={e.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-bold">
                        {e.session_label || format(new Date(e.evaluated_at), "MMM d, yyyy")}
                      </div>
                      <Badge variant="outline">{e.overall_score?.toFixed(1) ?? "—"}/10</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {tpl.categories.map((c) => (
                        <div key={c.key} className="flex justify-between">
                          <span className="text-muted-foreground">{c.label}</span>
                          <span className="font-bold tabular-nums">{e.scores?.[c.key] ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                    {e.session_note && (
                      <div className="mt-2 text-xs italic text-muted-foreground">"{e.session_note}"</div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* REPORT */}
        <TabsContent value="report" className="space-y-3 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generate Development Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Program label</Label>
                <Input
                  placeholder="Spring 2026 Youth Pitching Lab"
                  value={programLabel}
                  onChange={(e) => setProgramLabel(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Coach notes</Label>
                <Textarea
                  rows={4}
                  placeholder="Highlights, focus areas, what's next…"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Goals (one per line)</Label>
                <Textarea
                  rows={4}
                  placeholder={"Hit 75 mph by end of program\nDevelop reliable changeup grip"}
                  value={goalsText}
                  onChange={(e) => setGoalsText(e.target.value)}
                />
              </div>
              <Button onClick={handleGenerateReport} disabled={saveReport.isPending} className="w-full h-12">
                {saveReport.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
                Generate PDF & save snapshot
              </Button>
              <p className="text-xs text-muted-foreground">
                Pulls latest scoring history and KPI changes. Parents can download saved reports from their portal.
              </p>
            </CardContent>
          </Card>

          {reports.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Saved reports</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm border border-border/60 rounded-lg p-2">
                    <div>
                      <div className="font-bold">{r.program_label}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(r.generated_at), "MMM d, yyyy")} · {r.overall_score?.toFixed(1) ?? "—"}/10
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachEvaluateAthlete;
