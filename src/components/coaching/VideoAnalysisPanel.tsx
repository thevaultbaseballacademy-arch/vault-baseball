import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Loader2, CheckCircle2, AlertTriangle, Brain,
  ChevronDown, ChevronUp, Shield, Zap, Target, Star,
  Film, RefreshCw, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Analysis {
  id: string;
  video_url: string;
  video_type: string;
  status: string;
  ai_analysis: any;
  coach_notes: string | null;
  created_at: string;
}

interface VideoAnalysisPanelProps {
  userId: string;
}

const gradeColors: Record<string, string> = {
  A: "text-vault-longevity",
  B: "text-vault-athleticism",
  C: "text-vault-utility",
  D: "text-vault-velocity",
  F: "text-destructive",
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  important: "bg-vault-utility/10 text-vault-utility",
  minor: "bg-muted text-muted-foreground",
};

const VideoAnalysisPanel = ({ userId }: VideoAnalysisPanelProps) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [uploading, setUploading] = useState(false);
  const [videoType, setVideoType] = useState("pitching");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalyses = useCallback(async () => {
    const { data } = await supabase
      .from("video_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setAnalyses(data as Analysis[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  // Poll for processing analyses
  useEffect(() => {
    const processing = analyses.some((a) => a.status === "processing" || a.status === "pending");
    if (!processing) return;
    const interval = setInterval(fetchAnalyses, 5000);
    return () => clearInterval(interval);
  }, [analyses, fetchAnalyses]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 50MB per video.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("analysis-videos")
        .upload(path, file, { contentType: file.type });
      if (uploadErr) throw uploadErr;

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from("analysis-videos")
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 day URL

      if (!urlData?.signedUrl) throw new Error("Failed to get video URL");

      // Create analysis record
      const { data: record, error: insertErr } = await supabase
        .from("video_analyses")
        .insert({ user_id: userId, video_url: urlData.signedUrl, video_type: videoType })
        .select()
        .single();
      if (insertErr) throw insertErr;

      // Trigger AI analysis
      const { error: fnErr } = await supabase.functions.invoke("analyze-video", {
        body: { analysisId: record.id },
      });

      if (fnErr) {
        console.error("Analysis trigger error:", fnErr);
        toast({ title: "Analysis started", description: "Your video is being analyzed. Results will appear shortly." });
      } else {
        toast({ title: "Analysis complete", description: "Your AI mechanics breakdown is ready." });
      }

      await fetchAnalyses();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const retryAnalysis = async (analysisId: string) => {
    toast({ title: "Retrying analysis…" });
    await supabase.functions.invoke("analyze-video", { body: { analysisId } });
    await fetchAnalyses();
  };

  const renderMechanicalBreakdown = (breakdown: Record<string, { rating: number; notes: string }>) => {
    if (!breakdown) return null;
    const entries = Object.entries(breakdown).filter(([, v]) => v && typeof v === "object" && "rating" in v);
    if (entries.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-display tracking-widest text-muted-foreground">MECHANICAL BREAKDOWN</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {entries.map(([key, val]) => (
            <div key={key} className="bg-secondary/50 border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground capitalize">{key.replace(/_/g, " ")}</span>
                <span className={`text-sm font-display ${val.rating >= 8 ? "text-vault-longevity" : val.rating >= 6 ? "text-vault-utility" : "text-vault-velocity"}`}>
                  {val.rating}/10
                </span>
              </div>
              <Progress value={val.rating * 10} className="h-1.5 mb-1" />
              <p className="text-[11px] text-muted-foreground">{val.notes}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalysis = (a: Analysis) => {
    const data = a.ai_analysis;
    if (!data) return null;
    const isExpanded = expandedId === a.id;

    return (
      <div key={a.id} className="bg-card border border-border overflow-hidden">
        {/* Header */}
        <button
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          onClick={() => setExpandedId(isExpanded ? null : a.id)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 flex items-center justify-center border border-border ${gradeColors[data.overall_grade] || "text-foreground"}`}>
              <span className="text-lg font-display">{data.overall_grade || "–"}</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground capitalize">{a.video_type} Analysis</p>
              <p className="text-[11px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {a.coach_notes && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5">COACH REVIEWED</span>}
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                {/* Summary */}
                <p className="text-sm text-foreground">{data.summary}</p>

                {/* Pre-session focus areas */}
                {data.pre_session_focus_areas?.length > 0 && (
                  <div className="bg-primary/5 border border-primary/10 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-display tracking-widest text-primary">PRE-SESSION FOCUS</span>
                    </div>
                    <ul className="space-y-1">
                      {data.pre_session_focus_areas.map((f: string, i: number) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-primary font-display">{i + 1}.</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strengths */}
                {data.strengths?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">STRENGTHS</h4>
                    <div className="space-y-2">
                      {data.strengths.map((s: any, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Star className="w-3 h-3 text-vault-utility mt-0.5 shrink-0" />
                          <div>
                            <span className="text-xs font-medium text-foreground">{s.area}</span>
                            <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas for improvement */}
                {data.areas_for_improvement?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">AREAS TO IMPROVE</h4>
                    <div className="space-y-2">
                      {data.areas_for_improvement.map((a: any, i: number) => (
                        <div key={i} className="border border-border p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 font-medium ${priorityColors[a.priority] || ""}`}>
                              {a.priority?.toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-foreground">{a.area}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                          {a.drill_recommendation && (
                            <p className="text-[11px] text-primary mt-1">💡 Drill: {a.drill_recommendation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mechanical breakdown */}
                {renderMechanicalBreakdown(data.mechanical_breakdown)}

                {/* Injury risk flags */}
                {data.injury_risk_flags?.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/10 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Shield className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-[10px] font-display tracking-widest text-destructive">INJURY RISK FLAGS</span>
                    </div>
                    <ul className="space-y-1">
                      {data.injury_risk_flags.map((f: string, i: number) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Velocity potential */}
                {data.velocity_potential_notes && (
                  <div className="bg-vault-athleticism/5 border border-vault-athleticism/10 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-vault-athleticism" />
                      <span className="text-[10px] font-display tracking-widest text-vault-athleticism">VELOCITY POTENTIAL</span>
                    </div>
                    <p className="text-xs text-foreground">{data.velocity_potential_notes}</p>
                  </div>
                )}

                {/* Coach notes */}
                {a.coach_notes && (
                  <div className="bg-primary/5 border border-primary/20 p-3">
                    <span className="text-[10px] font-display tracking-widest text-primary mb-1 block">COACH NOTES</span>
                    <p className="text-xs text-foreground">{a.coach_notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Upload section */}
      <div className="bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-display tracking-widest text-foreground">VAULT AI ANALYSIS</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a video of your mechanics. Our AI will break down every phase and prepare focus areas for your next coaching session.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={videoType} onValueChange={setVideoType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pitching">Pitching</SelectItem>
              <SelectItem value="hitting">Hitting</SelectItem>
              <SelectItem value="fielding">Fielding</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex-1">
            <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button variant="vault" className="w-full" disabled={uploading} asChild>
              <span>
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading & Analyzing…</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Upload Video for Analysis</>
                )}
              </span>
            </Button>
          </label>
        </div>

        <p className="text-[10px] text-muted-foreground mt-2">Supports MP4, MOV, WebM. Max 50MB. Best results: single rep, side angle, well-lit.</p>
      </div>

      {/* Analyses list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-card border border-border p-8 text-center">
          <Film className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No analyses yet. Upload your first video above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {analyses.map((a) => {
            if (a.status === "pending" || a.status === "processing") {
              return (
                <div key={a.id} className="bg-card border border-border p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground capitalize">{a.video_type} Analysis</p>
                    <p className="text-[11px] text-muted-foreground">AI is analyzing your mechanics…</p>
                  </div>
                </div>
              );
            }
            if (a.status === "error") {
              return (
                <div key={a.id} className="bg-card border border-destructive/20 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-sm text-foreground capitalize">{a.video_type} Analysis</p>
                      <p className="text-[11px] text-destructive">Analysis failed</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => retryAnalysis(a.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" /> Retry
                  </Button>
                </div>
              );
            }
            return renderAnalysis(a);
          })}
        </div>
      )}
    </div>
  );
};

export default VideoAnalysisPanel;
