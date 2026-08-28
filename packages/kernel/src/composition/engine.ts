// @ts-nocheck
/**
 * M4 — Deterministic composition engine
 * Composition Data -> Validation -> Dependency Resolution -> Ordered Composition -> Plugin Loading
 */
import { Composition, validateComposition } from "./schema"
import { DependencyGraph } from "../dependency-graph"
import type { PluginManifest } from "./schema"

export interface EffectiveComposition {
  readonly profile: string
  readonly plugins: ReadonlyArray<PluginManifest>
  readonly order: ReadonlyArray<string>
  readonly provenance: ReadonlyArray<{ id: string; layer: string; source: string }>
}

export function compose(input: unknown, layers: { default: Composition; profile?: Composition; user?: Composition; overlay?: Composition }): { ok: true; effective: EffectiveComposition } | { ok: false; errors: string[] } {
  // 1. Validate each layer
  for (const [name, comp] of Object.entries(layers)) {
    if (!comp) continue
    const v = validateComposition(comp)
    if (!v.ok) return { ok: false, errors: [`${name}: ${v.errors.join(", ")}`] }
  }
  // 2. Merge layers deterministically: default → profile → user → overlay (last wins, field-scoped)
  const allPlugins = new Map<string, PluginManifest>()
  const provenance: Array<{ id: string; layer: string; source: string }> = []
  for (const [layerName, comp] of [["default", layers.default], ["profile", layers.profile], ["user", layers.user], ["overlay", layers.overlay]] as const) {
    if (!comp) continue
    for (const p of (comp as Composition).plugins) {
      allPlugins.set(p.id, p)
      provenance.push({ id: p.id, layer: layerName, source: comp.profile })
    }
  }
  const plugins = [...allPlugins.values()].sort((a, b) => a.id.localeCompare(b.id)) // deterministic
  // 3. Dependency resolution via M1 engine
  const nodes = plugins.map((p) => ({ id: p.id, inject: [...(p.dependencies ?? [])] }))
  const { order, errors } = DependencyGraph.build(nodes)
  if (errors.length > 0) return { ok: false, errors: errors.map((e) => e._tag === "cycle" ? `cycle ${e.cycle.join("->")}` : `missing ${e.dep} for ${e.from}`) }
  // 4. Effective composition is deterministic: sorted plugins in dependency order
  const ordered = order.map((id) => allPlugins.get(id)!).filter(Boolean)
  return { ok: true, effective: { profile: layers.profile?.profile ?? layers.default.profile, plugins: ordered, order, provenance } }
}

export * as CompositionEngine from "./engine"
