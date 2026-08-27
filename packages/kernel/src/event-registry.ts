/**
 * K4 — Event registry (taxonomy + waterfall contract)
 * Durable vs live vs seam/policy domains, with explicit waterfall result.
 */
export type Domain = "durable" | "live" | "seam"

export type Delivery = "broadcast" | "serial" | "parallel" | "waterfall"

export interface EventDef<Name extends string = string> {
  readonly name: Name
  readonly domain: Domain
  readonly delivery: Delivery
  readonly version: number
  readonly description?: string
}

export type WaterfallResult<T> =
  | { readonly kind: "continue" }
  | { readonly kind: "replace"; readonly value: T }
  | { readonly kind: "veto"; readonly reason: string }

/**
 * Registry is append-only and declaration-merged: plugins add variants
 * without editing the owning package (mirrors dsh pattern).
 */
export class Registry {
  private readonly map = new Map<string, EventDef>()

  define<Name extends string>(def: EventDef<Name>): void {
    if (this.map.has(def.name)) throw new Error(`Event already defined: ${def.name}`)
    this.map.set(def.name, def)
  }

  get(name: string): EventDef | undefined {
    return this.map.get(name)
  }

  list(domain?: Domain): ReadonlyArray<EventDef> {
    const all = [...this.map.values()]
    return domain ? all.filter((e) => e.domain === domain) : all
  }
}

export const WELL_KNOWN_DURABLE: ReadonlyArray<EventDef> = [
  { name: "turn/start", domain: "durable", delivery: "broadcast", version: 1 },
  { name: "turn/end", domain: "durable", delivery: "broadcast", version: 1 },
  { name: "step/start", domain: "durable", delivery: "broadcast", version: 1 },
  { name: "step/end", domain: "durable", delivery: "broadcast", version: 1 },
  { name: "user/message", domain: "durable", delivery: "broadcast", version: 1 },
  { name: "assistant/message", domain: "durable", delivery: "broadcast", version: 1 },
  { name: "assistant/chunk", domain: "durable", delivery: "broadcast", version: 1 },
  { name: "tool/call", domain: "durable", delivery: "broadcast", version: 1 },
  { name: "tool/result", domain: "durable", delivery: "broadcast", version: 1 },
] as const

export const WELL_KNOWN_LIVE: ReadonlyArray<EventDef> = [
  { name: "agent/status", domain: "live", delivery: "broadcast", version: 1 },
  { name: "agent/pre-step", domain: "live", delivery: "waterfall", version: 1 },
  { name: "agent/request", domain: "live", delivery: "waterfall", version: 1 },
  { name: "agent/request-error", domain: "live", delivery: "waterfall", version: 1 },
] as const

export const WELL_KNOWN_SEAM: ReadonlyArray<EventDef> = [
  { name: "tools/pre-execute", domain: "seam", delivery: "waterfall", version: 1 },
  { name: "tools/execute", domain: "seam", delivery: "waterfall", version: 1 },
  { name: "tools/post-execute", domain: "seam", delivery: "waterfall", version: 1 },
  { name: "prompt/system", domain: "seam", delivery: "waterfall", version: 1 },
] as const

export function createDefaultRegistry(): Registry {
  const r = new Registry()
  for (const d of [...WELL_KNOWN_DURABLE, ...WELL_KNOWN_LIVE, ...WELL_KNOWN_SEAM]) r.define(d)
  return r
}

export * as EventRegistry from "./event-registry"
