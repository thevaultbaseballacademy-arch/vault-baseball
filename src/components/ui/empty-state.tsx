import { ReactNode } from "react";
import { Inbox, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface BaseProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

/** Standard empty state for list/grid pages when a query returns no rows. */
export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction, className = "" }: BaseProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-7 h-7 text-muted-foreground" />}
      </div>
      <h3 className="text-xl font-display text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>}
      {actionLabel && (actionHref ? (
        <Link to={actionHref}><Button variant="outline">{actionLabel}</Button></Link>
      ) : onAction ? (
        <Button variant="outline" onClick={onAction}>{actionLabel}</Button>
      ) : null)}
    </div>
  );
}

/** Standard error state with optional retry. */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this section. Please try again.",
  onRetry,
  className = "",
}: { title?: string; description?: string; onRetry?: () => void; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>
      <h3 className="text-xl font-display text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
