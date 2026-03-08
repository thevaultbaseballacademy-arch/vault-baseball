import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award, Shield, ShieldCheck, UserCheck, UserX, Star, Search,
  CheckCircle2, XCircle, Clock, AlertTriangle, MoreHorizontal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-800", icon: Clock },
  pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  certification_required: { label: "Cert Required", color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
  certified: { label: "Certified", color: "bg-emerald-100 text-emerald-800", icon: Award },
  bypass_certified: { label: "Bypass Certified", color: "bg-purple-100 text-purple-800", icon: ShieldCheck },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  suspended: { label: "Suspended", color: "bg-red-200 text-red-900", icon: UserX },
};

const CoachApprovalPanel = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailCoach, setDetailCoach] = useState<any>(null);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["admin-coaches-approval"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateCoach = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (updates.is_marketplace_approved !== undefined || updates.is_bypass_certified !== undefined) {
        updates.approved_by_admin = user?.id;
      }
      const { error } = await supabase.from("coaches").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches-approval"] });
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast.success("Coach updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleApproveMarketplace = (coach: any) => {
    updateCoach.mutate({
      id: coach.id,
      updates: { is_marketplace_approved: true, marketplace_status: "approved" },
    });
  };

  const handleReject = (coach: any) => {
    updateCoach.mutate({
      id: coach.id,
      updates: { is_marketplace_approved: false, marketplace_status: "rejected" },
    });
  };

  const handleSuspend = (coach: any) => {
    updateCoach.mutate({
      id: coach.id,
      updates: { is_marketplace_approved: false, marketplace_status: "suspended", status: "Suspended" },
    });
  };

  const handleBypassCertify = (coach: any) => {
    updateCoach.mutate({
      id: coach.id,
      updates: { is_bypass_certified: true, is_certified: true, marketplace_status: "bypass_certified" },
    });
  };

  const handleToggleStaff = (coach: any, value: boolean) => {
    updateCoach.mutate({
      id: coach.id,
      updates: { is_staff: value },
    });
  };

  const handleSetStatus = (coach: any, status: string) => {
    const updates: Record<string, any> = { marketplace_status: status };
    if (status === "approved") updates.is_marketplace_approved = true;
    if (status === "suspended" || status === "rejected") updates.is_marketplace_approved = false;
    updateCoach.mutate({ id: coach.id, updates });
  };

  const filtered = (coaches || []).filter((c: any) => {
    const matchSearch =
      !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || c.marketplace_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: coaches?.length || 0,
    approved: coaches?.filter((c: any) => c.is_marketplace_approved).length || 0,
    pending: coaches?.filter((c: any) => ["applied", "pending_review"].includes(c.marketplace_status)).length || 0,
    bypassed: coaches?.filter((c: any) => c.is_bypass_certified).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Coaches</span>
          </div>
          <p className="text-2xl font-display text-foreground">{counts.total}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Marketplace Approved</span>
          </div>
          <p className="text-2xl font-display text-green-600">{counts.approved}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-muted-foreground">Pending Review</span>
          </div>
          <p className="text-2xl font-display text-yellow-600">{counts.pending}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-muted-foreground">Bypass Certified</span>
          </div>
          <p className="text-2xl font-display text-purple-600">{counts.bypassed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search coaches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coach</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Certified</TableHead>
              <TableHead>Bypass</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Marketplace</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No coaches match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((coach: any) => {
                const statusCfg = STATUS_CONFIG[coach.marketplace_status] || STATUS_CONFIG.applied;
                return (
                  <TableRow key={coach.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{coach.name}</p>
                        <p className="text-xs text-muted-foreground">{coach.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {coach.is_certified ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {coach.is_bypass_certified ? (
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coach.is_staff || false}
                        onCheckedChange={(v) => handleToggleStaff(coach, v)}
                      />
                    </TableCell>
                    <TableCell>
                      {coach.is_marketplace_approved ? (
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      ) : (
                        <Badge variant="outline">Not Approved</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(coach.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => setDetailCoach(coach)}>
                            <Shield className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleApproveMarketplace(coach)}>
                            <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                            Approve for Marketplace
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBypassCertify(coach)}>
                            <ShieldCheck className="mr-2 h-4 w-4 text-purple-600" />
                            Bypass Certify (Eddie/Staff)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSetStatus(coach, "certification_required")}>
                            <Award className="mr-2 h-4 w-4 text-orange-600" />
                            Require Certification
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleReject(coach)} className="text-destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSuspend(coach)} className="text-destructive">
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailCoach} onOpenChange={(open) => !open && setDetailCoach(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">COACH APPROVAL DETAILS</DialogTitle>
            <DialogDescription>Manage certification and marketplace access for this coach.</DialogDescription>
          </DialogHeader>
          {detailCoach && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-medium text-foreground">{detailCoach.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-foreground">{detailCoach.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Role</p>
                  <Badge variant="outline">{detailCoach.role}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Account Status</p>
                  <Badge variant={detailCoach.status === "Active" ? "default" : "destructive"}>
                    {detailCoach.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="text-sm font-medium text-foreground">Marketplace Controls</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Marketplace Status</p>
                    <p className="text-xs text-muted-foreground">Current pipeline stage</p>
                  </div>
                  <Select
                    value={detailCoach.marketplace_status}
                    onValueChange={(v) => {
                      handleSetStatus(detailCoach, v);
                      setDetailCoach({ ...detailCoach, marketplace_status: v });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Bypass Certified</p>
                    <p className="text-xs text-muted-foreground">In-person certified by Eddie Mejia</p>
                  </div>
                  <Switch
                    checked={detailCoach.is_bypass_certified || false}
                    onCheckedChange={(v) => {
                      handleBypassCertify(detailCoach);
                      setDetailCoach({ ...detailCoach, is_bypass_certified: v, is_certified: v || detailCoach.is_certified });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Staff Coach</p>
                    <p className="text-xs text-muted-foreground">Internal Vault team member</p>
                  </div>
                  <Switch
                    checked={detailCoach.is_staff || false}
                    onCheckedChange={(v) => {
                      handleToggleStaff(detailCoach, v);
                      setDetailCoach({ ...detailCoach, is_staff: v });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">Marketplace Approved</p>
                    <p className="text-xs text-muted-foreground">Visible on public marketplace</p>
                  </div>
                  <Switch
                    checked={detailCoach.is_marketplace_approved || false}
                    onCheckedChange={(v) => {
                      const updates: Record<string, any> = { is_marketplace_approved: v };
                      if (v) updates.marketplace_status = "approved";
                      updateCoach.mutate({ id: detailCoach.id, updates });
                      setDetailCoach({ ...detailCoach, is_marketplace_approved: v, marketplace_status: v ? "approved" : detailCoach.marketplace_status });
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleApproveMarketplace(detailCoach);
                    setDetailCoach(null);
                  }}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    handleSuspend(detailCoach);
                    setDetailCoach(null);
                  }}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Suspend
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachApprovalPanel;
