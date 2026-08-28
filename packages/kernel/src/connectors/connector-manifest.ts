/**
 * M7 — Connector manifest
 */
export interface ConnectorManifest {
  readonly id: string
  readonly version: string
  readonly displayName: string
  readonly category: string
  readonly capabilities: ReadonlyArray<string>
  readonly auth: "none" | "oauth" | "apiKey"
  readonly mcp?: { transport: "stdio" | "sse" | "websocket"; command?: string[] }
  readonly permissions: ReadonlyArray<string>
}

export function validate(m: ConnectorManifest): string[] {
  const e: string[] = []
  if (!m.id) e.push("id required")
  if (!m.category) e.push("category required")
  return e
}
