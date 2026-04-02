import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  BarChart3, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Target, Activity, Dumbbell, Brain, CheckCircle2, ArrowUpRight,
  Calendar, ClipboardList, MessageSquare, Award
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useParentPortal } from "@/hooks/useParentPortal";
import { useSport } from "@/contexts/SportContext";

const statusLabels: Record<string, { label: string; icon: any; color: string; bg: string; explanation: string }> = {
  improving: { label: "Improving ↑", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", explanation: "Your athlete is making measurable progress across key areas." },
  stable: { label: "Stable →", icon: Minus, color: "text-blue-500", bg: "bg-blue-500/10", explanation: "Performance is steady. Consistent effort is maintaining current levels." },
  stalled: { label: "Needs Attention ⚠", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", explanation: "Progress has paused. A conversation with the coach may help identify next steps." },
  regressing: { label: "Needs Attention ⚠", icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", explanation: "Some metrics are trending down. Coach review is recommended." },
};

const DIVISION_BENCHMARKS: Record<string, Record<string, { d1: number; d2: number; d3: number }>> = {
  baseball: {
    "Fastball Velocity": { d1: 90, d2: 85, d3: 82 },
    "Exit Velocity": { d1: 95, d2: 88, d3: 83 },
    "60-Yard Dash": { d1: 6.7, d2: 7.0, d3: 7.2 },
    "Pop Time": { d1: 1.9, d2: 2.0, d3: 2.1 },
  },
  softball: {
    "Pitching Velocity": { d1: 64, d2: 58, d3: 55 },
    "Exit Velocity": { d1: 72, d2: 65, d3: 60 },
    "Home to 1st": { d1: 2.8, d2: 3.0, d3: 3.2 },
    "Overhand Throw": { d1: 65, d2: 58, d3: 55 },
  },
};

const SHOWCASE_CALENDAR = [
  { month: "January", events: ["PBR Winter Showcase", "NFCA Lead-Off Classic"], type: "Showcase" },
  { month: "February", events: ["Perfect Game Presidents Day", "TCS Nationals Qualifier"], type: "Tournament" },
  { month: "March-April", events: ["High School Season — Coaches attend key games"], type: "Season" },
  { month: "June", events: ["PG National Showcase", "PBR Future Games", "PGF Nationals", "NFCA Summer Showcase"], type: "Premier" },
  { month: "July", events: ["Area Code Games", "Under Armour All-America", "Top 96 Showcase", "Alliance Fastpitch Nationals"], type: "Elite" },
  { month: "August-September", events: ["College Fall Workouts Begin", "Unofficial Visit Window"], type: "Visits" },
  { month: "October-November", events: ["Early Signing Period", "College ID Camps"], type: "Signing" },
];

const ParentProgress = () => {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();
  const { sport } = useSport();
  const isSoftball = sport === "softball";

  const selectedLink = athleteId
    ? activeLinks.find((l) => l.athlete_user_id === athleteId)
    : activeLinks[0];
  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) fetchAthleteData(currentAthleteId);
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const dev = data?.development_score;
  const kpis = data?.recent_kpis || [];
  const recentLessons = data?.recent_lessons || [];
  const homework = data?.homework;
  const workload = data?.workload || [];
  const status = statusLabels[dev?.improvement_status || "stable"] || statusLabels.stable;
  const StatusIcon = status.icon;

  // KPI Trends
  const kpiTrends: Record<string, { name: string; values: { value: number; date: string }[]; unit: string }> = {};
  for (const k of kpis) {
    if (!kpiTrends[k.kpi_name]) kpiTrends[k.kpi_name] = { name: k.kpi_name, values: [], unit: k.kpi_unit || "" };
    if (kpiTrends[k.kpi_name].values.length < 5) {
      kpiTrends[k.kpi_name].values.push({ value: k.kpi_value, date: k.recorded_at });
    }
  }

  // Training attendance from workload
  const attendanceLast14 = useMemo(() => {
    const days = workload.slice(0, 14);
    const trained = days.filter((d: any) => d.training_minutes > 0 || d.pitch_count > 0).length;
    return { trained, total: days.length, pct: days.length > 0 ? Math.round((trained / days.length) * 100) : 0 };
  }, [workload]);

  const benchmarks = DIVISION_BENCHMARKS[isSoftball ? "softball" : "baseball"];
  const accent = isSoftball ? "text-purple-400" : "text-primary";
  const accentBg = isSoftball ? "bg-purple-500/10" : "bg-primary/10";

  if (!currentAthleteId) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Link an athlete first to view progress.</p>
        <Link to="/parent" className="text-primary text-sm hover:underline mt-2 inline-block">Go to My Athletes</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentBg}`}>
          <BarChart3 className={`w-6 h-6 ${accent}`} />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">{profile?.display_name || "Athlete"}'s Progress</h1>
          <p className="text-sm text-muted-foreground">{profile?.position} • {isSoftball ? "🥎 Softball" : "⚾ Baseball"}</p>
        </div>
      </div>

      {/* Status + Readiness */}
      {dev && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className={`flex items-start gap-3 p-4 rounded-xl ${status.bg}`}>
            <StatusIcon className={`w-5 h-5 mt-0.5 ${status.color}`} />
            <div>
              <p className={`font-display text-lg ${status.color}`}>{status.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{status.explanation}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
                <circle cx="40" cy="40" r="34" stroke="hsl(var(--primary))" strokeWidth="6" fill="none" strokeLinecap="round"
                  strokeDasharray={`${(dev.overall_score / 100) * 214} 214`} />
              </svg>
              <span className="absolute text-2xl font-display text-foreground">{dev.overall_score}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Readiness Score</p>
              <p className="text-xs text-muted-foreground">
                {dev.overall_score >= 80 ? "Excellent — your athlete is performing at a high level."
                  : dev.overall_score >= 60 ? "Good — solid progress with room to grow."
                  : dev.overall_score >= 40 ? "Building — consistent effort will drive improvement."
                  : "Early stage — every session counts. Stay encouraged!"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <ScoreBar label="Training Consistency" value={dev.training_consistency} icon={<Activity className="w-3 h-3" />} />
            <ScoreBar label="Skill Development" value={dev.skill_development} icon={<Target className="w-3 h-3" />} />
            <ScoreBar label="Work Ethic" value={dev.work_ethic} icon={<Dumbbell className="w-3 h-3" />} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {dev.strengths_summary && dev.strengths_summary[0] && (
              <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                <p className="text-xs text-green-500 flex items-center gap-1 mb-1"><CheckCircle2 className="w-3 h-3" /> Top Strength</p>
                <p className="text-sm font-medium text-foreground capitalize">{dev.strengths_summary[0]}</p>
              </div>
            )}
            {dev.top_priorities && dev.top_priorities[0] && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <p className="text-xs text-amber-500 flex items-center gap-1 mb-1"><ArrowUpRight className="w-3 h-3" /> Priority Focus</p>
                <p className="text-sm font-medium text-foreground capitalize">{dev.top_priorities[0]}</p>
              </div>
            )}
          </div>

          {dev.weekly_focus && (
            <div className={`p-3 rounded-xl ${isSoftball ? "bg-purple-500/5" : "bg-primary/5"}`}>
              <p className="text-xs text-muted-foreground">This Week's Focus</p>
              <p className="text-sm text-foreground font-medium">{dev.weekly_focus}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Training Attendance Tracker */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
          <ClipboardList className={`w-4 h-4 ${accent}`} /> Training Attendance (14 Days)
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="27" stroke="hsl(var(--border))" strokeWidth="5" fill="none" />
              <circle cx="32" cy="32" r="27" stroke={isSoftball ? "hsl(280, 70%, 60%)" : "hsl(var(--primary))"} strokeWidth="5" fill="none" strokeLinecap="round"
                strokeDasharray={`${(attendanceLast14.pct / 100) * 170} 170`} />
            </svg>
            <span className="absolute text-lg font-display text-foreground">{attendanceLast14.pct}%</span>
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">{attendanceLast14.trained} of {attendanceLast14.total} days active</p>
            <p className="text-xs text-muted-foreground">
              {attendanceLast14.pct >= 80 ? "Outstanding consistency!" : attendanceLast14.pct >= 60 ? "Good effort — push for more consistency." : "Room to improve training frequency."}
            </p>
          </div>
        </div>
        {/* Homework tracker */}
        {homework && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-display text-foreground">{homework.completed_this_week}/{homework.assigned_this_week}</p>
              <p className="text-[10px] text-muted-foreground">Homework This Week</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-display text-foreground">
                {homework.lifetime_assigned > 0 ? Math.round((homework.lifetime_completed / homework.lifetime_assigned) * 100) : 0}%
              </p>
              <p className="text-[10px] text-muted-foreground">Lifetime Completion</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* KPI Trend Charts */}
      {Object.keys(kpiTrends).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" /> Performance Trends
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.values(kpiTrends).slice(0, 6).map((kpi) => {
              const reversed = [...kpi.values].reverse();
              const max = Math.max(...reversed.map(v => v.value), 1);
              const min = Math.min(...reversed.map(v => v.value), 0);
              const range = max - min || 1;
              const latest = reversed[reversed.length - 1];
              const first = reversed[0];
              const improving = latest && first ? latest.value >= first.value : false;

              return (
                <div key={kpi.name} className="bg-secondary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground capitalize">{kpi.name.replace(/_/g, ' ')}</p>
                    <p className={`text-xs font-medium ${improving ? 'text-green-500' : 'text-red-400'}`}>
                      {latest?.value}{kpi.unit ? ` ${kpi.unit}` : ''}
                    </p>
                  </div>
                  <div className="flex items-end gap-1 h-10">
                    {reversed.map((v, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm ${improving ? 'bg-green-500/60' : 'bg-amber-500/60'}`}
                        style={{ height: `${Math.max(15, ((v.value - min) / range) * 100)}%` }}
                        title={`${v.value} ${kpi.unit}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Division Benchmarks */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
          <Award className={`w-4 h-4 ${accent}`} /> Division Benchmarks ({isSoftball ? "Softball" : "Baseball"})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                <th className="text-center py-2 text-green-500 font-medium">D1</th>
                <th className="text-center py-2 text-blue-400 font-medium">D2</th>
                <th className="text-center py-2 text-amber-400 font-medium">D3</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(benchmarks).map(([name, vals]) => (
                <tr key={name} className="border-b border-border/50">
                  <td className="py-2.5 text-foreground">{name}</td>
                  <td className="text-center text-foreground font-medium">{vals.d1}</td>
                  <td className="text-center text-foreground font-medium">{vals.d2}</td>
                  <td className="text-center text-foreground font-medium">{vals.d3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">* Benchmarks are general guidelines. Actual requirements vary by program and position.</p>
      </motion.div>

      {/* Coach Notes & Feedback */}
      {recentLessons.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className={`w-4 h-4 ${accent}`} /> Recent Coach Feedback
          </h3>
          <div className="space-y-3">
            {recentLessons.slice(0, 5).map((lesson: any, i: number) => (
              <div key={i} className="bg-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(lesson.created_at).toLocaleDateString()} • {lesson.lesson_focus || "General Session"}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${accentBg} ${accent}`}>
                    {lesson.sport_type || "baseball"}
                  </span>
                </div>
                {lesson.strengths_observed && (
                  <p className="text-xs text-green-500 mb-1">✓ Strengths: {lesson.strengths_observed}</p>
                )}
                {lesson.areas_for_improvement && (
                  <p className="text-xs text-amber-400 mb-1">→ Work On: {lesson.areas_for_improvement}</p>
                )}
                {lesson.ai_summary && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{lesson.ai_summary}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Showcase & Camp Calendar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${accent}`} /> Showcase & Camp Calendar
        </h3>
        <div className="space-y-2">
          {SHOWCASE_CALENDAR.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-secondary rounded-xl">
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
                item.type === "Premier" || item.type === "Elite" ? `${accentBg} ${accent}` : "bg-muted text-muted-foreground"
              }`}>
                {item.month}
              </span>
              <div className="flex-1">
                {item.events.map((e, j) => (
                  <p key={j} className="text-xs text-foreground">{e}</p>
                ))}
                <p className="text-[10px] text-muted-foreground mt-1">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground flex items-center gap-1">{icon} {label}</span>
        <span className="text-foreground font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

export default ParentProgress;
