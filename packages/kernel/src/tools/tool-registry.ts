/**
 * K-M2 — Tool registry (kernel authoritative)
 * Wraps the existing ApplicationTools ⊕ Location overlay algebra
 * under kernel lifecycle, with discovery, validation, dependency checks,
 * lifecycle tracking, and version awareness.
 */
import { Registry as ServiceRegistry } from "../service-registry"
import { DependencyGraph } from "../dependency-graph"

export type ToolEntry = {
  readonly id: string
  readonly version: string
  readonly tool: unknown
  readonly dependencies: ReadonlyArray<string>
  readonly lifecycle: "PENDING" | "ACTIVE" | "FAILED" | "DISPOSED"
  readonly error?: string
}

export class ToolRegistry {
  private readonly map = new Map<string, ToolEntry>()
  private readonly serviceRegistry = new ServiceRegistry()

  register(entry: Omit<ToolEntry, "lifecycle">): ToolEntry {
    const errors = this.validate(entry)
    if (errors.length > 0) throw new Error(`Tool ${entry.id} validation failed: ${errors.join(", ")}`)
    const full: ToolEntry = { ...entry, lifecycle: "ACTIVE" }
    this.map.set(entry.id, full)
    return full
  }

  validate(entry: Omit<ToolEntry, "lifecycle">): string[] {
    const errs: string[] = []
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(entry.id)) errs.push(`invalid id ${entry.id}`)
    if (!entry.version) errs.push("version required")
    // dependency check via graph
    const nodes = [...this.map.values(), entry as ToolEntry].map((e) => ({ id: e.id, inject: [...e.dependencies] }))
    const { errors } = DependencyGraph.build(nodes)
    if (errors.length > 0) errs.push(...errors.map((e) => e._tag === "cycle" ? `cycle ${e.cycle.join("->")}` : `missing ${e.dep} for ${e.from}`))
    return errs
  }

  get(id: string): ToolEntry | undefined {
    return this.map.get(id)
  }

  list(): ReadonlyArray<ToolEntry> {
    return [...this.map.values()]
  }

  setLifecycle(id: string, lifecycle: ToolEntry["lifecycle"], error?: string): void {
    const e = this.map.get(id)
    if (!e) throw new Error(`Unknown tool ${id}`)
    this.map.set(id, { ...e, lifecycle, error })
  }

  /**
   * Discovery: enumerate all registered tool ids (authoritative source).
   */
  discovery(): ReadonlyArray<string> {
    return [...this.map.keys()]
  }
}

export const globalRegistry = new ToolRegistry()

export * as ToolRegistryNS from "./tool-registry"
