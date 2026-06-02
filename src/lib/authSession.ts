let globalReconnecting = false;
const reconnectingListeners = new Set<(v: boolean) => void>();

export const setGlobalReconnecting = (v: boolean) => {
  globalReconnecting = v;
  reconnectingListeners.forEach((cb) => cb(v));
};

export const isGloballyReconnecting = () => globalReconnecting;

export const subscribeToGlobalReconnecting = (cb: (v: boolean) => void) => {
  reconnectingListeners.add(cb);
  return () => reconnectingListeners.delete(cb);
};

export const hasStoredSessionToken = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const value = localStorage.getItem(key);
        if (value && value.length > 10) return true;
      }
    }
  } catch {
    // ignore storage access issues
  }

  return false;
};