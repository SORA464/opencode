/**
 * M4 — Composition validator (schema + dependency + security invariants)
 */
import { validateComposition } from "./schema"
import { DependencyGraph } from "../dependency-graph"

export function validate(input: unknown): { ok: true } | { ok: false; errors: string[] } {
  const v = validateComposition(input)
  if (!v.ok) return v
  const comp = v.value
  const nodes = comp.plugins.map((p) => ({ id: p.id, inject: [...(p.dependencies ?? [])] }))
  const { errors } = DependencyGraph.build(nodes)
  if (errors.length > 0) return { ok: false, errors: errors.map((e) => JSON.stringify(e)) }
  return { ok: true }
}
