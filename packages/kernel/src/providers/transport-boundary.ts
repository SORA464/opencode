/** K-M3 — Transport boundary (shared HTTP/streaming infra) */
export interface TransportRequest { readonly url: string; readonly headers: Record<string,string>; readonly body?: unknown }
export interface TransportResponse { readonly status: number; readonly headers: Record<string,string>; readonly body: unknown }
export async function fetchWithRetry(req: TransportRequest, opts: { retries?: number; timeout?: number } = {}): Promise<TransportResponse> {
  const controller = opts.timeout ? new AbortController() : undefined
  const timer = opts.timeout ? setTimeout(() => controller!.abort(), opts.timeout) : undefined
  try {
    const res = await (globalThis as unknown as { fetch: typeof fetch }).fetch(req.url, { headers: req.headers, body: req.body as BodyInit, signal: controller?.signal })
    const headers: Record<string,string> = {}
    ;(res.headers as unknown as { forEach: (cb: (v: string, k: string) => void) => void }).forEach((v, k) => { headers[k] = v })
    return { status: res.status, headers, body: await res.text() }
  } finally {
    if (timer) clearTimeout(timer as unknown as number)
  }
}
