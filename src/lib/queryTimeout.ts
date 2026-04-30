/**
 * Race a promise against a timeout. On timeout, returns the provided fallback
 * (or throws if none given). Used to keep auth/role/trial queries from hanging
 * the UI indefinitely when Supabase is slow.
 */
export const withTimeout = async <T,>(
  task: () => Promise<T>,
  ms: number,
  label: string,
  fallback?: T,
): Promise<T> => {
  let timeoutId: number | undefined;
  try {
    return await Promise.race([
      task(),
      new Promise<T>((resolve, reject) => {
        timeoutId = window.setTimeout(() => {
          if (fallback !== undefined) {
            console.warn(`[timeout] ${label} exceeded ${ms}ms — using fallback`);
            resolve(fallback);
          } else {
            reject(new Error(`${label} timed out after ${ms}ms`));
          }
        }, ms);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};
