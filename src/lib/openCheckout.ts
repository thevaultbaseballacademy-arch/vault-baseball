// Cross-platform Stripe checkout opener.
// - Capacitor (iOS/Android) → native in-app browser
// - Web → top-level navigation (escapes preview iframes)
// - Pre-opened popup tab supported as best-effort enhancement only
type PreparedCheckoutTarget = Window | null;

export const prepareCheckoutTarget = (): PreparedCheckoutTarget => {
  if (typeof window === 'undefined' || (window as any).Capacitor) return null;
  try {
    const w = window.open('about:blank', '_blank');
    // If the browser silently returned a same-origin "popup" we can't drive,
    // close it so we fall back cleanly to top-level navigation.
    if (!w) return null;
    return w;
  } catch {
    return null;
  }
};

export const closePreparedCheckoutTarget = (target: PreparedCheckoutTarget) => {
  if (!target || target.closed) return;
  try { target.close(); } catch { /* no-op */ }
};

const navigateTopLevel = (url: string) => {
  if (typeof window === 'undefined') return;
  // If we're inside an iframe (e.g. Lovable preview), break out so the user
  // actually lands on Stripe instead of trying to render Stripe inside the iframe.
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return;
    }
  } catch {
    // Cross-origin parent — fall through and try same-frame nav, then anchor click.
  }
  try {
    window.location.assign(url);
    return;
  } catch {
    // last resort
  }
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_top';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.location.href = url;
  }
};

export const openCheckout = async (url: string, target?: PreparedCheckoutTarget) => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, windowName: '_blank' });
      return;
    } catch {
      navigateTopLevel(url);
      return;
    }
  }

  if (target && !target.closed) {
    try {
      target.location.href = url;
      // Belt-and-suspenders: also navigate the originating tab so the user
      // isn't stranded on the form if their browser blocks the popup nav.
      setTimeout(() => navigateTopLevel(url), 600);
      return;
    } catch {
      // fall through
    }
  }

  navigateTopLevel(url);
};
