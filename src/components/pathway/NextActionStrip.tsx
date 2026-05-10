// VAULT OS — 3-question header strip.
// Shows on bucket pages. Answers: what is this, who is it for, what next.

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAthleteState } from "@/hooks/useAthleteState";
import { topNextAction } from "@/lib/pathway/engine";

interface NextActionStripProps {
  title: string;        // What is this
  audience: string;     // Who it's for ("Athletes & Parents", "Coaches", "Org admins")
  description?: string; // Optional supporting line
}

export function NextActionStrip({ title, audience, description }: NextActionStripProps) {
  const state = useAthleteState();
  const next = state.loading ? null : topNextAction(state);

  return (
    <div className="border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm p-4 md:p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <span>{audience}</span>
          </div>
          <h2 className="text-lg md:text-xl font-semibold mt-1 truncate">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          ) : null}
        </div>
        {next ? (
          <Button asChild size="sm" className="shrink-0">
            <Link to={next.href}>
              {next.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>
      {next ? (
        <p className="text-xs text-muted-foreground mt-2 md:mt-3">Next for you: {next.reason}</p>
      ) : null}
    </div>
  );
}

export default NextActionStrip;
