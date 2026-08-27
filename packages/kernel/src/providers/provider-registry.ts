/**
 * K-M3 — Provider registry (kernel authoritative)
 */
export interface ProviderEntry {
  readonly id: string
  readonly version: string
  readonly manifests: unknown
  readonly health: "healthy" | "degraded" | "unavailable"
  readonly provenance: string
}

export class ProviderRegistry {
  private readonly map = new Map<string, ProviderEntry>()
  register(entry: ProviderEntry): void {
    if (this.map.has(entry.id)) throw new Error(`Provider ${entry.id} already registered`)
    this.map.set(entry.id, entry)
  }
  get(id: string): ProviderEntry | undefined { return this.map.get(id) }
  list(): ReadonlyArray<ProviderEntry> { return [...this.map.values()] }
  setHealth(id: string, health: ProviderEntry["health"]): void {
    const e = this.map.get(id); if (!e) throw new Error(`Unknown provider ${id}`); this.map.set(id, { ...e, health })
  }
  remove(id: string): void { this.map.delete(id) }
}

export const globalProviderRegistry = new ProviderRegistry()
