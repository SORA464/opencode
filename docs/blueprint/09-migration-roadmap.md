# 09 — Migration Roadmap (design only — no implementation in this phase)

Guiding constraint: **the dual v1/v2 stack already in the repo is the migration vehicle.** Every phase
ends with the product byte-for-byte behaviorally identical from the user's perspective, proven by
golden-master harnesses (recorded HTTP/event transcripts via `http-recorder`, CLI golden outputs,
TUI/app screenshot smoke).

## Phase M0 — Prerequisites & guardrails (no architecture change)
- Fix hook-blocking debt that any later phase trips over: ServerAuth dedupe (03-B1); EventV2 projector
  payload version-binding (03-C3) — hard prereq for plugin-era event contracts; KeyedMutex adoption at
  hand-rolled lock sites; endpoints centralization + ESLint artifact pinning (supply chain).
- Build golden-master suite: serve API transcript tests, CLI output goldens, boot-time budget test.
- Split god modules along future seams (provider.ts → catalog-sync/auth-state/schema/service;
  transform.ts rewrite; session handler facade). Pure refactors, verified by existing suites.
Effort: ~3–4 eng-weeks. Rollback: ordinary git revert; no behavior change intended.

## Phase M1 — Kernel package extraction
- Create `packages/kernel`: move Effect substrate (layer-node/app-node/runtime/keyed-mutex), EventV2,
  Flag/env sweep, SEP (permission evaluate + protected paths), manifest types.
- Add lifecycle manager + service registry API + composition loader skeleton (default profile =
  today's hardcoded graph expressed as data).
- Boot assertion replaces the Observability-order comment (#34730).
Exit criteria: all existing tests green; kernel imports nothing from bundles (CI-enforced R1–R5 of 05);
boot time within +5% of measured baseline.
Rollback: kernel is additive; composition still hard-coded fallback path behind a flag.

## Phase M2 — Tools & commands as plugins (lowest risk, highest symmetry)
- Port remaining tools to v2 registry per core/tool AGENTS backlog (task/LSP/code-mode/MCP/plugin
  tools), then express ALL tools (v1 parity set) as base-tools bundle contributions.
- Custom command markdown + palette registry fed by kernel commands.
- MCP bridge becomes a bundle consuming tool/command registries (behavior preserved incl. permissions).
Exit: tool inventory identical via registry dump diff; permission behaviors identical.
Rollback: flag reverts to static registration path (kept one release).

## Phase M3 — Providers & LLM seam
- Formalize `llm.adapter` seam (llm pkg already qualifies); wrap BUNDLED_PROVIDERS loaders +
  llm/providers facades as provider plugins; models.dev catalog remains kernel-adjacent discovery
  service feeding them.
- Auth flows (internal auth plugins list) become connector plugins (08 §1 Connector SDK shape).
Exit: provider dump identical; one new provider addable purely as external bundle (dogfood test).
Rollback: static loader map retained behind flag.

## Phase M4 — Composition-as-data everywhere
- Replace httpapi/server.ts hardcoded group with profile/bundle loader output; compat layer mounts
  v1 API as `compat-api-v1` bundle; projectors move into owning bundles' mount effects.
- Config-dir `.opencode` conventions become first-class patch source (agents/commands/tools/themes).
Exit: deleting-and-recreating default profile reproduces prior transcript goldens; boot report shows
provenance; startup ≤ baseline+5%.
Rollback: embedded default profile constant retained.

## Phase M5 — Agent loop & session seams
- Extract `agents.factory` seam; v1 prompt-loop and v2 SessionRunner become two loop plugins
  (v2 default where feature-parity checklist 03-C2 is complete; otherwise v1 stays default).
- Execution-world seam: fs/subprocess/shell/pty behind one interface (unlocks remote/container run).
Exit: A/B golden runs of both loops on task corpus; execution-world swap demo (container backend)
behind experimental flag.
Rollback: loop selection env (pattern exists: OPENCODE_EXPERIMENTAL_NATIVE_LLM).

## Phase M6 — UI pluginization rollout
- Kernel UI registry + TUI binding promotion; app slot outlets + settings section registry;
  basic-tool renderer formalization; desktop platform bundle.
Exit: TUI feature-plugins + app panels ship as bundles; no renderer edits to add a panel.
Rollback: outlets render builtins only when no contributions.

## Phase M7 — Ecosystem enablement
- Extension SDK stabilization tiers (08 §2), bundle packer/validator CLI, curated index (Phase B),
  trust-tier signing infrastructure.
Effort summary (sequential, single-team): M0 3–4w · M1 4–6w · M2 4w · M3 5–6w · M4 6w · M5 8w ·
M6 6–8w · M7 6w ⇒ **~42–52 eng-weeks** (~2 engineers × 5–6 months), excluding marketplace Phase C.

## Cross-cutting rules
- One behavioral surface changes per phase; golden-masters gate every merge.
- Flags carry old paths for exactly one release cycle, then delete (debt firewall).
- Each phase ships in its own release channel build before mainline promotion.
