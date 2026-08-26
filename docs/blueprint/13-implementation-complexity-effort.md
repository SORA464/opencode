# 13 — Implementation Phases, Complexity, Effort & Final Architecture

## 1. Implementation phases (condensed from 09; added entry/exit gates)

| Phase | Scope | Entry gate | Exit gate (frozen) |
|---|---|---|---|
| **M0** | Guardrails + prerequisites (ServerAuth dedupe, projector version-binding, KeyedMutex, golden-master harnesses, god-module splits) | baseline frozen | background-job TTL already shipped as example of guardrail style; harness in CI |
| **M1** | Extract `packages/kernel` (K1–K7,K9), manifest types, composition loader skeleton (default profile = today's graph as data) | harness ACCEPT | kernel imports nothing from bundles (enforced); boot time +5% |
| **M2** | Tools & commands as plugins; port remaining TODO backlog to v2 registry; MCP as bundle | harness ACCEPT | registry-dump diffs equal; one-tool hot reload demo |
| **M3** | LLM seam + provider plugins + Connector SDK shape | M2 done | add-a-provider-without-fork dogfood passes |
| **M4** | Composition-as-data everywhere; v1 API retires to `compat-api-v1` bundle | M3 done | deleting default profile then recreating reproduces goldens |
| **M5** | Agent-loop & execution-world seams; A/B golden runs of both loops | M4 done + checklist for bash/edit safety nets | container-backend demo behind flag |
| **M6** | UI registry rollout (TUI promoted, app slot outlets, platform bundle) | M4 done | add-a-panel/board without renderer edits |
| **M7** | Ecosystem enablement: stable Extension SDK tiers, bundle packer, curated index, signing | M6 done | install+hot-reload a third-party bundle from index in CI |

One behavioral surface changes per phase; flags retain old paths exactly one release, then delete.

## 2. Estimated complexity

| Area | Complexity | Why |
|---|---|---|
| Provider seam + loader rework | Low–Med | already lazy+named; `llm` pkg is a real seam today |
| Tool registry completion | Low–Med | v2 algebra proven; port is mechanical + permission parity |
| Kernel extraction | Med | touches every import graph; test is boot+transcript goldens |
| Composition-as-data | Med–High | the single biggest behavioral flag; needs golden-master depth |
| Execution-world seam | Med | surface is narrow (fs/subprocess/shell/pty) but correctness critical |
| Agent-loop swap | High | most stateful surface; requires A/B corpus |
| UI registry rollout | Med | two renderers; TUI already has it |
| Marketplace/signing | Med (infra) | out-of-band from product, but key-management sensitive |

Overall codebase complexity **transfers** from scattered hardcoded wiring into one explicit graph —
local reasoning gets harder for 2 phases, then easier than today once composition is data.

## 3. Estimated effort (single-team, sequential)

| Phase | Eng-weeks | Notes |
|---|---|---|
| M0 | 3–4 | includes harness + god-module splits valuable standalone |
| M1 | 4–6 | |
| M2 | 4 | |
| M3 | 5–6 | |
| M4 | 6 | |
| M5 | 8 | longest loop-state surface |
| M6 | 6–8 | |
| M7 | 6 | |
| **Total** | **42–52** | ≈2 engineers × 5–6 months sequenced; parallelized teams can overlap M2/M3 and M6 with M5 tail |

Add ~20% buffer if the v1-parity checklists (03-C2) are treated as release blockers rather than TODO walls.

## 4. Final recommended architecture (frozen target)

```
Schema (contracts only)
  ↓
Kernel (`packages/kernel` = K1–K7,K9 + manifests + lifecycle + events)
  ↓  exposes stable slots: "tools", "llm.adapter", "fs", "pty", "subprocess",
  ↓                        "sandbox", "jobs", "commands", "ui.*", "telemetry", …
Bundles (first-party, versioned, signed):
  base-tools · providers-* · agent-loop (behind factory) · mcp · lsp · acp
  · execution-world · storage · snapshot/worktree/share · skills/commands
  · ui-tui · ui-web · desktop-platform · compat-api-v1 (shrinks)
  ↓
Server (generic HTTP assembly mounting Protocol over kernel services)
  ↓
Composition: Profile (deployment) = ordered bundle refs + patches + .opencode dir
                   → resolved at boot, lockfile'd, diff-reported
Frontends: TUI / web / desktop all render from event stream + call via sdk/client
           (desktop = platform-plugin host; any host mounts AppInterface with its platform)
```

**Invariants preserved through the migration:**
- Model-visible ⇒ logged (runtime assertion).
- Tools/permissions mediated at registration + execution via kernel SEP.
- One explicit `llm.stream` per step; per-Location tool/history/model scopes.
- V1 external contracts preserved behind compat layer with versioned deprecation window.

## 5. What we deliberately do NOT do in this program

No new memory/repo-intelligence subsystems, no autonomous-capability expansion, no Cursor-parity
feature work, no billing/cloud-hosted expansion — those are the *payload* the platform will then
carry. This program is the platform itself.

## 6. Risks to watch at program level

A compatibility layer that never shrinks, a profile system users experience as ceremony before value,
and an ecosystem whose first third-party plugin is harder than `git clone && cargo install`. Mitigated
by the M2 and M3 dogfood gates: *every early phase must ship a user-visible win* (hot-reloadable
tool, add-a-provider-without-fork) rather than pure restructuring.

