import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2, Calendar, MapPin } from "lucide-react";
import { useAdminTryouts, useSaveTryout } from "@/hooks/useTryouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initial = {
  name: "",
  age_group: "9-12" as "9-12" | "13-17",
  starts_at: "",
  ends_at: "",
  location_name: "",
  address: "",
  price_cents: 5000,
  capacity: 20,
  waitlist_capacity: 10,
  description: "",
  what_to_bring: "",
  status: "draft" as "draft" | "published" | "closed",
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });

const AdminTryouts = () => {
  const { data: events, isLoading } = useAdminTryouts();
  const save = useSaveTryout();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);

  const handleCreate = async () => {
    if (!form.name || !form.starts_at || !form.location_name) return;
    await save.mutateAsync({
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    } as any);
    setOpen(false);
    setForm(initial);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display tracking-wide">Tryouts</h1>
          <p className="text-sm text-muted-foreground">Manage tryout events and registrations.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New tryout
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      )}

      {!isLoading && (events?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No tryouts yet. Create your first event.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {events?.map((e) => (
          <Link key={e.id} to={`/admin/tryouts/${e.id}`}>
            <Card className="hover:border-foreground/30 transition-colors">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{e.name}</h3>
                    <Badge variant={e.status === "published" ? "default" : "outline"} className="text-[10px] uppercase">
                      {e.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">Ages {e.age_group}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatWhen(e.starts_at)}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location_name}</span>
                    <span>Cap {e.capacity}</span>
                    <span>${(e.price_cents / 100).toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New tryout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Age group *</Label>
                <Select value={form.age_group} onValueChange={(v) => setForm({ ...form, age_group: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9-12">9–12</SelectItem>
                    <SelectItem value="13-17">13–17</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Starts at *</Label>
                <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Ends at</Label>
                <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Location name *</Label>
              <Input value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Price ($)</Label>
                <Input type="number" min={0} value={form.price_cents / 100}
                  onChange={(e) => setForm({ ...form, price_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input type="number" min={1} value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value || "0", 10) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Waitlist</Label>
                <Input type="number" min={0} value={form.waitlist_capacity}
                  onChange={(e) => setForm({ ...form, waitlist_capacity: parseInt(e.target.value || "0", 10) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>What to bring</Label>
              <Textarea rows={2} value={form.what_to_bring} onChange={(e) => setForm({ ...form, what_to_bring: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={save.isPending}>
                {save.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTryouts;
