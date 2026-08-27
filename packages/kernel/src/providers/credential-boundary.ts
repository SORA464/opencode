/** K-M3 — Credential boundary (separate from provider impl) */
export interface Credential { readonly providerId: string; readonly key: string }
export function redact(key: string): string { return key.slice(0, 4) + "***" }
export function lookup(providerId: string): Credential | undefined {
  const envKey = `${providerId.toUpperCase()}_API_KEY`
  const env = (globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process?.env
  const key = env?.[envKey]
  return key ? { providerId, key } : undefined
}
