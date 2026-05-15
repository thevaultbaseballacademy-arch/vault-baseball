import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Building2, Copy, Check, Mail, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) ?? "";
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ?? "";

interface OrderInfo {
  id: string;
  reference_code: string;
  amount_cents: number;
  currency: string;
  status: string;
  customer_email: string;
  customer_name: string | null;
  product_type: string;
  created_at: string;
}

interface BankInstructions {
  account_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  payment_deadline_days: number;
  support_email: string;
}

const fmtMoney = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card/50 px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-mono text-sm break-all">{value}</div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast({ title: "Copied", description: `${label} copied to clipboard.` });
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

export default function BankInstructions() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [instructions, setInstructions] = useState<BankInstructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/get-bank-instructions?orderId=${encodeURIComponent(orderId)}`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to load");
        if (cancelled) return;
        setOrder(data.order);
        setInstructions(data.instructions);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Home
        </Link>

        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/15 p-2 text-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Bank Transfer Instructions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your spot is reserved. Complete the transfer below and we'll confirm your registration.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading && (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {order && instructions && (
              <>
                <div className="rounded-lg bg-muted/40 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">Pending payment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please complete your transfer within <strong>{instructions.payment_deadline_days} business days</strong>.
                    Your spot is held until then.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <CopyRow label="Amount" value={fmtMoney(order.amount_cents, order.currency)} />
                  <CopyRow label="Reference (include with transfer)" value={order.reference_code} />
                  <CopyRow label="Account name" value={instructions.account_name} />
                  <CopyRow label="Bank" value={instructions.bank_name} />
                  <CopyRow label="Account number" value={instructions.account_number} />
                  <CopyRow label="Routing number" value={instructions.routing_number} />
                </div>

                <div className="rounded-md border border-border p-4 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="w-4 h-4" /> What happens next
                  </div>
                  <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
                    <li>Send the transfer using the details above.</li>
                    <li><strong>Always include your reference code</strong> so we can match the payment.</li>
                    <li>We'll email a confirmation to <strong>Eddie@methods22.com</strong> within 1–3 business days of receiving funds.</li>
                  </ol>
                  <p className="text-xs text-muted-foreground pt-1">
                    Questions? Email <a className="underline" href={`mailto:${instructions.support_email}`}>{instructions.support_email}</a> with your reference code.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
