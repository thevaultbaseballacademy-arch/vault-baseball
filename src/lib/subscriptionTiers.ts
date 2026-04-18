// Public-facing subscription tier catalog (.99 pricing).
// Stripe price IDs remain in src/components/Pricing.tsx for the live wired tiers.

import { APPLE_IAP_PRODUCTS } from './appleIAP';

export interface SubscriptionTier {
  id: 'starter' | 'performance' | 'elite' | 'remote_training' | 'founders';
  name: string;
  price: number;
  cadence: '/month' | 'one-time lifetime';
  appleIAPId: string;
  description: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  { id: 'starter', name: 'Starter', price: 29.99, cadence: '/month', appleIAPId: APPLE_IAP_PRODUCTS.starter_monthly, description: 'Core training modules and weekly programming.' },
  { id: 'performance', name: 'Performance', price: 59.99, cadence: '/month', appleIAPId: APPLE_IAP_PRODUCTS.performance_monthly, description: 'Full VAULT™ stack with personalized programming.' },
  { id: 'elite', name: 'Elite', price: 149.99, cadence: '/month', appleIAPId: APPLE_IAP_PRODUCTS.elite_monthly, description: '1-on-1 coaching, unlimited analysis, recruiting guidance.' },
  { id: 'remote_training', name: 'Remote Training', price: 199.99, cadence: '/month', appleIAPId: APPLE_IAP_PRODUCTS.remote_training_monthly, description: 'Elite ongoing remote development with a dedicated coach.' },
  { id: 'founders', name: 'Founders Access', price: 499.99, cadence: 'one-time lifetime', appleIAPId: APPLE_IAP_PRODUCTS.founders_access, description: 'Lifetime access to every VAULT OS tier.' },
];

export interface AcademyTier {
  id: 'single_team' | 'full_academy' | 'white_label';
  name: string;
  price: number;
  description: string;
}

export const ACADEMY_TIERS: AcademyTier[] = [
  { id: 'single_team', name: 'Single Team', price: 149, description: 'Up to 20 athletes, full VAULT OS curriculum.' },
  { id: 'full_academy', name: 'Full Academy', price: 299, description: 'Unlimited athletes across your organization.' },
  { id: 'white_label', name: 'White Label', price: 499, description: 'Custom branding, dedicated environment.' },
];

export const ACADEMY_ANNUAL_NOTE = 'Annual on any tier: 2 months free.';
