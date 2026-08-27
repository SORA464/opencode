# M4.6 — Composition Validation & Deterministic Startup

## 1. Validation Checklist (pre-activation)

| Check | Description |
|---|---|
| Schema validity | Conforms to `CompositionV1` schema |
| Plugin existence | All referenced plugins exist in registry |
| Version compatibility | `engines.opencode-kernel` range satisfied |
| Dependency satisfaction | All `inject` deps satisfied (Kahn's) |
| Conflict resolution | No unresolved conflicts |
| Permissions | All required caps granted per trust tier |
| Platform requirements | OS/arch constraints satisfied |
| Capability requirements | Required capabilities available |

## 1. Validation Checklist (pre-activation)

| Check | Description |
|---|---|
| Schema validity | Conforms to `CompositionV1` schema |
| Plugin existence | All referenced plugins exist in registry |
| Version compatibility | `engines.opencode-kernel` range satisfied |
| Dependency satisfaction | All `inject` deps satisfied (Kahn's) |
| Conflict resolution | No unresolved conflicts |
| Permissions | All required caps granted per trust tier |
| Platform requirements | OS/arch constraints satisfied |
| Capability requirements | Required capabilities available |

## 2. Deterministic Startup

- Same composition input → same effective composition
- Dependency order: Kahn's algorithm (stable sort for ties)
- Plugin load order = topological order
- Service registration: deterministic map iteration
- Event registration: deterministic order
- Tool/Provider registration: sorted by id

## 2. Deterministic Startup Guarantees

- Same composition input → same effective composition
- Dependency order: Kahn's algorithm (stable sort for ties)
- Plugin load order = topological order
- Service registration: deterministic map iteration
- Event registration: deterministic order
- Tool/Provider registration: sorted by id

## 3. Boot Sequence

```
1. Parse CLI/config → resolve profile
2. Load composition manifests → Composition object
3. Validate (schema, deps, conflicts, perms)
4. Resolve dependency order (Kahn's)
5. Build LayerNode graph in resolved order
6. Load plugins in topological order
7. Register services/events/tools/providers
8. Emit `kernel/ready` with composition report
9. Start runtime (server/TUI/desktop)
```

## 2. Deterministic Startup Guarantees

- Same composition input → same effective composition
- Dependency order: Kahn's algorithm (stable sort for ties)
- Plugin load order = topological order
- Service registration: deterministic map iteration
- Event registration: deterministic order
- Tool/Provider registration: sorted by id

## 3. Boot Sequence

```
1. Parse CLI/config → resolve profile
2. Load composition manifests → Composition object
4. Resolve dependency order (Kahn's)
5. Build LayerNode graph in resolved order
6. Load plugins in topological order
6. Register services/events/tools/providers
7. Emit `kernel/ready` with composition report
8. Start runtime (server/TUI/desktop)
```

## 2. Deterministic Startup Guarantees

- Same composition input → same effective composition
- Dependency order: Kahn's algorithm (stable sort for ties)
- Plugin load order = topological order
- Service registration: deterministic map iteration
- Event registration: deterministic order
- Tool/Provider registration: sorted by id