/**
 * M7 — Connector registry (first-class plugin category)
 * Separates: Connector Definition / User Connection / External Account / Credential / Runtime Capability
 */
export interface ConnectorDefinition {
  readonly id: string
  readonly version: string
  readonly displayName: string
  readonly category: string
  readonly capabilities: ReadonlyArray<string>
  readonly auth: "none" | "oauth" | "apiKey"
  readonly trustTier: string
}

export interface UserConnection {
  readonly id: string
  readonly connectorId: string
  readonly userId: string
  readonly accountId: string
  readonly status: "connected" | "disconnected" | "expired"
}

export class ConnectorRegistry {
  private readonly defs = new Map<string, ConnectorDefinition>()
  private readonly conns = new Map<string, UserConnection>()
  register(def: ConnectorDefinition): void {
    if (this.defs.has(def.id)) throw new Error(`Connector ${def.id} already registered`)
    this.defs.set(def.id, def)
  }
  getDefinition(id: string): ConnectorDefinition | undefined { return this.defs.get(id) }
  listDefinitions(): ReadonlyArray<ConnectorDefinition> { return [...this.defs.values()] }
  addConnection(c: UserConnection): void { this.conns.set(c.id, c) }
  getConnection(id: string): UserConnection | undefined { return this.conns.get(id) }
  listConnections(userId: string): ReadonlyArray<UserConnection> { return [...this.conns.values()].filter((c) => c.userId === userId) }
}

export const globalConnectorRegistry = new ConnectorRegistry()
