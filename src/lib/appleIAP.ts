// Apple In-App Purchase product IDs and platform helpers.
// IAP wiring is staged for a future native release. For now, native iOS
// purchases fall back to the existing Stripe checkout flow opened inside
// the Capacitor in-app browser via openCheckout.

export const APPLE_IAP_PRODUCTS = {
  starter_monthly: 'com.vaultbaseball.os.starter.monthly',
  performance_monthly: 'com.vaultbaseball.os.performance.monthly',
  elite_monthly: 'com.vaultbaseball.os.elite.monthly',
  remote_training_monthly: 'com.vaultbaseball.os.remote.monthly',
  founders_access: 'com.vaultbaseball.os.founders.lifetime',
  youth_baseball_cert: 'com.vaultbaseball.os.cert.youth.baseball',
  youth_softball_cert: 'com.vaultbaseball.os.cert.youth.softball',
  foundations_hitting_cert: 'com.vaultbaseball.os.cert.hitting',
  foundations_pitching_cert: 'com.vaultbaseball.os.cert.pitching',
  softball_pitching_cert: 'com.vaultbaseball.os.cert.softball.pitching',
  strength_baseball_cert: 'com.vaultbaseball.os.cert.strength.baseball',
  strength_softball_cert: 'com.vaultbaseball.os.cert.strength.softball',
  recovery_arm_care_cert: 'com.vaultbaseball.os.cert.recovery',
  mental_performance_cert: 'com.vaultbaseball.os.cert.mental',
  recruiting_cert: 'com.vaultbaseball.os.cert.recruiting',
  advanced_hitting_cert: 'com.vaultbaseball.os.cert.advanced.hitting',
  advanced_pitching_cert: 'com.vaultbaseball.os.cert.advanced.pitching',
  elite_velocity_cert: 'com.vaultbaseball.os.cert.elite.velocity',
  elite_prospect_cert: 'com.vaultbaseball.os.cert.elite.prospect',
  hitting_coach_bundle: 'com.vaultbaseball.os.bundle.hitting',
  pitching_coach_bundle: 'com.vaultbaseball.os.bundle.pitching',
  softball_coach_bundle: 'com.vaultbaseball.os.bundle.softball',
  complete_baseball_bundle: 'com.vaultbaseball.os.bundle.baseball',
  complete_softball_bundle: 'com.vaultbaseball.os.bundle.softball.complete',
  vault_elite_bundle: 'com.vaultbaseball.os.bundle.elite',
} as const;

export type AppleIAPProductKey = keyof typeof APPLE_IAP_PRODUCTS;

export const isNativeApp = (): boolean => {
  return typeof window !== 'undefined' && (window as any).Capacitor !== undefined;
};

export const isIOS = (): boolean => {
  if (!isNativeApp()) return false;
  try {
    return (window as any).Capacitor?.getPlatform?.() === 'ios';
  } catch {
    return false;
  }
};

export const isAndroid = (): boolean => {
  if (!isNativeApp()) return false;
  try {
    return (window as any).Capacitor?.getPlatform?.() === 'android';
  } catch {
    return false;
  }
};

/**
 * Unified purchase entry point. For now this opens the Stripe-hosted checkout
 * URL inside the Capacitor in-app browser on native, or redirects on web.
 * Replace the body with native StoreKit calls once IAP is wired.
 */
export const handlePurchase = async (
  _productId: string,
  webFallbackUrl: string,
): Promise<void> => {
  if (isNativeApp()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: webFallbackUrl });
    } catch {
      window.location.href = webFallbackUrl;
    }
  } else {
    window.location.href = webFallbackUrl;
  }
};

export const IOS_SUBSCRIPTION_NOTICE =
  'Subscriptions are managed through your Apple ID. Cancel anytime in iPhone Settings > Apple ID > Subscriptions. Annual certification renewals are available on the web at vault-baseball.lovable.app';

export const IOS_RENEWAL_NOTICE =
  'Renew on web at vault-baseball.lovable.app';
