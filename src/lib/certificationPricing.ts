// Stripe price IDs for certification purchases
export const CERTIFICATION_PRICES = {
  foundations: null, // Free - included
  performance: 'price_1SkSfyPhXS410TO5oO4XZv3P',
  catcher_specialist: 'price_1SkSg0PhXS410TO5cbeWFnRu',
  infield_specialist: 'price_1SkSg1PhXS410TO5BpfCyUhH',
  outfield_specialist: 'price_1SkSg2PhXS410TO5KaFDaZpo',
} as const;

export const CERTIFICATION_PRODUCT_IDS = {
  performance: 'prod_ThsQA8sfGtmgdp',
  catcher_specialist: 'prod_ThsQ3pzuenDuKI',
  infield_specialist: 'prod_ThsQmvP5ZbTYEM',
  outfield_specialist: 'prod_ThsQi0ZOt2xxPJ',
} as const;

export type CertificationType = 'foundations' | 'performance' | 'catcher_specialist' | 'infield_specialist' | 'outfield_specialist';

export const getCertificationDisplayName = (type: CertificationType): string => {
  const names: Record<CertificationType, string> = {
    foundations: 'VAULT™ Foundations',
    performance: 'VAULT™ Performance',
    catcher_specialist: 'Catcher Specialist',
    infield_specialist: 'Infield Specialist',
    outfield_specialist: 'Outfield Specialist',
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
  };
  return prices[type];
};
