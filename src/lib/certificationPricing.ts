// Stripe price IDs for certification purchases
export const CERTIFICATION_PRICES: Record<string, string | null> = {
  // Baseball certifications
  foundations: null, // Free - included
  performance: 'price_1SkSfyPhXS410TO5oO4XZv3P',
  catcher_specialist: 'price_1SkSg0PhXS410TO5cbeWFnRu',
  infield_specialist: 'price_1SkSg1PhXS410TO5BpfCyUhH',
  outfield_specialist: 'price_1SkSg2PhXS410TO5KaFDaZpo',
  // Softball certifications (Stripe price IDs to be configured)
  softball_foundations: null, // Free - included
  softball_performance: null, // Will be configured when Stripe product is created
  softball_pitching_specialist: null,
  softball_hitting_specialist: null,
  softball_defense_specialist: null,
  // Softball Hitting & Slap certifications
  softball_hitting_foundations: null, // Free - included
  softball_hitting_performance: null, // Will be configured when Stripe product is created
  softball_slap_specialist: null, // Will be configured when Stripe product is created
} as const;

export const CERTIFICATION_PRODUCT_IDS = {
  performance: 'prod_ThsQA8sfGtmgdp',
  catcher_specialist: 'prod_ThsQ3pzuenDuKI',
  infield_specialist: 'prod_ThsQmvP5ZbTYEM',
  outfield_specialist: 'prod_ThsQi0ZOt2xxPJ',
} as const;

export type CertificationType = 
  | 'foundations' 
  | 'performance' 
  | 'catcher_specialist' 
  | 'infield_specialist' 
  | 'outfield_specialist'
  | 'softball_foundations'
  | 'softball_performance'
  | 'softball_pitching_specialist'
  | 'softball_hitting_specialist'
  | 'softball_defense_specialist'
  | 'softball_hitting_foundations'
  | 'softball_hitting_performance'
  | 'softball_slap_specialist';

export const getCertificationDisplayName = (type: CertificationType): string => {
  const names: Record<CertificationType, string> = {
    foundations: 'VAULT™ Foundations',
    performance: 'VAULT™ Performance',
    catcher_specialist: 'Catcher Specialist',
    infield_specialist: 'Infield Specialist',
    outfield_specialist: 'Outfield Specialist',
    softball_foundations: 'VAULT™ Softball Foundations',
    softball_performance: 'VAULT™ Softball Performance',
    softball_pitching_specialist: 'Softball Pitching Specialist',
    softball_hitting_specialist: 'Softball Hitting Specialist',
    softball_defense_specialist: 'Softball Defense Specialist',
    softball_hitting_foundations: 'Softball Hitting Foundations',
    softball_hitting_performance: 'Softball Hitting Performance',
    softball_slap_specialist: 'Softball Slap Specialist',
  };
  return names[type];
};

export const getCertificationPrice = (type: CertificationType): number => {
  const prices: Record<CertificationType, number> = {
    foundations: 0,
    performance: 2500,
    catcher_specialist: 1500,
    infield_specialist: 1500,
    outfield_specialist: 1500,
    softball_foundations: 0,
    softball_performance: 2500,
    softball_pitching_specialist: 2500,  // HIGH VALUE - most coaches don't understand windmill
    softball_hitting_specialist: 1500,
    softball_defense_specialist: 1500,
    softball_hitting_foundations: 0, // Free - required for all coaches
    softball_hitting_performance: 2500,
    softball_slap_specialist: 2500, // HIGH VALUE - premium slap certification
  };
  return prices[type];
};

// Helper to determine if a certification is softball-specific
export const isSoftballCertification = (type: CertificationType): boolean => {
  return type.startsWith('softball_');
};

// Helper to determine if a certification is baseball-specific
export const isBaseballCertification = (type: CertificationType): boolean => {
  return !type.startsWith('softball_');
};

// =============================================================================
// VAULT OS Certification Catalog (.99 pricing + bundles + Apple IAP)
// -----------------------------------------------------------------------------
// New catalog used by the Certifications storefront UI. The legacy
// CERTIFICATION_PRICES / CertificationType exports above remain in place to
// preserve existing exam, leaderboard, and verification flows that key off the
// DB-backed certification_type enum.
// =============================================================================

import { APPLE_IAP_PRODUCTS } from './appleIAP';

export type CertCategory = 'youth' | 'hitting' | 'pitching' | 'strength' | 'recovery' | 'mental' | 'recruiting' | 'elite';

export interface CertificationCatalogItem {
  id: string;
  name: string;
  price: number;
  renewalPrice: number;
  stripeProductId: string;
  stripeRenewalProductId: string;
  appleIAPId: string;
  description: string;
  category: CertCategory;
  sport: 'baseball' | 'softball' | 'both';
}

