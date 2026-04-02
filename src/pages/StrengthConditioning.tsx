import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Dumbbell, Flame, Zap, Clock,
  Check, Loader2, Play, ChevronRight, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSport } from "@/contexts/SportContext";

interface SCProgram {
  id: string;
  title: string;
  description: string | null;
  sport_type: string;
  age_group: string | null;
  program_type: string;
  difficulty: string;
  duration_weeks: number;
  sessions_per_week: number;
  exercises: any[];
}

interface WorkoutLog {
  id: string;
  program_id: string | null;
  workout_date: string;
  exercises_completed: any[];
  duration_minutes: number | null;
  rpe: number | null;
  notes: string | null;
}

const typeIcons: Record<string, any> = {
  strength: Dumbbell, conditioning: Flame, mobility: Zap, power: Zap, speed: Zap,
};

const MentalPerformance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sport } = useSport();
  const [programs, setPrograms] = useState<SCProgram[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [activeProgram, setActiveProgram] = useState<SCProgram | null>(null);

  // Log form
  const [logDuration, setLogDuration] = useState("");
  const [logRpe, setLogRpe] = useState([6]);
  const [logNotes, setLogNotes] = useState("");

  useEffect(() => { loadData(); }, [sport]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const [progRes, logRes] = await Promise.all([
      supabase.from("sc_programs").select("*").eq("is_active", true).order("program_type"),
      user ? supabase.from("sc_workout_logs").select("*").eq("user_id", user.id).order("workout_date", { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
    ]);
    setPrograms((progRes.data as any[]) || []);
    setLogs((logRes.data as any[]) || []);
    setLoading(false);
  };

  const logWorkout = async (programId: string) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("sc_workout_logs").insert({
      user_id: user.id,
      program_id: programId,
      workout_date: new Date().toISOString().split("T")[0],
      duration_minutes: parseInt(logDuration) || null,
      rpe: logRpe[0],
      notes: logNotes || null,
      exercises_completed: activeProgram?.exercises || [],
    } as any);
    toast({ title: "Workout logged!" });
    setLogDuration(""); setLogNotes("");
    setActiveProgram(null);
    loadData();
    setSaving(false);
  };

  const filtered = filter === "all" ? programs : programs.filter(p => p.program_type === filter);
  const sportFiltered = filtered.filter(p => p.sport_type === sport || p.sport_type === "all");

  const difficultyColors: Record<string, string> = {
    beginner: "bg-green-500/10 text-green-600 border-green-500/20",
    intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    advanced: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground">STRENGTH & CONDITIONING</h1>
              <p className="text-muted-foreground">Sport-specific training programs</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card border border-border p-4 text-center">
                <Dumbbell className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-display text-foreground">{logs.length}</div>
                <div className="text-[10px] text-muted-foreground font-display">WORKOUTS</div>
              </div>
              <div className="bg-card border border-border p-4 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-display text-foreground">
                  {logs.reduce((s, l) => s + (l.duration_minutes || 0), 0)}
                </div>
                <div className="text-[10px] text-muted-foreground font-display">TOTAL MIN</div>
              </div>
              <div className="bg-card border border-border p-4 text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-display text-foreground">
                  {logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (l.rpe || 0), 0) / logs.length) : "—"}
                </div>
                <div className="text-[10px] text-muted-foreground font-display">AVG RPE</div>
              </div>
            </div>

            <Tabs defaultValue="programs" className="space-y-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="programs" className="font-display text-xs">PROGRAMS</TabsTrigger>
                <TabsTrigger value="log" className="font-display text-xs">WORKOUT LOG</TabsTrigger>
              </TabsList>

              <TabsContent value="programs" className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {["all", "strength", "power", "speed", "conditioning", "mobility"].map(t => (
                    <Button key={t} size="sm" variant={filter === t ? "default" : "outline"}
                      onClick={() => setFilter(t)} className="text-xs font-display capitalize">
                      {t}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  {sportFiltered.map(prog => (
                    <div key={prog.id} className="bg-card border border-border p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display text-foreground">{prog.title}</h3>
                          <p className="text-xs text-muted-foreground">{prog.description}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-display capitalize ${difficultyColors[prog.difficulty] || ""}`}>
                          {prog.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span>{prog.duration_weeks} weeks</span>
                        <span>·</span>
                        <span>{prog.sessions_per_week}x/week</span>
                        <span>·</span>
                        <span className="capitalize">{prog.program_type}</span>
                      </div>
                      {prog.exercises && Array.isArray(prog.exercises) && (
                        <div className="space-y-1 mb-3">
                          {(prog.exercises as any[]).map((ex: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs bg-secondary p-2">
                              <span className="text-foreground">{ex.name}</span>
                              <span className="text-muted-foreground">{ex.sets} × {ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="w-full" onClick={() => setActiveProgram(prog)}>
                            <Play className="w-3 h-3 mr-1" /> Log Workout
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle className="font-display">LOG WORKOUT — {prog.title}</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Duration (minutes)</Label>
                              <Input type="number" value={logDuration} onChange={(e) => setLogDuration(e.target.value)} placeholder="45" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <Label className="text-xs text-muted-foreground">RPE (Rate of Perceived Exertion)</Label>
                                <span className="text-xs font-display">{logRpe[0]}/10</span>
                              </div>
                              <Slider value={logRpe} onValueChange={setLogRpe} min={1} max={10} step={1} />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Notes</Label>
                              <Textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} rows={2} />
                            </div>
                            <Button onClick={() => logWorkout(prog.id)} disabled={saving} className="w-full">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                              Save Workout
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                  {sportFiltered.length === 0 && (
                    <p className="text-center text-muted-foreground py-8 text-sm">No programs found for this filter.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="log" className="space-y-2">
                {logs.map(l => (
                  <div key={l.id} className="bg-card border border-border p-4 flex items-center gap-4">
                    <div className="text-center shrink-0">
                      <div className="text-xs text-muted-foreground">{new Date(l.workout_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {l.duration_minutes && <span className="text-xs text-muted-foreground">{l.duration_minutes} min</span>}
                        {l.rpe && <Badge variant="outline" className="text-[10px]">RPE {l.rpe}</Badge>}
                      </div>
                      {l.notes && <p className="text-xs text-muted-foreground mt-1">{l.notes}</p>}
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No workouts logged yet.</p>}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MentalPerformance;
