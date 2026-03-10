// Stripe price IDs for all VAULT products
export const PRODUCT_PRICES = {
  // Membership subscriptions
  basic: {
    price_id: 'price_1SjGMKPhXS410TO5XQcZm9fZ',
    product_id: 'prod_TgddaadHxz0mTj',
    name: 'Basic Membership',
    price: 2900, // cents
    type: 'subscription' as const,
  },
  performance: {
    price_id: 'price_1SjGMYPhXS410TO5bGu1kSSZ',
    product_id: 'prod_TgddQA4gp7kWZy',
    name: 'Performance Membership',
    price: 5900,
    type: 'subscription' as const,
  },
  remote_training: {
    price_id: 'price_1T8ckaPhXS410TO57tcuh1nv',
    product_id: 'prod_U6qRK6r5KI4995',
    name: 'Remote Training Membership',
    price: 19900,
    type: 'subscription' as const,
  },
  elite: {
    price_id: 'price_1SjGMhPhXS410TO59WKiE81b',
    product_id: 'prod_Tgdd8gSJpkk33e',
    name: 'Elite Membership',
    price: 14900,
    type: 'subscription' as const,
  },
  
  // Full Release Systems (one-time)
  longevity_system: {
    price_id: 'price_1SqEGAPhXS410TO5ZIx2g0RZ',
    product_id: 'prod_TnpwnzycjMTqXu',
    name: 'VAULT™ Longevity System',
    price: 29900,
    type: 'payment' as const,
  },
  transfer_system: {
    price_id: 'price_1SqEGCPhXS410TO5iCsokNpV',
    product_id: 'prod_Tnpwn4vDbQNQGz',
    name: 'VAULT™ Transfer System',
    price: 29900,
    type: 'payment' as const,
  },
  
  // Team/Org Licenses
  small_org_license: {
    price_id: 'price_1SqEGEPhXS410TO5DeHOuqVH',
    product_id: 'prod_TnpwCoKTVxah5V',
    name: 'Small Organization Team License',
    price: 199900,
    type: 'subscription' as const,
    interval: 'year',
  },
  org_quick_start: {
    price_id: 'price_1SqEGIPhXS410TO5JUNSsTCq',
    product_id: 'prod_TnpwMn4AWpnMPK',
    name: 'Vault Org Quick-Start License',
    price: 350000,
    type: 'subscription' as const,
    interval: 'year',
  },
  
  // Stand-alone Products (one-time)
  velocity_12week: {
    price_id: 'price_1T8ckYPhXS410TO5WkQI2EpC',
    product_id: 'prod_U6qR2KHT4Ahl76',
    name: 'Vault Velocity System',
    price: 39700,
    type: 'payment' as const,
  },
  velocity_accelerator: {
    price_id: 'price_1SqEW4PhXS410TO51a1fzsw1',
    product_id: 'prod_TnqCIDACx6f7eJ',
    name: 'Vault Velocity Accelerator (6-Week Sprint)',
    price: 59900,
    type: 'payment' as const,
  },
  velo_check: {
    price_id: 'price_1T8ckXPhXS410TO5tYyygmol',
    product_id: 'prod_U6qRFtddsuGgum',
    name: 'Velo-Check Assessment',
    price: 9700,
    type: 'payment' as const,
  },
  recruitment_audit: {
    price_id: 'price_1SqEGMPhXS410TO5PNwPNJOe',
    product_id: 'prod_TnpwJeeXHyjrva',
    name: 'Vault Recruitment Audit',
    price: 19900,
    type: 'payment' as const,
  },
  
  // Coach Program (annual subscription)
  certified_coach: {
    price_id: 'price_1SqEGOPhXS410TO5XtSbPx0v',
    product_id: 'prod_Tnpw5TKR8rgEYy',
    name: 'VAULT™ Certified Coach Program',
    price: 50000,
    type: 'subscription' as const,
    interval: 'year',
  },
  
  // Bundles (one-time)
  velocity_max_pack: {
    price_id: 'price_1SqEW6PhXS410TO5GbLVm4te',
    product_id: 'prod_TnqCxLCRCWYhFZ',
    name: 'Velocity Max Pack Bundle',
    price: 69900,
    type: 'payment' as const,
    savings: 17700, // Save $177
  },
  recruiting_edge_pack: {
    price_id: 'price_1SqEW8PhXS410TO5A7WuQgc6',
    product_id: 'prod_TnqCuR9VoYtVC0',
    name: 'Recruiting Edge Pack Bundle',
    price: 49900,
    type: 'payment' as const,
    savings: 14800, // Save $148
  },
  coach_authority_pack: {
    price_id: 'price_1SqEW9PhXS410TO5detPNFap',
    product_id: 'prod_TnqC7Dgm9yEE3G',
    name: 'Coach Authority Pack Bundle',
    price: 75000,
    type: 'payment' as const,
    savings: 16400, // Save $164
  },
  
  // New Revenue Products
  transfer_intensive: {
    price_id: 'price_1SqMSsPhXS410TO5HQjuGUIn',
    product_id: 'prod_TnyPcUaSwW9LEC',
    name: 'Transfer Intensive (4-Week Live Coaching)',
    price: 29900,
    type: 'payment' as const,
  },
  vault_verified_coach: {
    price_id: 'price_1SqMSuPhXS410TO5ymOiyyUa',
    product_id: 'prod_TnyPm39VCsKdTa',
    name: 'VAULT Verified Coach Certification',
    price: 49900,
    type: 'payment' as const,
  },
  showcase_prep: {
    price_id: 'price_1SqMSxPhXS410TO5rYo4echT',
    product_id: 'prod_TnyPDYJ35srlRl',
    name: 'Draft/Showcase Prep Bundle (30-Day)',
    price: 19900,
    type: 'payment' as const,
  },
  video_analysis_5pack: {
    price_id: 'price_1SqMSzPhXS410TO5VpvnedaW',
    product_id: 'prod_TnyPgLXxZlLWli',
    name: 'Video Analysis 5-Pack',
    price: 14900,
    type: 'payment' as const,
  },
  
  // High-Ticket & Limited Offers
  org_starter_pack: {
    price_id: 'price_1SqNiiPhXS410TO51M25fyJR',
    product_id: 'prod_TnziXW8OZJVCKY',
    name: 'Org Starter Pack',
    price: 250000,
    type: 'payment' as const,
  },
  performance_blueprint: {
    price_id: 'price_1StVz1PhXS410TO5hktrpoe1',
    product_id: 'prod_TrER8mB9wvHWZy',
    name: 'VAULT™ Performance Blueprint',
    price: 4700,
    type: 'payment' as const,
  },
  founders_access: {
    price_id: 'price_1SqNikPhXS410TO5rLuqRrBn',
    product_id: 'prod_TnziXPd0kWbybf',
    name: "Founder's Access - Lifetime V.A.U.L.T. Suite",
    price: 49900,
    type: 'payment' as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCT_PRICES;

export const formatPrice = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
};

export const getProductByKey = (key: ProductKey) => PRODUCT_PRICES[key];