export const CERTIFICATION_CATALOG: CertificationCatalogItem[] = [
  {
    id: 'youth_baseball',
    name: 'Youth Baseball Coach',
    price: 99.99,
    renewalPrice: 49.99,
    stripeProductId: 'price_youth_baseball',
    stripeRenewalProductId: 'price_youth_baseball_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.youth_baseball_cert,
    description: 'Foundational coaching framework for 8U–12U baseball.',
    category: 'youth',
    sport: 'baseball',
  },
  {
    id: 'youth_softball',
    name: 'Youth Softball Coach',
    price: 99.99,
    renewalPrice: 49.99,
    stripeProductId: 'price_youth_softball',
    stripeRenewalProductId: 'price_youth_softball_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.youth_softball_cert,
    description: 'Foundational coaching framework for 8U–12U softball.',
    category: 'youth',
    sport: 'softball',
  },
  {
    id: 'foundations_hitting',
    name: 'Foundations of Hitting',
    price: 149.99,
    renewalPrice: 74.99,
    stripeProductId: 'price_foundations_hitting',
    stripeRenewalProductId: 'price_foundations_hitting_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.foundations_hitting_cert,
    description: 'Core hitting mechanics, swing pathing, and athlete progressions.',
    category: 'hitting',
    sport: 'both',
  },
  {
    id: 'foundations_pitching',
    name: 'Foundations of Pitching',
    price: 149.99,
    renewalPrice: 74.99,
    stripeProductId: 'price_foundations_pitching',
    stripeRenewalProductId: 'price_foundations_pitching_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.foundations_pitching_cert,
    description: 'Delivery mechanics, sequencing, and youth-safe pitch development.',
    category: 'pitching',
    sport: 'baseball',
  },
  {
    id: 'softball_pitching',
    name: 'Softball Pitching (Windmill)',
    price: 149.99,
    renewalPrice: 74.99,
    stripeProductId: 'price_softball_pitching',
    stripeRenewalProductId: 'price_softball_pitching_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.softball_pitching_cert,
    description: 'Windmill mechanics across all 5 phases plus pitch design.',
    category: 'pitching',
    sport: 'softball',
  },
  {
    id: 'strength_baseball',
    name: 'Strength & Conditioning — Baseball',
    price: 179.99,
    renewalPrice: 89.99,
    stripeProductId: 'price_strength_baseball',
    stripeRenewalProductId: 'price_strength_baseball_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.strength_baseball_cert,
    description: 'Sport-specific strength programming for baseball athletes.',
    category: 'strength',
    sport: 'baseball',
  },
  {
    id: 'strength_softball',
    name: 'Strength & Conditioning — Softball',
    price: 179.99,
    renewalPrice: 89.99,
    stripeProductId: 'price_strength_softball',
    stripeRenewalProductId: 'price_strength_softball_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.strength_softball_cert,
    description: 'Sport-specific strength programming for softball athletes.',
    category: 'strength',
    sport: 'softball',
  },
  {
    id: 'recovery_arm_care',
    name: 'Recovery & Arm Care',
    price: 129.99,
    renewalPrice: 64.99,
    stripeProductId: 'price_recovery_arm_care',
    stripeRenewalProductId: 'price_recovery_arm_care_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.recovery_arm_care_cert,
    description: 'Throwing volume, ROM, and structured recovery protocols.',
    category: 'recovery',
    sport: 'both',
  },
  {
    id: 'mental_performance',
    name: 'Mental Performance',
    price: 129.99,
    renewalPrice: 64.99,
    stripeProductId: 'price_mental_performance',
    stripeRenewalProductId: 'price_mental_performance_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.mental_performance_cert,
    description: 'Confidence, focus, and pressure-performance frameworks.',
    category: 'mental',
    sport: 'both',
  },
  {
    id: 'recruiting_placement',
    name: 'Recruiting & Placement',
    price: 199.99,
    renewalPrice: 99.99,
    stripeProductId: 'price_recruiting_placement',
    stripeRenewalProductId: 'price_recruiting_placement_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.recruiting_cert,
    description: 'Collegiate placement playbook and athlete advocacy.',
    category: 'recruiting',
    sport: 'both',
  },
  {
    id: 'advanced_hitting_analytics',
    name: 'Advanced Hitting Analytics',
    price: 249.99,
    renewalPrice: 124.99,
    stripeProductId: 'price_advanced_hitting',
    stripeRenewalProductId: 'price_advanced_hitting_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.advanced_hitting_cert,
    description: 'Bat speed, attack angle, and Trackman/Rapsodo data interpretation.',
    category: 'hitting',
    sport: 'both',
  },
  {
    id: 'advanced_pitching_analytics',
    name: 'Advanced Pitching Analytics',
    price: 249.99,
    renewalPrice: 124.99,
    stripeProductId: 'price_advanced_pitching',
    stripeRenewalProductId: 'price_advanced_pitching_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.advanced_pitching_cert,
    description: 'Spin, tilt, release metrics, and pitch design at the elite level.',
    category: 'pitching',
    sport: 'both',
  },
  {
    id: 'elite_velocity',
    name: 'Elite Velocity Development',
    price: 299.99,
    renewalPrice: 149.99,
    stripeProductId: 'price_elite_velocity',
    stripeRenewalProductId: 'price_elite_velocity_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.elite_velocity_cert,
    description: 'Programming velocity gains safely with workload management.',
    category: 'elite',
    sport: 'baseball',
  },
  {
    id: 'elite_prospect',
    name: 'Elite Prospect Development',
    price: 299.99,
    renewalPrice: 149.99,
    stripeProductId: 'price_elite_prospect',
    stripeRenewalProductId: 'price_elite_prospect_renewal',
    appleIAPId: APPLE_IAP_PRODUCTS.elite_prospect_cert,
    description: 'Multi-year college and pro prospect development pipeline.',
    category: 'elite',
    sport: 'both',
  },
];

