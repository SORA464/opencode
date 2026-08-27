/**
 * K-M3 — Model registry (kernel authoritative, deterministic)
 */
export interface ModelEntry {
  readonly id: string
  readonly providerId: string
  readonly metadata: Record<string, unknown>
  readonly capabilities: Record<string, unknown>
  readonly aliases?: ReadonlyArray<string>
  readonly deprecated?: boolean
}

export class ModelRegistry {
  private readonly map = new Map<string, ModelEntry>()
  register(entry: ModelEntry): void {
    if (this.map.has(entry.id)) throw new Error(`Model ${entry.id} already registered`)
    this.map.set(entry.id, entry)
    for (const alias of entry.aliases ?? []) this.map.set(alias, { ...entry, id: alias })
  }
  get(id: string): ModelEntry | undefined { return this.map.get(id) }
  list(): ReadonlyArray<ModelEntry> { return [...new Set(this.map.values())] }
  resolve(id: string): ModelEntry {
    const e = this.map.get(id); if (!e) throw new Error(`Model not found: ${id}`); if (e.deprecated) throw new Error(`Model deprecated: ${id}`); return e
  }
}

export const globalModelRegistry = new ModelRegistry()
