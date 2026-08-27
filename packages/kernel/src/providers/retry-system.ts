/** K-M3 — Retry system (bounded, testable) */
export interface RetryPolicy { readonly maxAttempts: number; readonly budgetMs: number; readonly backoffMs: (attempt: number) => number }
export const DEFAULT_RETRY_POLICY: RetryPolicy = { maxAttempts: 3, budgetMs: 24 * 60 * 60 * 1000, backoffMs: (a) => Math.min(1000 * 2 ** a, 30000) }
export function isRetryable(error: unknown): boolean {
  const msg = String((error as Record<string, unknown>)?.["message"] ?? error)
  return /429|503|502|504|timeout|Service Unavailable/i.test(msg)
}
