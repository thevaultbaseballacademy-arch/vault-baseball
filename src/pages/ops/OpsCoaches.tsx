import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { CoachBlackoutsPanel } from "@/components/ops/CoachBlackoutsPanel";
import { useStaffAccess } from "@/hooks/useStaffAccess";

const OpsCoaches = () => {
  const { isAdmin } = useStaffAccess();
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-[11px] font-display tracking-[0.3em] text-primary mb-1">SCHEDULING OS</p>
        <h1 className="text-2xl md:text-3xl font-display mb-1">Coaches</h1>
        <p className="text-sm text-muted-foreground">Coach availability, blackouts, and assignments.</p>
      </div>

      <CoachBlackoutsPanel />

      {isAdmin && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Manage rosters, rates, and specialties from the existing coach tools.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/admin/coach-management">Coach management <ExternalLink className="w-4 h-4 ml-1.5" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/coaches">Coach roster</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OpsCoaches;
