export const openCheckout = async (url: string) => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, windowName: '_blank' });
    } catch {
      window.location.href = url;
    }
  } else {
    window.location.href = url;
  }
};
