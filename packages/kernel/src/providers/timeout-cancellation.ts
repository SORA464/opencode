/** K-M3 — Timeout & cancellation (every operation terminable) */
export interface TimeoutConfig { readonly connectMs: number; readonly requestMs: number; readonly streamMs: number }
export const DEFAULT_TIMEOUTS: TimeoutConfig = { connectMs: 10000, requestMs: 120000, streamMs: 300000 }
export function withCancellation<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"))
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"))
    signal.addEventListener("abort", onAbort, { once: true })
    promise.then((v) => { signal.removeEventListener("abort", onAbort); resolve(v) }, (e) => { signal.removeEventListener("abort", onAbort); reject(e) })
  })
}
