import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Download, Trash2 } from "lucide-react";
import {
  useAdminTryout, useTryoutRegistrations, useSaveTryout,
  useDeleteTryout, useUpdateRegistrationStatus,
} from "@/hooks/useTryouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

const ageOf = (dob: string) => {
  const d = new Date(dob);
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a;
};

const AdminTryoutDetail = () => {
  const { id } = useParams();
  const { data: event, isLoading } = useAdminTryout(id);
  const { data: regs } = useTryoutRegistrations(id);
  const save = useSaveTryout();
  const del = useDeleteTryout();
  const updateStatus = useUpdateRegistrationStatus();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!regs) return [];
    if (!search) return regs;
    const q = search.toLowerCase();
    return regs.filter((r) =>
      `${r.player_first_name} ${r.player_last_name} ${r.parent_email} ${r.parent_name}`
        .toLowerCase().includes(q),
    );
  }, [regs, search]);

  const stats = useMemo(() => {
    const list = regs ?? [];
    return {
      confirmed: list.filter((r) => r.status === "confirmed").length,
      pending: list.filter((r) => r.status === "pending").length,
      waitlisted: list.filter((r) => r.status === "waitlisted").length,
      cancelled: list.filter((r) => r.status === "cancelled").length,
    };
  }, [regs]);

  const exportCsv = () => {
    if (!regs || regs.length === 0) return;
    const headers = [
      "Player", "Age", "DOB", "Throwing", "Position", "Team",
      "Parent", "Email", "Phone",
      "Emergency name", "Emergency phone", "Relationship",
      "Medical", "Photo release", "Status", "Registered at",
    ];
    const rows = regs.map((r) => [
      `${r.player_first_name} ${r.player_last_name}`,
      ageOf(r.player_dob),
      r.player_dob,
      r.player_throwing_hand ?? "",
      r.player_position ?? "",
      r.player_current_team ?? "",
      r.parent_name,
      r.parent_email,
      r.parent_phone,
      r.emergency_contact_name,
      r.emergency_contact_phone,
      r.emergency_relationship,
      (r.medical_notes ?? "").replace(/\n/g, " "),
      r.photo_release_consent ? "Yes" : "No",
      r.status,
      r.registered_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event?.name ?? "tryout"}-roster.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !event) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/tryouts"><ArrowLeft className="w-4 h-4 mr-1" /> All tryouts</Link>
        </Button>
        <Button
          variant="ghost" size="sm"
          className="text-destructive"
          onClick={async () => {
            if (confirm("Delete this tryout? Registrations will be removed.")) {
              await del.mutateAsync(event.id);
              window.location.href = "/admin/tryouts";
            }
          }}
        >
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-display tracking-wide">{event.name}</h1>
          <Badge variant={event.status === "published" ? "default" : "outline"} className="text-[10px] uppercase">
            {event.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatWhen(event.starts_at)} · {event.location_name} · Ages {event.age_group} · ${(event.price_cents / 100).toFixed(0)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={event.status} onValueChange={(v) => save.mutate({ id: event.id, status: v as any })}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCsv} disabled={(regs?.length ?? 0) === 0}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {(() => {
        const filled = stats.confirmed + stats.pending;
        const pct = event.capacity > 0 ? filled / event.capacity : 0;
        if (pct < 0.8 || event.status === "closed") return null;
        return (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            <strong className="text-amber-200">{Math.round(pct * 100)}% full</strong>{" "}
            <span className="text-amber-100/80">
              ({filled}/{event.capacity}). Consider opening the next pair of dates so the waitlist doesn't bottleneck.
            </span>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Confirmed" value={stats.confirmed} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Waitlisted" value={stats.waitlisted} />
        <Stat label="Cancelled" value={stats.cancelled} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Registrations</h2>
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No registrations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.player_first_name} {r.player_last_name}</TableCell>
                      <TableCell>{ageOf(r.player_dob)}</TableCell>
                      <TableCell>{r.parent_name}</TableCell>
                      <TableCell className="text-xs">
                        <div>{r.parent_email}</div>
                        <div className="text-muted-foreground">{r.parent_phone}</div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={r.status}
                          onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v as any })}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="waitlisted">Waitlisted</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.registered_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <Card>
    <CardContent className="p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </CardContent>
  </Card>
);

export default AdminTryoutDetail;
