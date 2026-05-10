// VAULT OS — Your Path summary card.
// Used on /path standalone, and embedded as a top card on /dashboard.

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAthleteState } from "@/hooks/useAthleteState";
import { computeNextActions, stageLabel } from "@/lib/pathway/engine";

export function YourPathCard({ compact = false }: { compact?: boolean }) {
  const state = useAthleteState();

  if (state.loading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/50 p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  const recs = computeNextActions(state);
  const top = recs[0];
  const more = recs.slice(1, compact ? 2 : 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Your Path</span>
        </div>
        <span className="text-xs text-muted-foreground">Stage: {stageLabel(state.stage)}</span>
      </div>

      {top ? (
        <>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Next action</p>
          <h3 className="text-xl md:text-2xl font-semibold leading-tight mb-2">{top.label}</h3>
          <p className="text-sm text-muted-foreground mb-4">{top.reason}</p>
          <Button asChild className="w-full md:w-auto">
            <Link to={top.href}>
              Go now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">You're all caught up.</p>
      )}

      {more.length > 0 && (
        <div className="mt-6 pt-5 border-t border-border/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Also recommended</p>
          <ul className="space-y-2">
            {more.map((r) => (
              <li key={r.id}>
                <Link
                  to={r.href}
                  className="flex items-center justify-between gap-3 text-sm hover:text-primary transition-colors group"
                >
                  <span className="truncate">{r.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export default YourPathCard;
