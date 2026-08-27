# M2.4 — Tool Plugin Manifests

> Implementation: `packages/kernel/src/tools/tool-manifest.ts`

Each tool plugin declares:

```ts
interface ToolManifest {
  id: string              // ^[A-Za-z][A-Za-z0-9_-]{0,63}$
  version: string         // semver
  description: string
  permissions: string[]   // e.g. ["read"] or ["edit"]
  dependencies: string[]  // other tool ids, e.g. glob → ["read"]
  capabilities: string[]  // e.g. ["fs.read", "search"]
  plugin: string          // entry path, e.g. "./builtins/read.ts"
  compatibility: { kernel: string } // engines range
}
```

Validation at load time: `validate(manifest)` checks id shape, version presence, plugin path. Future: `engines.opencode-kernel` range satisfied.

Built-ins shipped in `BUILT_IN_MANIFESTS` (7 priority tools for M2.6). Priority order matches migration map; dependencies declared (glob→read, grep→read) ensure deterministic load via `DependencyGraph`.

Future tools add one manifest entry — no core edit.

