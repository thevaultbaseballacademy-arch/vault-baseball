import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Activity, Target, Shield, AlertTriangle,
  TrendingUp, Zap, Heart, Plus, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWorkloadHealth } from "@/hooks/useWorkloadHealth";

const WorkloadDashboard = () => {
  const navigate = useNavigate();
  const {
    pitchCounts, armCareLogs, injuries, rules, loading,
    weeklyPitches, activeInjuries, armCareStreak,
  } = useWorkloadHealth();

  // Default to 15-16 age bracket for display
  const defaultRule = rules.find((r) => r.age_min <= 16 && r.age_max >= 16 && r.sport_type === "baseball");
  const weeklyLimit = defaultRule?.max_pitches_per_week || 140;
  const weeklyPercent = Math.min(100, Math.round((weeklyPitches / weeklyLimit) * 100));

  const lastPitchSession = pitchCounts[0];
  const painReported = pitchCounts.filter((pc) => pc.pain_reported).length;

  const riskLevel = (() => {
    if (activeInjuries.length > 0 || painReported >= 3) return "high";
    if (weeklyPercent > 80 || painReported >= 1) return "moderate";
    return "low";
  })();

  const riskColors = {
    low: "text-green-500 bg-green-500/10 border-green-500/20",
    moderate: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    high: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-secondary animate-pulse rounded-2xl" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">WORKLOAD & HEALTH</h1>
              <p className="text-muted-foreground">Monitor pitch counts, arm care, and injury prevention</p>
            </div>

            {/* Risk Status Banner */}
            <div className={`rounded-2xl border p-6 ${riskColors[riskLevel]}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-current/10 flex items-center justify-center">
                  {riskLevel === "high" ? <AlertTriangle className="w-7 h-7" /> :
                   riskLevel === "moderate" ? <Activity className="w-7 h-7" /> :
                   <Shield className="w-7 h-7" />}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-70">Injury Risk Level</p>
                  <p className="text-2xl font-display capitalize">{riskLevel}</p>
                  <p className="text-sm opacity-80">
                    {riskLevel === "high" ? "Pain reported or active injuries — rest recommended" :
                     riskLevel === "moderate" ? "Approaching limits — monitor closely" :
                     "All systems healthy — keep it up!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <Target className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-display text-foreground">{weeklyPitches}</p>
                <p className="text-xs text-muted-foreground">Weekly Pitches</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-display text-foreground">{lastPitchSession?.max_velocity || "—"}</p>
                <p className="text-xs text-muted-foreground">Peak Velo</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <Heart className="w-5 h-5 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-display text-foreground">{armCareStreak}</p>
                <p className="text-xs text-muted-foreground">Arm Care Streak</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 text-center">
                <AlertTriangle className={`w-5 h-5 mx-auto mb-2 ${activeInjuries.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                <p className="text-2xl font-display text-foreground">{activeInjuries.length}</p>
                <p className="text-xs text-muted-foreground">Active Injuries</p>
              </div>
            </div>

            {/* Weekly Pitch Limit */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-foreground">Weekly Pitch Load</h3>
                <span className="text-sm text-muted-foreground">{weeklyPitches} / {weeklyLimit}</span>
              </div>
              <Progress value={weeklyPercent} className={`h-3 ${weeklyPercent > 80 ? "[&>div]:bg-amber-500" : weeklyPercent > 95 ? "[&>div]:bg-red-500" : ""}`} />
              <p className="text-xs text-muted-foreground mt-2">
                Based on USA Baseball guidelines for your age group
              </p>
            </div>

            {/* Navigation Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Link to="/workload/pitch-log">
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group">
                  <Target className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display text-foreground mb-1">Pitch Counter</h3>
                  <p className="text-xs text-muted-foreground">Log pitches by session type</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
                </div>
              </Link>
              <Link to="/workload/arm-care">
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-green-500/30 transition-all group">
                  <Heart className="w-8 h-8 text-green-500 mb-3" />
                  <h3 className="font-display text-foreground mb-1">Arm Care</h3>
                  <p className="text-xs text-muted-foreground">Track recovery protocols</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
                </div>
              </Link>
              <Link to="/workload/injuries">
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-red-500/30 transition-all group">
                  <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
                  <h3 className="font-display text-foreground mb-1">Injury Log</h3>
                  <p className="text-xs text-muted-foreground">Report and track injuries</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>

            {/* Recent Pitch Sessions */}
            {pitchCounts.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-foreground">Recent Sessions</h3>
                  <Link to="/workload/pitch-log" className="text-xs text-primary hover:underline">View All</Link>
                </div>
                <div className="space-y-2">
                  {pitchCounts.slice(0, 5).map((pc) => (
                    <div key={pc.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">
                        {new Date(pc.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{pc.session_type.replace("_", " ")}</span>
                      <span className="font-display text-foreground ml-auto">{pc.pitch_count}</span>
                      <span className="text-xs text-muted-foreground">pitches</span>
                      {pc.pain_reported && <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded">Pain</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkloadDashboard;
