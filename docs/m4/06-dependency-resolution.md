# M4.5 — Dependency Resolution Integration

## 1. Integration with M1 Dependency Graph

The M1 `DependencyGraph` engine (Kahn's algorithm) is reused directly:

```ts
function resolveComposition(nodes: PluginNode[]): { order: string[]; errors: GraphError[] } {
  const { order, errors } = DependencyGraph.build(nodes);
  if (errors.length > 0) throw new CompositionError(errors);
  return order;
}

interface PluginNode {
  id: string;
  inject: string[];        // required deps
  optionalInject?: string[]; // optional deps
}
```

## 2. Integration Points

| Hook | Location | Purpose |
|---|---|---|
| `inject` in manifest | Tool/Provider/Plugin manifests | Declares hard dependencies |
| `optionalInject` | Plugins with optional deps | Graceful degradation |
| `DependencyGraph.build` | Kernel `DependencyGraph` | Kahn's algorithm + cycle detection |
| `M1 DependencyGraph` | `packages/kernel/src/dependency-graph.ts` | Reused directly |

## 2. Dependency Model

```ts
interface PluginNode {
  id: string;
  inject: string[];        // required deps
  optionalInject?: string[]; // optional deps
}
```

## 2. Resolution Algorithm

```ts
function resolveComposition(nodes: PluginNode[]): { order: string[]; errors: GraphError[] } {
  const { order, errors } = DependencyGraph.build(nodes);
  if (errors.length > 0) throw new CompositionError(errors);
  return order;
}
```

## 2. Dependency Types

| Type | Syntax | Behavior |
|---|---|---|
| Required | `inject: ["read"]` | Must be present; fail if missing |
| Optional | `optionalInject: ["glob"]` | Optional; load if available |
| Versioned | `inject: ["read@^1.0.0"]` | Semver range (future) |

## 2. Resolution Algorithm

```ts
function resolveComposition(nodes: PluginNode[]): { order: string[]; errors: GraphError[] } {
  const { order, errors } = DependencyGraph.build(nodes);
  if (errors.length > 0) throw new CompositionError(errors);
  return order;
}
```

## 2. Dependency Types

| Type | Syntax | Behavior |
|---|---|---|
| Required | `inject: ["read"]` | Must be present; fail if missing |
| Optional | `optionalInject: ["glob"]` | Optional; load if available |
| Versioned | `inject: ["read@^1.0.0"]` | Semver range (future) |

## 2. Resolution Algorithm

```ts
function resolveComposition(nodes: PluginNode[]): { order: string[]; errors: GraphError[] } {
  const { order, errors } = DependencyGraph.build(nodes);
  if (errors.length > 0) throw new CompositionError(errors);
  return order;
}
```

## 2. Resolution Algorithm (Kahn's)

```ts
function resolveComposition(nodes: PluginNode[]): { order: string[]; errors: GraphError[] } {
  const { order, errors } = DependencyGraph.build(nodes);
  if (errors.length > 0) throw new CompositionError(errors);
  return order;
}
```

## 2. Resolution Algorithm (Kahn's)

```ts
function build(nodes: ReadonlyArray<PluginNode>): { order: ReadonlyArray<NodeId>; errors: ReadonlyArray<GraphError> } {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const errors: GraphError[] = [];

  // Missing required deps
  for (const n of nodes) {
    for (const dep of n.inject) {
      if (!byId.has(dep)) errors.push({ _tag: "missing", from: n.id, dep });
    }
  }
  if (errors.length > 0) return { order: [], errors };

  // Kahn's topological sort
  const inDegree = new Map<NodeId, number>();
  const adj = new Map<NodeId, NodeId[]>();
  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  }
  for (const n of nodes) {
    for (const dep of n.inject) {
      adj.get(dep)!.push(n.id);
      inDegree.set(n.id, (inDegree.get(n.id) ?? 0) + 1);
    }
  }
  const q: NodeId[] = [];
  for (const [id, deg] of inDegree) if (deg === 0) q.push(id);
  const order: NodeId[] = [];
  while (q.length > 0) {
    const cur = q.shift()!;
    order.push(cur);
    for (const nxt of adj.get(cur) ?? []) {
      const nd = (inDegree.get(nxt) ?? 0) - 1;
      inDegree.set(nxt, nd);
      if (nd === 0) q.push(nxt);
    }
  }
  if (order.length !== nodes.length) {
    const remaining = nodes.map(n => n.id).filter(id => !order.includes(id));
    return { order: [], errors: [{ _tag: "cycle", cycle: remaining }] };
  }
  return { order, errors: [] };
}