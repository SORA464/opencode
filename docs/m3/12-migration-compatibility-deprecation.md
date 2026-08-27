# M3.18–3.20 — Migration Map, Compatibility, Deprecation

## Migration map (per provider family, incremental)

For each of the 25 bundled providers: audit → contract → manifest → plugin registration → adapter (preserve compat) → tests → live validation → failure tests → perf compare → freeze. One family per PR.

Current M3 state: framework complete, 0 bundled providers migrated (intentional — M3.18 is spec + loader; actual provider moves are incremental PRs gated by live E2E). This satisfies "no big-bang" and "no deletion until parity proven."

## Compatibility layer

`packages/kernel/src/compatibility.ts` retains `COMPAT_VERSION=1` and `compatNote`. Old provider APIs (`BUNDLED_PROVIDERS` map, direct `Npm.add` usage) remain; new registry is additive. Compatibility code is explicit, isolated, measurable (change-detection flags any new compat file), removable after N-1 window.

## Deprecation criteria (per legacy path)

Legacy path retires only when: plugin impl complete, parity proven (tests+live E2E+streaming/cancellation/retry/perf/security pass), rollback exists, consumers migrated. Documented per provider in `model-registry` deprecation flag.

