import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { useCoachTodayEssa } from "@/hooks/useEssaCoaches";
import Navbar from "@/components/Navbar";

const CoachEssaDay = () => {
  const { data: bookings = [], isLoading } = useCoachTodayEssa();

  useEffect(() => {
    document.title = "My ESSA Day | VAULT OS";
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-[100dvh]">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-primary" />
            <h1 className="font-display text-3xl text-foreground tracking-wide">MY ESSA DAY</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            All ESSA private lessons assigned to you for {format(new Date(), "EEEE, MMMM d")}.
          </p>

          {isLoading ? (
            <Card className="p-12 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading your day...
            </Card>
          ) : bookings.length === 0 ? (
            <Card className="p-12 text-center text-sm text-muted-foreground border-dashed">
              No ESSA lessons assigned to you today.
            </Card>
          ) : (
            <Card className="divide-y divide-border overflow-hidden">
              {bookings.map((b: any) => {
                const start = new Date(b.starts_at);
                const end = new Date(b.ends_at);
                return (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{b.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(start, "p")} – {format(end, "p")}
                        </span>
                        {b.athlete_name && (
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {b.athlete_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize border-primary/30 text-primary">
                      {b.status}
                    </Badge>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default CoachEssaDay;
