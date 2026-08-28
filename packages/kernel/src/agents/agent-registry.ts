/**
 * K-M5 — Agent runtime registry (kernel authoritative)
 */
export interface AgentRuntimeEntry { readonly id: string; readonly version: string; readonly capabilities: ReadonlyArray<string>; readonly health: "healthy" | "degraded" | "unavailable" }
export class AgentRuntimeRegistry {
  private readonly map = new Map<string, AgentRuntimeEntry>()
  register(e: AgentRuntimeEntry): void { if (this.map.has(e.id)) throw new Error(`Agent runtime ${e.id} already registered`); this.map.set(e.id, e) }
  get(id: string): AgentRuntimeEntry | undefined { return this.map.get(id) }
  list(): ReadonlyArray<AgentRuntimeEntry> { return [...this.map.values()] }
}
export const globalAgentRegistry = new AgentRuntimeRegistry()
