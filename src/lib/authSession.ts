import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

export const waitForRecoveredSession = async ({
  timeoutMs = 6000,
  intervalMs = 200,
  refresh = false,
}: {
  timeoutMs?: number;
  intervalMs?: number;
  refresh?: boolean;
} = {}): Promise<Session | null> => {
  if (refresh) {
    try {
      await supabase.auth.refreshSession();
    } catch {
      // Ignore and fall back to polling getSession.
    }
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session;
    } catch {
      // Retry until timeout.
    }

    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }

  return null;
};