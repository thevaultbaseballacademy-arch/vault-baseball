import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Search,
  Loader2,
  XCircle,
  Clock,
  Gift,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAdminEssaBookings,
  useCancelEssaBooking,
  useRescheduleEssaBooking,
  useGrantEssaCredits,
  type AdminEssaBooking,
  type EssaBookingFilters,
} from "@/hooks/useEssaAdminBookings";

const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    confirmed: "bg-primary/10 text-primary border-primary/30",
    completed: "bg-accent/10 text-accent border-accent/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <Badge variant="outline" className={`capitalize ${map[status] ?? "bg-secondary"}`}>
      {status}
    </Badge>
  );
};

const RescheduleDialog = ({
  booking,
  onClose,
}: {
  booking: AdminEssaBooking | null;
  onClose: () => void;
}) => {
  const reschedule = useRescheduleEssaBooking();
  const [value, setValue] = useState(
    booking ? format(new Date(booking.starts_at), "yyyy-MM-dd'T'HH:mm") : "",
  );

  if (!booking) return null;
  const duration =
    (new Date(booking.ends_at).getTime() - new Date(booking.starts_at).getTime()) / 60_000;

  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule booking</DialogTitle>
          <DialogDescription>
            {booking.title} — {Math.round(duration)} min session
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>New start time</Label>
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!value || reschedule.isPending}
            onClick={async () => {
              await reschedule.mutateAsync({
                id: booking.id,
                newStart: new Date(value),
                durationMinutes: duration,
              });
              onClose();
            }}
          >
            {reschedule.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const GrantCreditsDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const grant = useGrantEssaCredits();
  const [email, setEmail] = useState("");
  const [total, setTotal] = useState(5);
  const [reason, setReason] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("180");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant ESSA lesson credits</DialogTitle>
          <DialogDescription>
            Issue complimentary credits redeemable for any ESSA private lesson.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Athlete email</Label>
            <Input
              type="email"
              placeholder="athlete@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Credits</Label>
              <Input
                type="number"
                min={1}
                value={total}
                onChange={(e) => setTotal(Math.max(1, parseInt(e.target.value || "1", 10)))}
              />
            </div>
            <div className="space-y-1">
              <Label>Expires in (days)</Label>
              <Input
                type="number"
                min={0}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="0 for no expiry"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Reason / note (optional)</Label>
            <Textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Make-good for cancelled clinic"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!email || total < 1 || grant.isPending}
            onClick={async () => {
              await grant.mutateAsync({
                email,
                totalLessons: total,
                reason: reason || undefined,
                expiresInDays: expiresInDays ? parseInt(expiresInDays, 10) : null,
              });
              setEmail("");
              setReason("");
              onClose();
            }}
          >
            {grant.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Grant credits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const OwnerEssaBookingsPanel = () => {
  const [filters, setFilters] = useState<EssaBookingFilters>({
    status: "all",
    range: "upcoming",
    search: "",
  });
  const [reschedule, setReschedule] = useState<AdminEssaBooking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<AdminEssaBooking | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);

  const { data: bookings = [], isLoading } = useAdminEssaBookings(filters);
  const cancel = useCancelEssaBooking();

  const totals = {
    upcoming: bookings.filter((b) => new Date(b.starts_at) > new Date() && b.status !== "cancelled").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground mb-1">ESSA BOOKINGS</h1>
          <p className="text-sm text-muted-foreground">
            Manage all ESSA reservations, cancel or reschedule sessions, and grant complimentary credits.
          </p>
        </div>
        <Button onClick={() => setGrantOpen(true)} className="gap-2">
          <Gift className="w-4 h-4" />
          Grant credits
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-primary mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Upcoming</span>
          </div>
          <p className="text-2xl font-display">{totals.upcoming}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-accent mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Confirmed</span>
          </div>
          <p className="text-2xl font-display">{totals.confirmed}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Cancelled</span>
          </div>
          <p className="text-2xl font-display">{totals.cancelled}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search athlete or lesson..."
              value={filters.search ?? ""}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.range ?? "upcoming"}
            onValueChange={(v: any) => setFilters({ ...filters, range: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status ?? "all"}
            onValueChange={(v: any) => setFilters({ ...filters, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List */}
      <Card className="divide-y divide-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No bookings match these filters.
          </div>
        ) : (
          bookings.map((b) => {
            const start = new Date(b.starts_at);
            const end = new Date(b.ends_at);
            return (
              <div
                key={b.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground truncate">{b.title}</span>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {format(start, "EEE MMM d")} · {format(start, "p")} – {format(end, "p")}
                    </span>
                    {b.athlete_name && (
                      <span className="inline-flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {b.athlete_name}
                      </span>
                    )}
                    {b.athlete_email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {b.athlete_email}
                      </span>
                    )}
                    {b.coach_name && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        Coach: {b.coach_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={b.status === "cancelled"}
                    onClick={() => setReschedule(b)}
                  >
                    Reschedule
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={b.status === "cancelled"}
                    onClick={() => setConfirmCancel(b)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </Card>

      <RescheduleDialog booking={reschedule} onClose={() => setReschedule(null)} />
      <GrantCreditsDialog open={grantOpen} onClose={() => setGrantOpen(false)} />

      <AlertDialog open={!!confirmCancel} onOpenChange={(o) => !o && setConfirmCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmCancel?.title} on{" "}
              {confirmCancel ? format(new Date(confirmCancel.starts_at), "EEE MMM d, p") : ""}.
              Note: this does not auto-refund credits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmCancel) await cancel.mutateAsync(confirmCancel.id);
                setConfirmCancel(null);
              }}
            >
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerEssaBookingsPanel;
