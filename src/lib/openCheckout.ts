export const openCheckout = async (url: string) => {
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url, windowName: '_blank' });
  } else {
    window.location.href = url;
  }
};
