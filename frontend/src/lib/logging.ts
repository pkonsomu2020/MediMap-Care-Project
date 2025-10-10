/**
 * Lightweight logging utility for grouped, scoped console output.
 * Usage in dev only; no-ops in production by default.
 */

export type LogScope =
  | 'places.nearby'
  | 'places.geocode'
  | 'places.details'
  | 'directions.route'
  | (string & {});

export interface LogOptions {
  color?: string;
  collapsed?: boolean;
  enabled?: boolean; // force enable even in production
}

/**
 * logApiResult
 * Groups request/response info under a single collapsible console group with a timestamp.
 */
export function logApiResult(scope: LogScope, payload?: Record<string, unknown>, opts: LogOptions = {}) {
  try {
    const {
      color = '#0ea5e9', // sky-500
      collapsed = true,
      enabled = import.meta.env.MODE !== 'production',
    } = opts;

    if (!enabled || typeof window === 'undefined') return;

    const ts = new Date().toISOString();
    const title = `%c[MediMap] ${scope} @ ${ts}`;
    const style = `color:${color};font-weight:600`;

    if (collapsed && console.groupCollapsed) {
      console.groupCollapsed(title, style);
    } else if (console.group) {
      console.group(title, style);
    }

    if (payload) {
      // Print a summarized view if present
      const { request, response, responseSummary, ...rest } = payload as any;

      if (request) {
        console.debug('request:', request);
      }
      if (responseSummary) {
        console.debug('responseSummary:', responseSummary);
      }
      if (response) {
        console.debug('response:', response);
      }
      const restKeys = Object.keys(rest || {});
      if (restKeys.length) {
        console.debug('meta:', rest);
      }
    }

    console.groupEnd();
  } catch {
    // swallow logging errors
  }
}

/**
 * timeAsync
 * Measures duration of an async operation and logs via logApiResult
 */
export async function timeAsync<T>(
  scope: LogScope,
  fn: () => Promise<T>,
  extras?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const ms = Math.round(performance.now() - start);
    logApiResult(scope, { responseSummary: { ok: true, durationMs: ms }, ...(extras || {}) });
    return result;
  } catch (error: any) {
    const ms = Math.round(performance.now() - start);
    logApiResult(scope, { responseSummary: { ok: false, durationMs: ms, error: error?.message } , ...(extras || {}) }, { color: '#ef4444' });
    throw error;
  }
}