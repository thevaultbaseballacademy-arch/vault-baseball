import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Loader2, MapPin, Calendar, Users } from "lucide-react";
import { usePublicTryouts } from "@/hooks/useTryouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TryoutsInterest = lazy(() => import("./TryoutsInterest"));

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

const setMeta = (selector: string, attr: string, name: string, content: string) => {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const Tryouts = () => {
  const { data: events, isLoading, isError, error, refetch, isFetching } = usePublicTryouts();
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Tryouts & Showcases | The Vault Baseball Academy";
    setMeta('meta[name="description"]', "name", "description",
      "Register for upcoming Vault Baseball tryouts, showcases, and pitching lab evaluations. Filter by age group.");
    setMeta('meta[property="og:title"]', "property", "og:title", "Vault Baseball Tryouts & Showcases");
    setMeta('meta[property="og:description"]', "property", "og:description",
      "Reserve your spot for an upcoming pitching lab, tryout, or showcase. Limited capacity.");
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:image"]', "property", "og:image", "https://vault-baseball.lovable.app/favicon.webp");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  }, []);

  const filtered = useMemo(() => {
    if (!events) return [];
    if (filter === "all") return events;
    return events.filter((e) => e.age_group === filter);
  }, [events, filter]);

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 pt-28 pb-12">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <h1 className="text-2xl font-display tracking-wide">Tryouts are loading slowly</h1>
              <p className="text-sm text-muted-foreground">
                {(error as Error | null)?.message || "Please try again."}
              </p>
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Off-season: no published events → show interest capture instead
  if (!isLoading && (!events || events.length === 0)) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <TryoutsInterest />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className="border-b border-border bg-card pt-24 md:pt-28">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">22M Baseball</p>
          <h1 className="text-3xl md:text-4xl font-display tracking-wide mt-1">Tryouts & Showcases</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Reserve your spot for an upcoming pitching lab, tryout, or showcase event.
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
      <Footer />
    </div>
  );
};

export default Tryouts;
