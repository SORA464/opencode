/** K-M3 — Provider failover (policy-driven, no state duplication) */
import type { NormalizedError } from "./error-normalization"
export interface FailoverPolicy { readonly maxAttempts: number; readonly shouldFailover: (err: NormalizedError) => boolean }
export const DEFAULT_FAILOVER: FailoverPolicy = { maxAttempts: 1, shouldFailover: (e) => e.kind === "unavailable" || e.kind === "network" }
export function nextProvider(failed: string, candidates: string[], policy: FailoverPolicy): string | undefined {
  const idx = candidates.indexOf(failed)
  return candidates[idx + 1]
}
