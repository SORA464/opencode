# M4.2 — Canonical Composition Schema

> Implementation: `packages/kernel/src/composition/schema.ts` (version `1`)

Schema is versioned, malformed composition fails before activation.

```ts
Composition {
  version: "1"
  profile: string
  plugins: PluginManifest[]
  overrides?: Record<string, unknown>
}
PluginManifest {
  id, version, contributes {services, events, tools, providers, agents},
  dependencies, optionalDependencies, capabilities, permissions,
  trustTier, platformConstraints, environmentConstraints
}
Profile { id, version, plugins: string[], description? }
```

Validation: `validateComposition(input)` via Effect Schema — returns `{ok:true}` or `{ok:false, errors}`. No partially invalid runtime is activated.

Versioning: `CompositionSchemaVersion = "1"`; future versions add fields with migration.