export interface CertificationBundle {
  id: string;
  name: string;
  price: number;
  savings: number;
  includes: string[];
  stripeProductId: string;
  appleIAPId: string;
  description: string;
  badge?: 'best_value';
}

export const CERTIFICATION_BUNDLES: CertificationBundle[] = [
  {
    id: 'hitting_coach_bundle',
    name: 'Hitting Coach Bundle',
    price: 449.99,
    savings: 129,
    includes: ['foundations_hitting', 'advanced_hitting_analytics', 'strength_baseball'],
    stripeProductId: 'price_bundle_hitting',
    appleIAPId: APPLE_IAP_PRODUCTS.hitting_coach_bundle,
    description: 'Foundations Hitting + Advanced Hitting + S&C Baseball.',
  },
  {
    id: 'pitching_coach_bundle',
    name: 'Pitching Coach Bundle',
    price: 699.99,
    savings: 179,
    includes: ['foundations_pitching', 'advanced_pitching_analytics', 'recovery_arm_care', 'elite_velocity'],
    stripeProductId: 'price_bundle_pitching',
    appleIAPId: APPLE_IAP_PRODUCTS.pitching_coach_bundle,
    description: 'Foundations Pitching + Advanced Pitching + Arm Care + Elite Velocity.',
  },
  {
    id: 'softball_coach_bundle',
    name: 'Softball Coach Bundle',
    price: 499.99,
    savings: 159,
    includes: ['youth_softball', 'softball_pitching', 'strength_softball', 'recruiting_placement'],
    stripeProductId: 'price_bundle_softball',
    appleIAPId: APPLE_IAP_PRODUCTS.softball_coach_bundle,
    description: 'Youth Softball + Softball Pitching + S&C Softball + Recruiting.',
  },
  {
    id: 'complete_baseball_coach',
    name: 'Complete Baseball Coach',
    price: 999.99,
    savings: 457,
    includes: ['all_baseball'],
    stripeProductId: 'price_bundle_baseball_complete',
    appleIAPId: APPLE_IAP_PRODUCTS.complete_baseball_bundle,
    description: 'Every baseball certification in the VAULT OS catalog.',
  },
  {
    id: 'complete_softball_coach',
    name: 'Complete Softball Coach',
    price: 799.99,
    savings: 357,
    includes: ['all_softball'],
    stripeProductId: 'price_bundle_softball_complete',
    appleIAPId: APPLE_IAP_PRODUCTS.complete_softball_bundle,
    description: 'Every softball certification in the VAULT OS catalog.',
  },
  {
    id: 'vault_elite_bundle',
    name: 'VAULT Elite Bundle',
    price: 1499.99,
    savings: 857,
    includes: ['all'],
    stripeProductId: 'price_bundle_elite',
    appleIAPId: APPLE_IAP_PRODUCTS.vault_elite_bundle,
    description: 'Every certification VAULT OS offers — baseball and softball.',
    badge: 'best_value',
  },
];

export const MOST_POPULAR_CERT_IDS = new Set(['foundations_hitting', 'foundations_pitching']);

export const formatPriceUSD = (amount: number): string =>
  `$${amount.toFixed(2)}`;

