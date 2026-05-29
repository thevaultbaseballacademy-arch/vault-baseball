// Vault travel team levels and pricing.
// All amounts are in USD cents.

export type TeamTier = "Foundation" | "Development" | "Premier" | "Elite";

export interface TeamLevel {
  id: string;
  label: string;
  tier: TeamTier;
  annualTuitionCents: number;
}

export const TEAM_LEVELS: TeamLevel[] = [
  { id: "9U-foundation", label: "9U Foundation", tier: "Foundation", annualTuitionCents: 450000 },
  { id: "10U-foundation", label: "10U Foundation", tier: "Foundation", annualTuitionCents: 450000 },
  { id: "11U-development", label: "11U Development", tier: "Development", annualTuitionCents: 520000 },
  { id: "12U-elite", label: "12U Elite", tier: "Elite", annualTuitionCents: 550000 },
  { id: "13U-premier", label: "13U Premier", tier: "Premier", annualTuitionCents: 550000 },
  { id: "14U-premier", label: "14U Premier", tier: "Premier", annualTuitionCents: 600000 },
  { id: "15U-elite", label: "15U Elite", tier: "Elite", annualTuitionCents: 600000 },
  { id: "16U-elite", label: "16U Elite", tier: "Elite", annualTuitionCents: 600000 },
  { id: "17U-elite", label: "17U Elite", tier: "Elite", annualTuitionCents: 600000 },
];

// Payment plan: 25% deposit at registration, balance over 6 monthly installments.
export const DEPOSIT_PERCENT = 0.25;
export const INSTALLMENT_COUNT = 6;

export function computePaymentPlan(annualTuitionCents: number) {
  const deposit = Math.round(annualTuitionCents * DEPOSIT_PERCENT);
  const remaining = annualTuitionCents - deposit;
  const perInstallment = Math.ceil(remaining / INSTALLMENT_COUNT / 100) * 100; // round up to nearest dollar
  return {
    depositCents: deposit,
    installmentCount: INSTALLMENT_COUNT,
    installmentCents: perInstallment,
  };
}

export const formatUSD = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);

export const getTeamLevel = (id: string) => TEAM_LEVELS.find((t) => t.id === id);
