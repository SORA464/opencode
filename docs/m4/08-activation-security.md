# M4.6 — Activation Policy & Security Floor

## 1. Activation Policy

| Stage | Responsibility |
|---|---|
| **Composition** | What *should* be active (declarative) |
| **Activation** | Whether it *is allowed* to activate (runtime) |

Kernel enforces:
1. Composition → declares what *should* be active
2. SEP (Security Enforcement Point) → decides what *can* activate
3. Loader → activates only permitted plugins

## 2. Security Floor (SEP)

Immutable kernel floor — cannot be overridden by composition:

| Capability | Floor Policy |
|---|---|
| `fs.write.outside-workspace` | Always denied |
| `exec.outside-sandbox` | Always denied |
| `credentials.read` | Deny by default; explicit grant only |
| `net.unrestricted` | Deny; explicit allow per domain |

Implementation: `packages/kernel/src/permission.ts` → `SEP_FLOOR` constant.

## 2. Trust-Aware Activation

| Tier | Auto-activate | Requires |
|---|---|---|
| `builtin` | Yes | — |
| `verified` | Yes (with signature) | Valid signature |
| `community` | No | Explicit user grant |
| `inline` | Never | Manual enable only |

## 2. Activation Decision Tree

```
Composition declares plugin X
    │
    ├─► Dependencies satisfied? ──No──► FAILED (deps)
    │
    ├─► Version compatible? ──No──► FAILED (version)
    │
    ├─► Security floor violated? ──Yes──► BLOCKED (SEP floor)
    │
    ├─► Trust tier = inline? ──Yes──► REQUIRES_USER_GRANT
    │
    ├─► Tier = community? ──Yes──► REQUIRES_USER_GRANT
    │
    ├─► Tier = verified? ──No signature──► FAILED (signature)
    │
    └─► ACTIVATE (register services, events, tools)
```

## 3. Security Floor (SEP)

Immutable kernel floor — cannot be overridden by composition:

| Capability | Floor Policy |
|---|---|
| `fs.write.outside-workspace` | Always denied |
| `exec.outside-sandbox` | Always denied |
| `credentials.read` | Deny by default; explicit grant only |
| `net.unrestricted` | Deny; explicit allow per domain |

Implementation: `packages/kernel/src/permission.ts` → `SEP_FLOOR` constant.

## 3. SEP Implementation

```ts
export const SEP_FLOOR: ReadonlyArray<Capability> = [
  "fs.write.outside-workspace",
  "exec.outside-sandbox",
  "credentials.read",
  "net.unrestricted",
];

function canActivate(plugin: PluginEntry, policy: Policy): boolean {
  for (const cap of plugin.manifest.permissions) {
    if (SEP_FLOOR.includes(cap)) return false;
    if (!isAllowed(policy, plugin.id, cap)) return false;
  }
  return true;
}
```

## 3. Trust Tiers

| Tier | Auto-activate | Requires |
|---|---|---|
| `builtin` | Yes | — |
| `verified` | Yes (with signature) | Valid signature |
| `community` | No | Explicit user grant |
| `inline` | Never | Manual enable only |