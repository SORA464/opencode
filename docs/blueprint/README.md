# Everything-Is-A-Plugin Blueprint — OpenCode v1.18.14 baseline

> **Status:** RESEARCH / AUDIT / DESIGN ONLY — frozen baseline `9931c2f2a` (hardened,
> cross-platform-verified, real-agent-tested). No code, architecture, or behavior is modified
> in this phase. This directory is the complete migration blueprint.

## Executive summary

OpenCode is unusually well-positioned for an Everything-Is-A-Plugin future. It already owns a
service-graph kernel (`packages/core/effect` LayerNode), a durable event bus (EventV2), a scoped
tool-registry algebra (ApplicationTools process-scoped ⊕ Location-scoped), a TUI slot-plugin
runtime, `.opencode` config-dir conventions, dynamic npm provider loading, an MCP surfacing
pipeline, and a real Extension SDK (`packages/plugin`). The migration is therefore **formalization,
not invention**: turn today's hardcoded wiring and config-dir conventions into typed registrations
over the same seams.

The target keeps the **kernel tiny** (lifecycle, truth, enforcement) and makes every capability —
tools, providers, agents, prompts, commands, Integrations/MCP, knowledge, storage, observability,
commerce, and all UI — a **bundled plugin** composed via an ordered profile/bundle/patch layering
system, with a Security Enforcement Point (SEP) whose floor cannot be patched away.

DeepSeek Harness (deepseek-ai/deepseek-harness on Cordis) proves the model is viable at scale.
The blueprint adopts its order-independent `inject` resolution, reversible-effect lifecycle,
three-domain event taxonomy (durable/live/seam-waterfalls), execution-world seam, and
profile/bundle/patch composition — and deliberately diverges where dsh's developer-preview
defaults would weaken security or ergonomics (policy-as-plugin, whole-row patch replacement only,
no deep merge; see 01 §5).

The migration is staged in **M0–M7** (42–52 eng-weeks, single-team sequential) behind golden-master
harnesses with one behavioral surface changing per phase and a flag-gated rollback kept exactly one
release per phase. Frontend, marketplace, and autonomous-capability expansions **follow**, they do
not block, this program.

---

## Map of this blueprint (23 deliverables → documents)

| Deliverable | Document |
|---|---|
| 1 Deep research report | `01-deepseek-harness-analysis.md` |
| 2 DeepSeek Harness architectural analysis | `01-deepseek-harness-analysis.md` (+ Cordis primer context in §1) |
| 3 OpenCode architectural audit | `02-opencode-audit.md` |
| 4 Technical debt inventory | `03-technical-debt.md` |
| 5 Complete system map | `02-opencode-audit.md` §§1–2,5 |
| 6 Pluginization inventory | `04-plugin-model.md` |
| 7 Minimal kernel specification | `05-minimal-core.md` |
| 8 Plugin kernel design | `06-kernel-design.md` |
| 9 Event architecture design | `12-event-service-dependency.md` §1 (+ 04 §3, 06 §5) |
| 10 Service registry design | `12-event-service-dependency.md` §2 |
| 11 Dependency model design | `12-event-service-dependency.md` §3 |
| 12 UI/UX plugin architecture | `07-ui-pluginization.md` |
| 13 Connector ecosystem architecture | `08-connector-ecosystem-sdk.md` §§1,3–4 |
| 14 SDK architecture | `08-connector-ecosystem-sdk.md` §§1–2 + 05 §3 (R1–R6) |
| 15 Security architecture | `11-security-architecture.md` (also 05 §4, 06 §§6–7, 08 §3) |
| 16 Migration roadmap | `09-migration-roadmap.md` |
| 17 Rollback strategy | `09-migration-roadmap.md` (per-phase rollback + 10 §1 flags) |
| 18 Risk analysis | `10-safety-performance.md` §1 + `13-implementation-complexity-effort.md` §6 |
| 19 Performance analysis | `10-safety-performance.md` §3 |
| 20 Implementation phases | `09-migration-roadmap.md` + `13-implementation-complexity-effort.md` §1 |
| 21 Estimated complexity | `13-implementation-complexity-effort.md` §2 |
| 22 Estimated effort | `13-implementation-complexity-effort.md` §3 |
| 23 Final recommended architecture | `13-implementation-complexity-effort.md` §4 + this README's target diagram below |

## Reading order

1. `01` (dsh — understand first, then decide to adopt/reject)
2. `02` + `03` ( today's system — what exists and what debt guards every later decision)
3. `04` + `05` (the boundary — what becomes a plugin vs what stays kernel)
4. `06` + `12` (kernel internals — lifecycle/services/events/dependencies)
5. `07` + `08` + `11` (surfaces + security)
6. `09` + `10` + `13` (how to get there, what it costs, what could go wrong)

## Target invariant (one sentence)

The product ships as a **default profile** — a data-described composition of versioned first-party
bundles assembled by a tiny kernel — whose every row is patchable by higher layers, whose every
registration is reversible on unload, and whose durable facts live only in an event-sourced log.

## How to use this phase's output

- Review `01` for the explicit adopt/reject ledger — every later design choice is traceable to it.
- Treat `02`/`03` classification as the code-searchable source of truth for "should this move?"
- Implement **nothing** until explicit approval per the phase preamble; when approved, start at
  `09` Phase M0 — it contains the exact guardrail and golden-master prerequisites all later phases depend on.

## Related frozen-bag documentation

- `BASELINE.md` — v1.18.14 provenance (forked tag `65cf14df`, zero source drift)
- `HARDENING.md` — cross-platform + operational hardening + real-agent evidence (run 32969037820,
  branch `harden-production`, artifacts + checksums)
- `CERTIFICATION.md` — final cross-platform certification evidence and remaining blockers

