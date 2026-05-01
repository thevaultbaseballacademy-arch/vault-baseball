import { lazy, type ComponentType } from "react";

/**
 * lazy() with automatic recovery from stale chunk errors after redeploys.
 *
 * When a new build is deployed, hashed chunk filenames change. Browsers running
 * the previous build will throw "Importing a module script failed" /
 * "Failed to fetch dynamically imported module" when they try to load a chunk
 * that no longer exists. We retry once after a short delay, and if that fails
 * we force a one-time hard reload to pick up the new index.html + asset hashes.
 */
const RELOAD_FLAG = "__lovable_chunk_reloaded__";

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await factory();
      // Successful load — clear any prior reload flag
      try { window.sessionStorage.removeItem(RELOAD_FLAG); } catch { /* ignore */ }
      return mod;
    } catch (err: any) {
      const message = String(err?.message || "");
      const isChunkError =
        message.includes("Importing a module script failed") ||
        message.includes("Failed to fetch dynamically imported module") ||
        message.includes("error loading dynamically imported module") ||
        message.includes("Unable to preload CSS");

      if (!isChunkError) throw err;

      // Retry once after a brief delay (handles transient network blips)
      try {
        await new Promise((r) => setTimeout(r, 400));
        const mod = await factory();
        try { window.sessionStorage.removeItem(RELOAD_FLAG); } catch { /* ignore */ }
        return mod;
      } catch (retryErr) {
        // Hard reload once to pick up new asset hashes after a redeploy.
        // Guard with sessionStorage so we never enter a reload loop.
        try {
          const alreadyReloaded = window.sessionStorage.getItem(RELOAD_FLAG);
          if (!alreadyReloaded) {
            window.sessionStorage.setItem(RELOAD_FLAG, "1");
            window.location.reload();
            // Return a never-resolving promise so React doesn't render an error
            // before the reload kicks in.
            return new Promise<never>(() => {});
          }
        } catch { /* ignore storage errors */ }
        throw retryErr;
      }
    }
  });
}
