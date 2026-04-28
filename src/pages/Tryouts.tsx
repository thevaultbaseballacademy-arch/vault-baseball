import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MapPin, Calendar, Users } from "lucide-react";
import { usePublicTryouts } from "@/hooks/useTryouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

const Tryouts = () => {
  const { data: events, isLoading } = usePublicTryouts();
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!events) return [];
    if (filter === "all") return events;
    return events.filter((e) => e.age_group === filter);
  }, [events, filter]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">22M Baseball</p>
          <h1 className="text-3xl md:text-4xl font-display tracking-wide mt-1">Tryouts</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Reserve your spot for an upcoming pitching lab or showcase.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${filtered.length} upcoming`}
          </span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All ages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ages</SelectItem>
              <SelectItem value="9-12">Ages 9–12</SelectItem>
              <SelectItem value="13-17">Ages 13–17</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No upcoming tryouts. Check back soon.
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {filtered.map((evt) => (
            <Card key={evt.id} className="hover:border-foreground/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-lg font-display tracking-wide">{evt.name}</h2>
                    <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider">
                      Ages {evt.age_group}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold">${(evt.price_cents / 100).toFixed(0)}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {formatDate(evt.starts_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {evt.location_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    Capacity: {evt.capacity}
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link to={`/tryouts/${evt.id}/register`}>Register</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Tryouts;
