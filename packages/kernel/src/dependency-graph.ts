/**
 * Dependency graph engine — order-independent activation via `inject` edges.
 * Pure, testable, no Effect dependency.
 */
export type NodeId = string

export interface PluginNode {
  readonly id: NodeId
  readonly inject: ReadonlyArray<string>
  readonly optionalInject?: ReadonlyArray<string>
}

export type GraphError =
  | { readonly _tag: "cycle"; readonly cycle: ReadonlyArray<NodeId> }
  | { readonly _tag: "missing"; readonly from: NodeId; readonly dep: string }

export function build(nodes: ReadonlyArray<PluginNode>): { order: ReadonlyArray<NodeId>; errors: ReadonlyArray<GraphError> } {
  const byId = new Map(nodes.map((n) => [n.id, n] as const))
  const errors: GraphError[] = []

  // Missing required deps
  for (const n of nodes) {
    for (const dep of n.inject) {
      if (!byId.has(dep)) errors.push({ _tag: "missing", from: n.id, dep })
    }
  }
  if (errors.length > 0) return { order: [], errors }

  // Kahn's topological sort
  const inDegree = new Map<NodeId, number>()
  const adj = new Map<NodeId, NodeId[]>()
  for (const n of nodes) {
    inDegree.set(n.id, 0)
    adj.set(n.id, [])
  }
  for (const n of nodes) {
    for (const dep of n.inject) {
      adj.get(dep)!.push(n.id)
      inDegree.set(n.id, (inDegree.get(n.id) ?? 0) + 1)
    }
  }
  const q: NodeId[] = []
  for (const [id, deg] of inDegree) if (deg === 0) q.push(id)
  const order: NodeId[] = []
  while (q.length > 0) {
    const cur = q.shift()!
    order.push(cur)
    for (const nxt of adj.get(cur) ?? []) {
      const nd = (inDegree.get(nxt) ?? 0) - 1
      inDegree.set(nxt, nd)
      if (nd === 0) q.push(nxt)
    }
  }
  if (order.length !== nodes.length) {
    const remaining = nodes.map((n) => n.id).filter((id) => !order.includes(id))
    return { order: [], errors: [{ _tag: "cycle", cycle: remaining }] }
  }
  return { order, errors: [] }
}

export function hasCycle(nodes: ReadonlyArray<PluginNode>): boolean {
  return build(nodes).errors.some((e) => e._tag === "cycle")
}

export * as DependencyGraph from "./dependency-graph"
