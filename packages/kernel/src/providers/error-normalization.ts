/** K-M3 — Error normalization (canonical categories) */
export type ProviderErrorKind = "auth" | "authz" | "model_not_found" | "rate_limited" | "quota" | "invalid_request" | "unsupported" | "unavailable" | "network" | "timeout" | "malformed" | "stream" | "cancelled"
export interface NormalizedError { readonly kind: ProviderErrorKind; readonly message: string; readonly retryable: boolean; readonly cause?: unknown }
export function normalize(error: unknown): NormalizedError {
  const msg = String((error as Record<string, unknown>)?.["message"] ?? error)
  if (/401|auth/i.test(msg)) return { kind: "auth", message: msg, retryable: false, cause: error }
  if (/404|not found/i.test(msg)) return { kind: "model_not_found", message: msg, retryable: false, cause: error }
  if (/429|rate/i.test(msg)) return { kind: "rate_limited", message: msg, retryable: true, cause: error }
  if (/timeout/i.test(msg)) return { kind: "timeout", message: msg, retryable: true, cause: error }
  return { kind: "unavailable", message: msg, retryable: true, cause: error }
}
