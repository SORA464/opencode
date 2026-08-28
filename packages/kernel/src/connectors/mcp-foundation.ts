/**
 * M7 — MCP foundation (protocol boundary)
 * Covers: init, capability negotiation, tools/resources/prompts, structured outputs, progress, cancellation, reconnect, logging, auth, transport security.
 * MCP is the protocol layer; Connector is the product abstraction.
 */
export interface MCPInit { readonly version: string; readonly capabilities: Record<string, unknown> }
export interface MCPTool { readonly name: string; readonly description: string; readonly inputSchema: unknown }
export function negotiate(clientCaps: Record<string, unknown>, serverCaps: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(serverCaps)) if (k in clientCaps) out[k] = serverCaps[k]
  return out
}
