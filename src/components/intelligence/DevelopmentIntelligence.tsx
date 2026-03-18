import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Target, Dumbbell, CheckCircle2, ChevronRight, Zap,
  ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/contexts/SportContext";
import {
  analyzeAthlete,
  buildIntelligenceInput,
  IntelligenceOutput,
  DevelopmentStatus,
} from "@/lib/intelligence/engine";
import { Link } from "react-router-dom";

interface Props {
  userId: string;
}

const statusConfig: Record<DevelopmentStatus, { label: string; color: string; icon: any; bg: string }> = {
  improving: { label: 'Improving', color: 'text-green-500', icon: TrendingUp, bg: 'bg-green-500/10' },
  stable: { label: 'Stable', color: 'text-blue-500', icon: Minus, bg: 'bg-blue-500/10' },
  stalled: { label: 'Stalled', color: 'text-amber-500', icon: Clock, bg: 'bg-amber-500/10' },
  regressing: { label: 'Regressing', color: 'text-red-500', icon: TrendingDown, bg: 'bg-red-500/10' },
};

const DevelopmentIntelligence = ({ userId }: Props) => {
  const [output, setOutput] = useState<IntelligenceOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const { sport } = useSport();

  useEffect(() => {
    fetchAndAnalyze();
  }, [userId, sport]);

  const fetchAndAnalyze = async () => {
    setLoading(true);
    try {
      const [checkinsRes, kpisRes] = await Promise.all([
        supabase.from('athlete_checkins').select('*').eq('user_id', userId).order('checkin_date', { ascending: true }).limit(60),
        supabase.from('athlete_kpis').select('*').eq('user_id', userId).order('recorded_at', { ascending: true }).limit(100),
      ]);

      const input = buildIntelligenceInput(
        sport,
        checkinsRes.data || [],
        kpisRes.data || [],
        [], // assessments loaded separately if available
      );

      const result = analyzeAthlete(input);
      setOutput(result);
    } catch (err) {
      console.error('Intelligence engine error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-accent" />
          <h3 className="font-display text-foreground">Development Intelligence</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-secondary animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!output) return null;

  const statusInfo = statusConfig[output.status];
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent" />
          <h3 className="font-display text-foreground">Development Intelligence</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusInfo.bg}`}>
          <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
          <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>
      </div>

      {/* Overall Score */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r="24" stroke="hsl(var(--border))" strokeWidth="4" fill="none" />
            <circle cx="28" cy="28" r="24" stroke="hsl(var(--accent))" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={`${(output.overallScore / 100) * 151} 151`} />
          </svg>
          <span className="absolute text-lg font-display text-foreground">{output.overallScore}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Overall Development Score</p>
          <p className="text-xs text-muted-foreground">Based on assessments, KPIs & consistency</p>
        </div>
      </div>

      {/* Strengths */}
      {output.strengths.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Strengths</p>
          <div className="space-y-1.5">
            {output.strengths.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="text-foreground capitalize">{s.area}</span>
                <span className="text-muted-foreground text-xs ml-auto">{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {output.gaps.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Development Gaps</p>
          <div className="space-y-1.5">
            {output.gaps.slice(0, 3).map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${g.priority === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                <span className="text-foreground capitalize">{g.area}</span>
                <span className={`text-xs ml-auto px-1.5 py-0.5 rounded ${g.priority === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {g.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priorities */}
      {output.priorities.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">This Week's Priorities</p>
          <div className="space-y-1.5">
            {output.priorities.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-accent/5">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs font-display text-accent">{i + 1}</span>
                <span className="text-foreground capitalize">{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Plan Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-transparent border border-accent/10">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-accent" />
          <p className="text-sm font-medium text-foreground">Weekly Plan</p>
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• {output.weeklyPlan.drillAssignments.length} drills assigned</li>
          <li>• {output.weeklyPlan.strengthSessions} strength sessions</li>
          {output.weeklyPlan.kpiRetests.map((r, i) => (
            <li key={i}>• Re-test {r.name} on {r.targetDay}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground/70 mt-2 italic">{output.weeklyPlan.notes}</p>
      </div>

      {/* Alerts */}
      {output.alerts.length > 0 && (
        <div className="space-y-2">
          {output.alerts.slice(0, 2).map((alert, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
              alert.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
              alert.severity === 'high' ? 'bg-amber-500/10 text-amber-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="opacity-80">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DevelopmentIntelligence;
