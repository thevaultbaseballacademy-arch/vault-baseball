import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Camp = {
  id: string;
  name: string;
  description: string | null;
  weekly_price_cents: number;
  full_pass_price_cents: number;
  full_pass_savings_cents: number;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
};

type Cohort = {
  id: string;
  camp_id: string;
  age_label: string;
  age_min: number;
  age_max: number;
  venue_name: string;
  venue_address: string | null;
  venue_city: string | null;
  venue_state: string | null;
  venue_zip: string | null;
  daily_start_time: string | null;
  daily_end_time: string | null;
  display_order: number;
};

type CampSession = {
  id: string;
  cohort_id: string;
  session_number: number;
  starts_on: string;
  ends_on: string;
  capacity: number;
  status: string;
};

type Capacity = { session_id: string; confirmed_count: number; pending_count: number; capacity: number };

const fmtMoney = (cents: number) => `$${(cents / 100).toFixed(0)}`;
const fmtDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtTime = (t: string | null) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const Camps = () => {
  const [loading, setLoading] = useState(true);
  const [camp, setCamp] = useState<Camp | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [sessions, setSessions] = useState<CampSession[]>([]);
  const [capacityBySession, setCapacityBySession] = useState<Record<string, Capacity>>({});

  useEffect(() => {
    let cancelled = false;
    const safety = window.setTimeout(() => { if (!cancelled) setLoading(false); }, 6000);
    (async () => {
      try {
        const { data: camps } = await (supabase.from("camps" as any) as any)
          .select("id, name, description, weekly_price_cents, full_pass_price_cents, full_pass_savings_cents, registration_opens_at, registration_closes_at")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(1);
        const c = (camps || [])[0] as Camp | undefined;
        if (!c) return;
        if (cancelled) return;
        setCamp(c);

        const { data: ch } = await (supabase.from("camp_cohorts" as any) as any)
          .select("*")
          .eq("camp_id", c.id)
          .order("display_order");
        if (cancelled) return;
        const cohortList = (ch || []) as Cohort[];
        setCohorts(cohortList);

        const cohortIds = cohortList.map((x) => x.id);
        if (cohortIds.length === 0) return;

        // Sessions then capacity (capacity needs session ids)
        const { data: sess } = await (supabase.from("camp_sessions" as any) as any)
          .select("*")
          .in("cohort_id", cohortIds)
          .order("session_number");
        if (cancelled) return;
        const sessList = (sess || []) as CampSession[];
        setSessions(sessList);

        if (sessList.length === 0) return;
        const { data: caps } = await supabase.rpc("get_camp_session_capacity" as any, {
          p_session_ids: sessList.map((s) => s.id),
        });
        const capMap: Record<string, Capacity> = {};
        ((caps as any[]) || []).forEach((row: any) => { capMap[row.session_id] = row; });
        if (!cancelled) setCapacityBySession(capMap);
      } catch (e) {
        console.error("[Camps] load failed", e);
      } finally {
        window.clearTimeout(safety);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; window.clearTimeout(safety); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-3 block">
              22M ELITE · IN-PERSON
            </span>
            <h1 className="text-3xl md:text-5xl font-display text-foreground mb-3">
              FOUR WEEKS. MEASURED GAINS.
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              The VAULT system, run live. June 29 – July 24, 2026. Daily baselines, pillar-based blocks, exit report. Single week or Full Pass.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : !camp ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Camp registration opens soon. Check back shortly.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Pricing strip */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <Card className="border-border">
                  <CardContent className="p-5">
                    <p className="text-[10px] font-display tracking-[0.25em] text-muted-foreground mb-1">SINGLE WEEK</p>
                    <p className="text-2xl md:text-3xl font-display text-foreground">{fmtMoney(camp.weekly_price_cents)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Per camper, per week</p>
                  </CardContent>
                </Card>
                <Card className="border-primary bg-primary/5">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-display tracking-[0.25em] text-primary mb-1">FULL 4-WEEK PASS</p>
                      <span className="text-[10px] font-display tracking-wider bg-primary text-primary-foreground px-2 py-0.5">BEST VALUE</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-display text-foreground">{fmtMoney(camp.full_pass_price_cents)}</p>
                    {camp.full_pass_savings_cents > 0 ? (
                      <p className="text-xs text-primary mt-1">
                        Save {fmtMoney(camp.full_pass_savings_cents)} vs week-by-week
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">All 4 weeks · one transaction</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cohorts */}
              <h2 className="text-xs font-display tracking-[0.25em] text-muted-foreground mb-4">
                CHOOSE YOUR AGE GROUP
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {cohorts.map((cohort) => {
                  const cohortSessions = sessions.filter((s) => s.cohort_id === cohort.id);
                  const totalSpots = cohortSessions.reduce((sum, s) => sum + s.capacity, 0);
                  const totalTaken = cohortSessions.reduce((sum, s) => {
                    const c = capacityBySession[s.id];
                    return sum + (c ? c.confirmed_count + c.pending_count : 0);
                  }, 0);
                  const spotsLeft = Math.max(0, totalSpots - totalTaken);

                  return (
                    <motion.div
                      key={cohort.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-border h-full hover:border-primary/40 transition-colors">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-display tracking-[0.2em] text-primary">
                              {cohort.age_label.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-display tracking-wider text-muted-foreground">
                              {spotsLeft > 0 ? `${spotsLeft} SPOTS LEFT` : "WAITLIST"}
                            </span>
                          </div>
                          <h3 className="text-xl font-display text-foreground mb-3">
                            {cohort.venue_name}
                          </h3>

                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                              <span>
                                {cohort.venue_address}<br />
                                {cohort.venue_city}, {cohort.venue_state} {cohort.venue_zip}
                              </span>
                            </div>
                            {cohort.daily_start_time && cohort.daily_end_time && (
                              <div className="flex items-center gap-2">
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>{fmtTime(cohort.daily_start_time)} — {fmtTime(cohort.daily_end_time)} daily</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" />
                              <span>{cohortSessions[0]?.capacity ?? 30} campers per week</span>
                            </div>
                          </div>

                          {/* Weeks */}
                          <div className="mb-5">
                            <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground mb-2">
                              4 WEEKS AVAILABLE
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {cohortSessions.map((s) => {
                                const cap = capacityBySession[s.id];
                                const taken = cap ? cap.confirmed_count + cap.pending_count : 0;
                                const isFull = taken >= s.capacity;
                                return (
                                  <div
                                    key={s.id}
                                    className={`text-[11px] px-2 py-1.5 border ${isFull ? "border-border text-muted-foreground line-through" : "border-border text-foreground"}`}
                                  >
                                    Wk {s.session_number}: {fmtDate(s.starts_on)}–{fmtDate(s.ends_on)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <Link
                            to={`/camps/${cohort.id}/register`}
                            className="mt-auto"
                            aria-label={`Register for ${cohort.age_label} at ${cohort.venue_name}`}
                          >
                            <Button variant="vault" className="w-full">
                              Register {cohort.age_label}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Trust strip */}
              <div className="mt-10 grid sm:grid-cols-3 gap-3">
                {[
                  "Certified VAULT coaches",
                  "Capacity-locked weekly groups",
                  "Secure payment via Stripe",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Camps;
