import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Users, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Row {
  id: string;
  team_level: string;
  tier: string;
  annual_tuition_cents: number;
  payment_plan: "full" | "installments";
  deposit_cents: number;
  installment_count: number;
  installment_cents: number;
  player_first_name: string;
  player_last_name: string;
  player_position: string | null;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  status: "pending" | "paid" | "failed" | "canceled";
  amount_paid_cents: number;
  paid_at: string | null;
  created_at: string;
}

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    cents / 100,
  );

const statusVariant = (s: Row["status"]) =>
  s === "paid" ? "default" : s === "pending" ? "secondary" : "destructive";

const AdminTeamRegistrations = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase.from("team_registrations" as any) as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (!error) setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${r.player_first_name} ${r.player_last_name} ${r.parent_email} ${r.parent_phone} ${r.team_level}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [rows, q, statusFilter]);

  const stats = useMemo(() => {
    const paid = rows.filter((r) => r.status === "paid");
    const pending = rows.filter((r) => r.status === "pending");
    const revenue = paid.reduce((sum, r) => sum + (r.amount_paid_cents || 0), 0);
    return { total: rows.length, paid: paid.length, pending: pending.length, revenue };
  }, [rows]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display tracking-wide">Team Registrations</h1>
        <p className="text-sm text-muted-foreground">Travel team signups and tuition payments.</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="w-3.5 h-3.5"/>Total</div>
          <div className="text-2xl font-display">{stats.total}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><DollarSign className="w-3.5 h-3.5"/>Collected</div>
          <div className="text-2xl font-display text-primary">{fmt(stats.revenue)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><DollarSign className="w-3.5 h-3.5"/>Paid registrations</div>
          <div className="text-2xl font-display">{stats.paid}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5"/>Pending</div>
          <div className="text-2xl font-display">{stats.pending}</div>
        </CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search player, parent, email, team…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
          No registrations match your filters yet.
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Player</th>
                    <th className="text-left p-3">Team</th>
                    <th className="text-left p-3">Parent</th>
                    <th className="text-left p-3">Plan</th>
                    <th className="text-right p-3">Paid</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium">{r.player_first_name} {r.player_last_name}</div>
                        {r.player_position && <div className="text-xs text-muted-foreground">{r.player_position}</div>}
                      </td>
                      <td className="p-3">
                        <div>{r.team_level}</div>
                        <div className="text-xs text-muted-foreground">{fmt(r.annual_tuition_cents)}/yr</div>
                      </td>
                      <td className="p-3">
                        <div>{r.parent_first_name} {r.parent_last_name}</div>
                        <div className="text-xs text-muted-foreground">{r.parent_email}</div>
                        <div className="text-xs text-muted-foreground">{r.parent_phone}</div>
                      </td>
                      <td className="p-3 text-xs">
                        {r.payment_plan === "full" ? (
                          <span>Pay in full</span>
                        ) : (
                          <span>
                            {fmt(r.deposit_cents)} dep · {r.installment_count}× {fmt(r.installment_cents)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono">{fmt(r.amount_paid_cents)}</td>
                      <td className="p-3"><Badge variant={statusVariant(r.status) as any}>{r.status}</Badge></td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTeamRegistrations;
