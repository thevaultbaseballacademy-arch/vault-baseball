/**
 * Haptic feedback wrapper. No-op on web; uses Capacitor Haptics on native.
 * Safe to call from anywhere — never throws.
 */

type ImpactStyle = "Light" | "Medium" | "Heavy";

const isNative = (): boolean => {
  return typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.() === true;
};

export const hapticImpact = async (style: ImpactStyle = "Light"): Promise<void> => {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle: CapImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: CapImpactStyle[style] });
  } catch {
    // Plugin not available — silently ignore
  }
};

export const hapticSuccess = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // ignore
  }
};

export const hapticSelection = async (): Promise<void> => {
  if (!isNative()) return;
  try {
    const { Haptics } = await import("@capacitor/haptics");
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  } catch {
    // ignore
  }
};
