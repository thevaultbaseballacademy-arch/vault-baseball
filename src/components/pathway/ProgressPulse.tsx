// VAULT OS — Progress Pulse.
// Phase 2 Progress OS panel. Reads AthleteState and surfaces:
//  • reassessment cadence (60-day rule via needs_reassessment)
//  • "what changed" — current streak, active program progress, completed count
//  • "what's next" — recommendations 2 and 3 from the Pathway Engine
//    (top recommendation already lives in YourPathCard, so we skip it here)

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAthleteState } from "@/hooks/useAthleteState";
import { computeNextActions, stageLabel } from "@/lib/pathway/engine";

export function ProgressPulse() {
  const state = useAthleteState();
  if (state.loading) return null;

  const recs = computeNextActions(state);
  const secondary = recs.slice(1, 3); // top one already in YourPathCard
  const active = state.training.active_programs[0];
  const completedCount = state.training.completed_programs.length;
  const streak = state.training.streak_days;

  // Don't render at all for unassessed users — YourPathCard already prompts evaluation.
  if (state.stage === "unassessed") return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/60 rounded-2xl bg-card/60 p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-display tracking-[0.25em] text-muted-foreground">PROGRESS PULSE</p>
          <h3 className="text-lg font-display text-foreground">
            {stageLabel(state.stage)} · what changed, what's next
          </h3>
        </div>
      </div>

      {/* Reassessment nudge — highest priority retention surface */}
      {state.evaluation.needs_reassessment ? (
        <div className="flex items-start gap-3 border border-vault-velocity/30 bg-vault-velocity/5 rounded-lg p-3 mb-4">
          <AlertCircle className="w-4 h-4 text-vault-velocity shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium">Reassessment overdue</p>
            <p className="text-xs text-muted-foreground">
              Your last evaluation was 60+ days ago. Re-take it to measure progress against your baseline.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/evaluate">Re-evaluate</Link>
          </Button>
        </div>
      ) : null}

      {/* What changed — three compact stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat
          icon={<Flame className="w-4 h-4 text-vault-velocity" />}
          label="STREAK"
          value={`${streak}d`}
        />
        <Stat
          icon={<TrendingUp className="w-4 h-4 text-vault-longevity" />}
          label="ACTIVE PROGRAM"
          value={active ? `${Math.round(active.progress_pct)}%` : "—"}
          sub={active?.name}
        />
        <Stat
          icon={<CheckCircle2 className="w-4 h-4 text-foreground/70" />}
          label="COMPLETED"
          value={`${completedCount}`}
          sub={completedCount === 1 ? "program" : "programs"}
        />
      </div>

      {/* What's next — secondary recommendations from the Pathway Engine */}
      {secondary.length > 0 ? (
        <div>
          <p className="text-[11px] font-display tracking-[0.25em] text-muted-foreground mb-2">
            ALSO RECOMMENDED FOR YOU
          </p>
          <div className="space-y-2">
            {secondary.map((r) => (
              <Link
                key={r.id}
                to={r.href}
                className="group flex items-center gap-3 border border-border/60 hover:border-foreground/40 transition-colors rounded-lg bg-card p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{r.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.reason}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="border border-border/40 rounded-lg p-3 bg-background/40">
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[10px] font-display tracking-[0.2em] text-muted-foreground">{label}</span></div>
      <p className="text-xl font-display text-foreground leading-none">{value}</p>
      {sub ? <p className="text-[10px] text-muted-foreground truncate mt-1">{sub}</p> : null}
    </div>
  );
}

export default ProgressPulse;
