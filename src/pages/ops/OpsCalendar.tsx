import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const OpsCalendar = () => (
  <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
    <p className="text-[11px] font-display tracking-[0.3em] text-primary mb-1">SCHEDULING OS</p>
    <h1 className="text-2xl md:text-3xl font-display mb-1">Calendar</h1>
    <p className="text-sm text-muted-foreground mb-6">Day · Week · Month views — unified across coaches and spaces.</p>

    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-4">
          The full multi-resource calendar is mounted at the existing facility page. We're folding it into this hub next.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/facility">
              Open facility calendar <ExternalLink className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/coach/schedule">My schedule (coach)</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default OpsCalendar;
