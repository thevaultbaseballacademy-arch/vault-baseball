import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Trophy, ClipboardList, DollarSign, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    (cents || 0) / 100,
  );

type Tryout = {
  id: string;
  player_first_name: string;
  player_last_name: string;
  parent_name: string;
  parent_phone: string;
  status: string;
  paid_at: string | null;
  registered_at: string;
  event_id: string;
};

type Reg = {
  id: string;
  team_level: string;
  tier: string;
  player_first_name: string;
  player_last_name: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_phone: string;
  status: string;
  payment_plan: string;
  annual_tuition_cents: number;
  amount_paid_cents: number;
  paid_at: string | null;
  created_at: string;
};

const AdminPlayerJourney = () => {
  const { email: rawEmail } = useParams();
  const email = decodeURIComponent(rawEmail ?? "").toLowerCase();
  const [loading, setLoading] = useState(true);
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [regs, setRegs] = useState<Reg[]>([]);

  useEffect(() => {
    if (!email) return;
    (async () => {
      const [t, r] = await Promise.all([
        (supabase.from("tryout_registrations" as any) as any)
          .select("id, player_first_name, player_last_name, parent_name, parent_phone, status, paid_at, registered_at, event_id")
          .eq("parent_email", email)
          .order("registered_at", { ascending: false }),
        (supabase.from("team_registrations" as any) as any)
          .select("*")
          .eq("parent_email", email)
          .order("created_at", { ascending: false }),
      ]);
      setTryouts((t.data ?? []) as Tryout[]);
      setRegs((r.data ?? []) as Reg[]);
      setLoading(false);
    })();
  }, [email]);

  const totals = useMemo(() => {
    const tryoutPaid = tryouts.filter((t) => t.paid_at).length;
    const regPaid = regs.filter((r) => r.status === "paid");
    const revenue = regPaid.reduce((s, r) => s + (r.amount_paid_cents || 0), 0);
    return { tryoutPaid, regPaid: regPaid.length, revenue };
  }, [tryouts, regs]);

  const headerName =
    regs[0] ? `${regs[0].parent_first_name} ${regs[0].parent_last_name}` :
    tryouts[0]?.parent_name ?? email;

  return (
    <div>
      <Link
        to="/admin/team-registrations"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to registrations
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-display tracking-wide">Player Journey</h1>
        <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
          <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{email}</span>
          <span>·</span>
          <span>{headerName}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><ClipboardList className="w-3.5 h-3.5"/>Tryouts attended</div>
              <div className="text-2xl font-display">{totals.tryoutPaid}<span className="text-sm text-muted-foreground"> / {tryouts.length}</span></div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trophy className="w-3.5 h-3.5"/>Team registrations</div>
              <div className="text-2xl font-display">{totals.regPaid}<span className="text-sm text-muted-foreground"> / {regs.length}</span></div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><DollarSign className="w-3.5 h-3.5"/>Lifetime revenue</div>
              <div className="text-2xl font-display text-primary">{fmt(totals.revenue)}</div>
            </CardContent></Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Tryout history</h2>
              {tryouts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tryout registrations on file.</p>
              ) : (
                <ul className="space-y-3">
                  {tryouts.map((t) => (
                    <li key={t.id} className="flex justify-between items-start border-b border-border pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{t.player_first_name} {t.player_last_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(t.registered_at).toLocaleDateString()} · {t.parent_phone}
                        </div>
                      </div>
                      <Badge variant={t.paid_at ? "default" : "secondary"}>{t.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Team registrations & payments</h2>
              {regs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No team registrations on file.</p>
              ) : (
                <ul className="space-y-3">
                  {regs.map((r) => (
                    <li key={r.id} className="flex justify-between items-start border-b border-border pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{r.player_first_name} {r.player_last_name} — {r.team_level}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()} · {r.payment_plan === "full" ? "Paid in full" : "Deposit + 6 installments"}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={r.status === "paid" ? "default" : r.status === "pending" ? "secondary" : "destructive"}>{r.status}</Badge>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">{fmt(r.amount_paid_cents)} / {fmt(r.annual_tuition_cents)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminPlayerJourney;
