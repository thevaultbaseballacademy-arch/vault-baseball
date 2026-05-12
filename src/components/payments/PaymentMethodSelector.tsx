import { CreditCard, Building2, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "card" | "bank_transfer";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  disabled?: boolean;
  amountLabel?: string;
  className?: string;
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled,
  amountLabel,
  className,
}: PaymentMethodSelectorProps) {
  const options: Array<{
    id: PaymentMethod;
    title: string;
    badge: string;
    icon: typeof CreditCard;
    bullets: string[];
    accent: string;
  }> = [
    {
      id: "card",
      title: "Pay by Card",
      badge: "Fastest",
      icon: CreditCard,
      bullets: [
        "Instant secure checkout via Stripe",
        "Spot confirmed immediately",
      ],
      accent: "border-primary",
    },
    {
      id: "bank_transfer",
      title: "Pay by Bank Transfer",
      badge: "Alternate",
      icon: Building2,
      bullets: [
        "Reserve spot now, send transfer after",
        "Confirmed once funds arrive (1–3 business days)",
      ],
      accent: "border-muted-foreground/30",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Choose how to pay</h3>
        {amountLabel && (
          <span className="text-sm text-muted-foreground">{amountLabel}</span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = value === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              aria-pressed={selected}
              className={cn(
                "text-left rounded-xl border p-4 transition-all bg-card",
                "hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary ring-2 ring-primary/40 shadow-md"
                  : "border-border",
                disabled && "opacity-60 cursor-not-allowed",
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "rounded-lg p-2",
                  selected ? "bg-primary/15 text-primary" : "bg-muted text-foreground/70",
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{opt.title}</span>
                    <span className={cn(
                      "text-[10px] uppercase tracking-wide font-bold rounded px-1.5 py-0.5",
                      opt.id === "card"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}>
                      {opt.id === "card" ? <Zap className="w-3 h-3 inline -mt-0.5 mr-0.5" /> : <Clock className="w-3 h-3 inline -mt-0.5 mr-0.5" />}
                      {opt.badge}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                    {opt.bullets.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {value === "bank_transfer" && (
        <p className="text-xs text-muted-foreground">
          We'll reserve your spot as <strong>pending payment</strong> and email you the bank transfer instructions. Your spot is fully confirmed once we receive the funds.
        </p>
      )}
    </div>
  );
}

export default PaymentMethodSelector;
