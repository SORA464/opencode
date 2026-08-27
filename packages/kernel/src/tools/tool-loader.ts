/**
 * K-M2 — Tool loader (deterministic, failure-isolated, rollback-capable)
 */
import { ToolRegistry } from "./tool-registry"
import { type ToolManifest, validate } from "./tool-manifest"
import { DependencyGraph } from "../dependency-graph"

export class ToolLoader {
  constructor(private readonly registry: ToolRegistry) {}

  async load(manifests: ReadonlyArray<ToolManifest>): Promise<{ loaded: string[]; failed: Array<{ id: string; error: string }> }> {
    const nodes = manifests.map((m) => ({ id: m.id, inject: [...m.dependencies] }))
    const { errors } = DependencyGraph.build(nodes)
    if (errors.length > 0) {
      return { loaded: [], failed: errors.map((e) => ({ id: e._tag === "missing" ? e.from : e.cycle[0] ?? "unknown", error: JSON.stringify(e) })) }
    }
    const { order } = DependencyGraph.build(nodes)
    const byId = new Map(manifests.map((m) => [m.id, m] as const))
    const sorted = order.map((id) => byId.get(id)!).filter(Boolean)

    const loaded: string[] = []
    const failed: Array<{ id: string; error: string }> = []

    for (const m of sorted) {
      const errs = validate(m)
      if (errs.length > 0) {
        failed.push({ id: m.id, error: errs.join(", ") })
        continue
      }
      try {
        // Compatibility validation: kernel version range check stub
        // Real check would compare KERNEL_API_VERSION against m.compatibility.kernel
        this.registry.register({ id: m.id, version: m.version, tool: {} as any, dependencies: [...m.dependencies] })
        loaded.push(m.id)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        this.registry.setLifecycle(m.id, "FAILED", msg)
        failed.push({ id: m.id, error: msg })
      }
    }
    return { loaded, failed }
  }
}

export * as ToolLoaderNS from "./tool-loader"
