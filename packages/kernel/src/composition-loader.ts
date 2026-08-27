/**
 * Composition loader — ordered layers: default bundles → profile bundles → .opencode dir → patches.
 * M1: data model + deterministic merge (field-scoped, conflict report). No filesystem I/O yet.
 */
export type Layer = "default" | "profile" | "user" | "overlay"

export interface Row {
  readonly id: string
  readonly layer: Layer
  readonly config: Record<string, unknown>
  readonly provenance: string
}

export interface Conflict {
  readonly id: string
  readonly layers: ReadonlyArray<Layer>
}

export function compose(layers: ReadonlyArray<ReadonlyArray<Row>>): { rows: ReadonlyArray<Row>; conflicts: ReadonlyArray<Conflict> } {
  const byId = new Map<string, Row[]>()
  for (const layer of layers) {
    for (const row of layer) {
      const arr = byId.get(row.id) ?? []
      arr.push(row)
      byId.set(row.id, arr)
    }
  }
  const rows: Row[] = []
  const conflicts: Conflict[] = []
  for (const [id, arr] of byId) {
    if (arr.length > 1) conflicts.push({ id, layers: arr.map((r) => r.layer) })
    // Last layer wins (field-scoped merge would be per-field; whole-row for M1)
    rows.push(arr[arr.length - 1]!)
  }
  // Deterministic order: last-wins already; sort by id for stable output
  rows.sort((a, b) => a.id.localeCompare(b.id))
  return { rows, conflicts }
}

export * as CompositionLoader from "./composition-loader"
