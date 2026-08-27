/**
 * K3 — Service registry
 * Typed, versioned service slots. In M1 this wraps Context.Tag identity
 * with a kernel-owned registry; it does NOT replace Effect's Context — it
 * provides the stable string-key contract that plugins declare `inject` against.
 */
export type ServiceKey<Name extends string = string> = Name & { readonly _brand: "ServiceKey" }

export function key<Name extends string>(name: Name): ServiceKey<Name> {
  return name as ServiceKey<Name>
}

export interface Entry<Name extends string, Shape> {
  readonly key: ServiceKey<Name>
  readonly tag?: unknown
  readonly version: string
  readonly provider?: string
}

export class Registry {
  private readonly map = new Map<string, Entry<string, unknown>>()

  register<Name extends string, Shape>(entry: Entry<Name, Shape>): void {
    const existing = this.map.get(entry.key)
    if (existing && existing.provider !== entry.provider) {
      throw new Error(`Service slot ${entry.key} already provided by ${existing.provider} (conflict with ${entry.provider})`)
    }
    this.map.set(entry.key as string, entry as Entry<string, unknown>)
  }

  get<Name extends string>(k: ServiceKey<Name>): Entry<Name, unknown> | undefined {
    return this.map.get(k as string) as Entry<Name, unknown> | undefined
  }

  has<Name extends string>(k: ServiceKey<Name>): boolean {
    return this.map.has(k as string)
  }

  list(): ReadonlyArray<Entry<string, unknown>> {
    return [...this.map.values()]
  }

  require<Name extends string>(k: ServiceKey<Name>): Entry<Name, unknown> {
    const e = this.get(k)
    if (!e) throw new Error(`Missing required service: ${k}`)
    return e
  }
}

// Stable well-known keys (mirrors future ctx.<key> surface)
export const WELL_KNOWN = {
  tools: key("tools"),
  llm: key("llm.adapter"),
  fs: key("fs"),
  pty: key("pty"),
  sandbox: key("sandbox"),
  jobs: key("jobs"),
  commands: key("commands"),
} as const

export * as ServiceRegistry from "./service-registry"
