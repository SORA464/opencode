/** K-M3 — Tool-call contract (canonical) */
export interface ToolCall { readonly id: string; readonly name: string; readonly args: unknown }
export function normalize(call: unknown): ToolCall {
  const c = call as Record<string, unknown>
  return { id: String(c["id"] ?? ""), name: String((c["name"] ?? c["tool"] ?? "") as string), args: c["args"] ?? c["arguments"] ?? {} }
}
