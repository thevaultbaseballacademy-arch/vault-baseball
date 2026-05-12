type PreparedCheckoutTarget = Window | null;

export const prepareCheckoutTarget = (): PreparedCheckoutTarget => {
  if (typeof window === 'undefined' || (window as any).Capacitor) return null;
  try {
    return window.open('about:blank', '_blank');
  } catch {
    return null;
  }
};

export const closePreparedCheckoutTarget = (target: PreparedCheckoutTarget) => {
  if (!target || target.closed) return;
  try {
    target.close();
  } catch {
    // no-op
  }
};

export const openCheckout = async (url: string, target?: PreparedCheckoutTarget) => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, windowName: '_blank' });
      return;
    } catch {
      window.location.href = url;
      return;
    }
  }

  if (target && !target.closed) {
    try {
      target.location.href = url;
      return;
    } catch {
      // fall through
    }
  }

  window.location.href = url;
};
