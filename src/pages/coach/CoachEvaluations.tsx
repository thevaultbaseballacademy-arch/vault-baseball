import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronRight, ClipboardList } from "lucide-react";
import { templateForAge } from "@/lib/evaluations/templates";

const CoachEvaluations = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: athletes, isLoading } = useQuery({
    queryKey: ["coach-athletes-eval", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_assigned_athlete_profiles", {
        coach_id: user!.id,
      });
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        user_id: string;
        display_name: string | null;
        avatar_url: string | null;
        position: string | null;
        graduation_year: number | null;
      }>;
    },
  });

  const filtered = useMemo(() => {
    const list = athletes ?? [];
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter((a) =>
      (a.display_name ?? "").toLowerCase().includes(s)
    );
  }, [athletes, search]);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <ClipboardList className="w-6 h-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-display tracking-wide">PLAYER EVALUATIONS</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Score subjective skills the radar can't capture. Pick an athlete to start a session.
      </p>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search athletes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-12"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No athletes found. Athletes assigned to you will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((a) => {
            const age = a.graduation_year
              ? Math.max(8, Math.min(18, 18 - (a.graduation_year - new Date().getFullYear())))
              : null;
            const tpl = templateForAge(age ?? undefined);
            return (
              <button
                key={a.user_id}
                onClick={() => navigate(`/coach/evaluations/${a.user_id}`)}
                className="text-left rounded-2xl bg-card hover:bg-secondary/60 border border-border/60 p-4 flex items-center gap-3 transition-colors min-h-[64px]"
              >
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
                    {(a.display_name ?? "A").slice(0, 1)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{a.display_name ?? "Athlete"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {a.position ?? "Pitcher"}{age ? ` · Age ${age}` : ""}
                  </div>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {tpl.ageGroup}
                </Badge>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoachEvaluations;
