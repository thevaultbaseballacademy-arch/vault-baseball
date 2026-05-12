import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Banknote, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentOrder {
  id: string;
  reference_code: string;
  product_type: string;
  amount_cents: number;
  currency: string;
  payment_method: string;
  status: string;
  customer_email: string | null;
  customer_name: string | null;
  created_at: string;
  confirmed_at: string | null;
  notes: string | null;
}

const STATUSES = [
  { id: "pending_bank_transfer", label: "Awaiting transfer" },
  { id: "paid", label: "Paid" },
  { id: "canceled", label: "Canceled" },
  { id: "all", label: "All" },
];

const fmtMoney = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

const statusBadge = (s: string) => {
  switch (s) {
    case "paid": return <Badge className="bg-emerald-600 hover:bg-emerald-600">Paid</Badge>;
    case "pending_bank_transfer": return <Badge variant="outline" className="border-amber-500 text-amber-600">Awaiting transfer</Badge>;
    case "pending": return <Badge variant="outline">Pending</Badge>;
    case "failed": return <Badge variant="destructive">Failed</Badge>;
    case "canceled": return <Badge variant="secondary">Canceled</Badge>;
    default: return <Badge variant="secondary">{s}</Badge>;
  }
};

export default function AdminPayments() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending_bank_transfer");
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("payment_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      toast({ title: "Failed to load orders", description: error.message, variant: "destructive" });
    } else {
      setOrders((data ?? []) as PaymentOrder[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const totalAwaiting = useMemo(
    () => orders.filter(o => o.status === "pending_bank_transfer").reduce((s, o) => s + o.amount_cents, 0),
    [orders],
  );

  const act = async (orderId: string, action: "paid" | "canceled") => {
    if (action === "canceled" && !confirm("Cancel this order? The user's spot will be released.")) return;
    setActingId(orderId);
    const { data, error } = await supabase.functions.invoke("admin-confirm-bank-transfer", {
      body: { orderId, action },
    });
    setActingId(null);
    if (error || (data as any)?.error) {
      toast({
        title: action === "paid" ? "Mark paid failed" : "Cancel failed",
        description: (error?.message ?? (data as any)?.error) || "Try again",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: action === "paid" ? "Marked as paid" : "Order canceled",
      description: action === "paid" ? "The registration is now confirmed." : "Spot released.",
    });
    load();
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Banknote className="w-6 h-6 text-primary" /> Payments
          </h1>
          <p className="text-sm text-muted-foreground">Track card and bank-transfer orders. Manually confirm bank transfers when funds arrive.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="pt-6">
          <div className="text-xs uppercase text-muted-foreground">Awaiting transfer</div>
          <div className="text-2xl font-bold">{orders.filter(o => o.status === "pending_bank_transfer").length}</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-xs uppercase text-muted-foreground">Outstanding total</div>
          <div className="text-2xl font-bold">{fmtMoney(totalAwaiting)}</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-xs uppercase text-muted-foreground">Visible (filtered)</div>
          <div className="text-2xl font-bold">{orders.length}</div>
        </CardContent></Card>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          {STATUSES.map(s => <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-base">Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">No orders match this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Reference</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Created</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-xs">{o.reference_code}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                      </td>
                      <td className="px-4 py-3 capitalize">{o.product_type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 capitalize">{o.payment_method.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 font-medium">{fmtMoney(o.amount_cents, o.currency)}</td>
                      <td className="px-4 py-3">{statusBadge(o.status)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {o.status === "pending_bank_transfer" && o.payment_method === "bank_transfer" && (
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              size="sm"
                              onClick={() => act(o.id, "paid")}
                              disabled={actingId === o.id}
                            >
                              {actingId === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                              Mark paid
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => act(o.id, "canceled")}
                              disabled={actingId === o.id}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
