# M4.31 — M4 Success State

At completion the architecture should conceptually be:

```
Composition Data
  → Composition Validator
  → Dependency Resolver
  → Deterministic Composer
  → Plugin Loader
  → Service Registry
  → Event Registry
  → Runtime
```

The runtime must be capable of changing major capability combinations by changing composition data rather than rewriting application code.

## 1. Success State Architecture

```
Composition Data
  → Composition Validator
  → Dependency Resolver
  → Deterministic Composer
  → Plugin Loader
  → Service Registry
  → Event Registry
  → Runtime
```

The runtime must be capable of changing major capability combinations by changing composition data rather than rewriting application code.

## 2. M4 Success Criteria

| Criterion | Evidence |
|---|---|
| Runtime composition is data-driven | Composition manifests drive all capability selection |
| Composition is deterministic | Same input → same effective composition (proven) |
| Profiles are first-class | Profile manifest → effective composition |
| Plugins enable/disable declaratively | `enabled: true/false` in manifest |
| Tools selectable declaratively | `tools.enabled` list in profile |
| Providers/models selectable declaratively | `providers.enabled`, `models.default` |
| Dependencies resolve deterministically | Kahn's algorithm; same input → same order |
| Conflicts detected | Duplicate IDs, version mismatches, service conflicts |
| Permissions enforced | SEP floor + trust tiers enforced at activation |
| Persistence inspectable | Provenance API + composition diff |
| Changes reversible | Atomic activation + rollback framework |
| Legacy compatibility | V1/V2 paths frozen; compat layer maintained |
| Security preserved | SEP floor immutable; trust tiers enforced |
| Performance acceptable | <10ms startup overhead; O(1) lookups |
| Large compositions practical | 1000 plugins < 3s startup |

## 2. Success Criteria

| Criterion | Evidence |
|---|---|
| Runtime composition is data-driven | Composition manifests drive all capability selection |
| Composition is deterministic | Same input → same effective composition (proven) |
| Profiles are first-class | Profile manifest → effective composition |
| Plugins enable/disable declaratively | `enabled: true/false` in manifest |
| Tools selectable declaratively | `tools.enabled` list in profile |
| Providers/models selectable declaratively | `providers.enabled`, `models.default` |
| Dependencies resolve deterministically | Kahn's algorithm; same input → same order |
| Conflicts detected | Duplicate IDs, version mismatches, service conflicts |
| Permissions enforced | SEP floor + trust tiers enforced at activation |
| Persistence inspectable | Provenance API + composition diff |
| Changes reversible | Atomic activation + rollback framework |
| Legacy compatibility | V1/V2 paths frozen; compat layer maintained |
| Security preserved | SEP floor immutable; trust tiers enforced |
| Performance acceptable | <10ms startup overhead; O(1) lookups |
| Large compositions practical | 1000 plugins < 3s startup |

## 2. M4 Success Criteria

| Criterion | Evidence |
|---|---|
| Runtime composition is data-driven | Composition manifests drive all capability selection |
| Composition is deterministic | Same input → same effective composition (proven) |
| Profiles are first-class | Profile manifest → effective composition |
| Plugins enable/disable declaratively | `enabled: true/false` in manifest |
| Tools selectable declaratively | `tools.enabled` list in profile |
| Providers/models selectable declaratively | `providers.enabled`, `models.default` |
| Dependencies resolve deterministically | Kahn's algorithm; same input → same order |
| Conflicts detected | Duplicate IDs, version mismatches, service conflicts |
| Permissions enforced | SEP floor + trust tiers enforced at activation |
| Persistence inspectable | Provenance API + composition diff |
| Changes reversible | Atomic activation + rollback framework |
| Legacy compatibility | V1/V2 paths frozen; compat layer maintained |
| Security preserved | SEP floor immutable; trust tiers enforced |
| Performance acceptable | <10ms startup overhead; O(1) lookups |
| Large compositions practical | 1000 plugins < 3s startup |