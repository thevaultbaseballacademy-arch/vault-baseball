import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const OpsResources = () => (
  <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
    <p className="text-[11px] font-display tracking-[0.3em] text-primary mb-1">SCHEDULING OS</p>
    <h1 className="text-2xl md:text-3xl font-display mb-1">Resources</h1>
    <p className="text-sm text-muted-foreground mb-6">Spaces, hours, and facility blackouts.</p>
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Manage spaces, floor plan, hours, and reservations from the existing facility console. Per-space buffer time and allowed booking types land in Phase 3.
        </p>
        <Button asChild>
          <Link to="/admin/facility">
            Open facility console <ExternalLink className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default OpsResources;
