# 11 — Security Architecture

## 1. Threat model (what the plugin era must defend)

| Attack surface | Today | Plugin era risk change |
|---|---|---|
| Filesystem escape | lexical + realPath containment holds (verified) | more FS providers = more implementations to audit |
| Process/command injection | one shell runtime, permission-gated | N shell backends; requests cross provider boundary |
| Supply chain | pinned ripgrep, moving ESLint zip (supply-chain high) | bundles from npm/git add N new install-time surfaces |
| Composition abuse | no composition (hardcoded graph) | malicious/typo bundles or patches removing SEP rules |
| Credential theft | Redacted wrappers, no logs exposure verified | more plugins touching auth headers |

## 2. Trust tiers

| Tier | Where it runs | Code origin | Capabilities auto-granted |
|---|---|---|---|
| T0 builtin | in-process, same realm, synchronous effects | `packages/bundles/*` shipped with product | all (policy still mediates) |
| T1 verified-community | in-process, capability-scoped `ctx` façade | signed, reviewed bundles | outside SEP floor nothing |
| T2 community / third-party | **out-of-process** worker/process/container | unsigned/unreviewed | out-of-process boundary *is* the isolation |

**Principle:** T1 in-process is a *review* boundary, not an isolation boundary. Only T2 is a
security boundary. The kernel documents this explicitly (no false claims).

## 3. Permission model

- **Declaration**: manifest `permissions: ["fs.workspace","exec","net.fetch","ui.dialog","credentials.read"]`
  per capability family. Requested superset shown at install/upgrade.
- **Grant**: SEP consults tier + user approval flow (reuses existing `permission/evaluate` UX —
  ask/allow/always). Enterprise profile can raise floors.
- **Enforcement**: checked **at registration** (denied tool never reaches prompt assembly — already
  true in v2) **and at execution**. Kernel API wrappers are the only route to privileged ops;
  boundary enforced by import-audit CI check (05-R5).
- **Revocation**: disable → cascading unload of dependents; re-enable = fresh grant flow.

## 4. SEP floor (non-unloadable policy)

Compiled into the kernel, not patchable away by any user/bundle patch:

- `fs.write` outside workspace → always denied unless explicit user allow-list entry
- `exec` outside sandbox → always denied in hosted tier
- Credential vault read → always requires tier ≥ T1 or explicit allow
- Telemetry sink add → always requires opt-in

Composition report flags any attempt to lower the floor as an error, not a warning.

## 5. Bundle provenance & signing (phased)

- Phase A–B (M0–M6): content-hash lockfile (`profile.lock` records resolved bundle versions + hashes);
  install fetches via HTTPS and validates hash. Unsigned community bundles show an explicit warning.
- Phase C (M7): publisher key signing; verified badge in plugin manager; enterprise can require
  `verified` tier only.
- Moving-branch artifact eliminated now (ESLint zip pinned — 03-D1 kept visible).

## 6. Secrets handling invariant

Credentials remain wrapped in `Redacted` across the kernel boundary. Event log, composition report,
logs, and telemetry never contain header values — verified today and preserved as a kernel-layer
contract test (log scrubber test that fails if a known secret test value appears in any sink).

## 7. What we deliberately diverged from dsh on

- dsh's approval policy as an ordinary plugin → **rejected**: SEP floor makes it kernel-resident.
- dsh's default in-process for everything → **adapted to tiers**: T2 exists from day one for community code.
- dsh shared-context mutability left to discipline → **hardened with permission checks on every
  registry entry point** plus CI boundary audit.

## 8. Verification plan for this doc

- Unit: manifest permission parsing; SEP floor unit tests (deny-by-default cases).
- Gate: boundary-audit CI check that fails if any bundle imports `permission/internal` outside kernel.
- Manual: hostile-bundle fixture (tries to register `fs` provider that bypasses containment) must be
  denied at registration time in test harness.

