import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const OpsCoaches = () => (
  <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
    <p className="text-[11px] font-display tracking-[0.3em] text-primary mb-1">SCHEDULING OS</p>
    <h1 className="text-2xl md:text-3xl font-display mb-1">Coaches</h1>
    <p className="text-sm text-muted-foreground mb-6">Coach availability, blackouts, and assignments.</p>
    <Card>
      <CardContent className="p-6 space-y-3">
        <p className="text-sm text-muted-foreground">
          Use Coach Management to add or update coach profiles. Per-coach availability and blackout windows
          (now backed by the new <code>coach_blackouts</code> table) move into this hub in Phase 4.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/coach-management">
              Coach management <ExternalLink className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/coaches">Coach roster</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default OpsCoaches;
