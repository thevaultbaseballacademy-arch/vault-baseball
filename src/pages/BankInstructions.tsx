import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Building2, Copy, Check, Mail, Clock, ArrowLeft, CreditCard } from "lucide-react";
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
                {(() => {
                  const EARLY_BIRD_END = new Date("2026-05-23T00:00:00-05:00").getTime();
                  const isEarlyBird = Date.now() < EARLY_BIRD_END;
                  const isFullPass = order.amount_cents >= 80000;
                  const links = {
                    weeklyRegular: "https://buy.stripe.com/28EdR89pIcaZcM66il6Na02",
                    fullRegular: "https://buy.stripe.com/aFadR89pI0shbI22256Na03",
                    weeklyEarly: "https://buy.stripe.com/4gM5kCeK27UJ27s7mp6Na04",
                    fullEarly: "https://buy.stripe.com/5kQ00i8lE2ApaDYfSV6Na05",
                  };
                  const payLink = isEarlyBird
                    ? (isFullPass ? links.fullEarly : links.weeklyEarly)
                    : (isFullPass ? links.fullRegular : links.weeklyRegular);
                  const regularPrice = isFullPass ? 100000 : 25000;
                  const earlyPrice = isFullPass ? 85000 : 22500;
                  const displayAmount = isEarlyBird ? earlyPrice : regularPrice;
                  const savings = regularPrice - earlyPrice;
                  return (
                    <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-4 space-y-3 shadow-md">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <CreditCard className="w-4 h-4 text-primary" />
                          Pay instantly by card
                          <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                            Recommended
                          </span>
                        </div>
                        {isEarlyBird && (
                          <span className="rounded-full bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5">
                            Early Bird
                          </span>
                        )}
                      </div>

                      <div className="rounded-md bg-background/60 border border-border/60 p-3 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs text-muted-foreground">Early Bird</span>
                          <span className={`font-semibold ${isEarlyBird ? "text-primary text-lg" : "text-foreground"}`}>
                            {fmtMoney(earlyPrice, order.currency)}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs text-muted-foreground">Regular</span>
                          <span className={`font-semibold ${!isEarlyBird ? "text-primary text-lg" : "text-muted-foreground line-through"}`}>
                            {fmtMoney(regularPrice, order.currency)}
                          </span>
                        </div>
                        {isEarlyBird && (
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                            <span className="text-xs font-medium text-primary">You save</span>
                            <span className="text-sm font-bold text-primary">
                              {fmtMoney(savings, order.currency)}
                            </span>
                          </div>
                        )}
                      </div>

                      {isEarlyBird && (
                        <p className="text-[11px] text-primary text-center">
                          Early Bird pricing ends May 22.
                        </p>
                      )}

                      <Button asChild size="lg" className="w-full">
                        <a href={payLink} target="_blank" rel="noopener noreferrer">
                          Pay {fmtMoney(displayAmount, order.currency)} by Card
                        </a>
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center">
                        Spot confirmed immediately. After paying, email your receipt + reference <strong>{order.reference_code}</strong> to {instructions.support_email}.
                      </p>
                    </div>
                  );
                })()}

                <div className="rounded-lg bg-muted/40 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">Pending payment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your spot is held for <strong>{instructions.payment_deadline_days} business days</strong>.
                    Pay by card above for instant confirmation, or use the bank transfer details below.
                  </p>
                </div>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center"><span className="bg-background px-2 text-xs text-muted-foreground">or pay by bank transfer</span></div>
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
