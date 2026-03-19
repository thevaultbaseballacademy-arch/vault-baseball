import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  BarChart3, TrendingUp, ArrowLeft, Target, Activity,
  Dumbbell, Brain, CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useParentPortal, LinkedAthleteData } from "@/hooks/useParentPortal";

const ParentProgress = () => {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athlete");
  const { activeLinks, fetchAthleteData, athleteData } = useParentPortal();

  const selectedLink = athleteId
    ? activeLinks.find((l) => l.athlete_user_id === athleteId)
    : activeLinks[0];

  const currentAthleteId = selectedLink?.athlete_user_id;

  useEffect(() => {
    if (currentAthleteId && !athleteData[currentAthleteId]) {
      fetchAthleteData(currentAthleteId);
    }
  }, [currentAthleteId]);

  const data = currentAthleteId ? athleteData[currentAthleteId] : null;
  const profile = data?.profile;
  const devScore = data?.development_score;
  const kpis = data?.recent_kpis || [];

  // Group KPIs by category, latest value per kpi_name
  const kpiByCategory = kpis.reduce<Record<string, Array<{ name: string; value: number; unit: string | null }>>>((acc, k) => {
    if (!acc[k.kpi_category]) acc[k.kpi_category] = [];
    if (!acc[k.kpi_category].find((i) => i.name === k.kpi_name)) {
      acc[k.kpi_category].push({ name: k.kpi_name, value: k.kpi_value, unit: k.kpi_unit });
    }
    return acc;
  }, {});

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
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display text-foreground">
            {profile?.display_name || "Athlete"}'s Progress
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.position} • {profile?.sport_type === "softball" ? "🥎 Softball" : "⚾ Baseball"}
          </p>
        </div>
      </div>

      {/* Development Score Breakdown */}
      {devScore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Development Score
          </h3>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
                <circle cx="40" cy="40" r="34" stroke="hsl(var(--primary))" strokeWidth="6" fill="none" strokeLinecap="round"
                  strokeDasharray={`${(devScore.overall_score / 100) * 214} 214`} />
              </svg>
              <span className="absolute text-2xl font-display text-foreground">{devScore.overall_score}</span>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" /> Training Consistency</span>
                  <span className="text-foreground font-medium">{devScore.training_consistency}%</span>
                </div>
                <Progress value={devScore.training_consistency} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Skill Development</span>
                  <span className="text-foreground font-medium">{devScore.skill_development}%</span>
                </div>
                <Progress value={devScore.skill_development} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground flex items-center gap-1"><Dumbbell className="w-3 h-3" /> Work Ethic</span>
                  <span className="text-foreground font-medium">{devScore.work_ethic}%</span>
                </div>
                <Progress value={devScore.work_ethic} className="h-2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-display text-foreground">{devScore.lessons_attended}</p>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-display text-foreground">{devScore.lessons_missed}</p>
              <p className="text-xs text-muted-foreground">Missed</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-display text-foreground">{devScore.homework_completed}</p>
              <p className="text-xs text-muted-foreground">HW Done</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-display text-foreground">{devScore.homework_total}</p>
              <p className="text-xs text-muted-foreground">HW Total</p>
            </div>
          </div>

          {devScore.weekly_focus && (
            <div className="mt-4 p-3 bg-primary/5 rounded-xl">
              <p className="text-xs text-muted-foreground">Weekly Focus</p>
              <p className="text-sm text-foreground font-medium">{devScore.weekly_focus}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* KPI Breakdown */}
      {Object.keys(kpiByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-display text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" /> Performance KPIs
          </h3>
          <div className="space-y-4">
            {Object.entries(kpiByCategory).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{category}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {items.map((kpi) => (
                    <div key={kpi.name} className="bg-secondary rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{kpi.name}</p>
                      <p className="text-lg font-display text-foreground">
                        {kpi.value}{kpi.unit ? ` ${kpi.unit}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ParentProgress;
