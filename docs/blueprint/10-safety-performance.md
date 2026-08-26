# 10 — Safety & Performance Analysis

## 1. What could break / regress — and mitigation

| Risk | Mechanism | Mitigation |
|---|---|---|
| Behavioral drift during extraction | every subsystem moves across a registry boundary | golden-master transcripts (HTTP/SSE/CLI) per phase; registry-dump diffs (tools/providers/commands identical pre/post); flags keep old paths one release |
| Boot-order regressions | ~55-service graph, order-sensitive invariant (#34730) | kernel boot assertion + dependency-driven activation replaces prose; boot budget test in CI |
| Waterfall vetoes by accident | interception model | explicit result type (`continue/replace/veto`), dropped-`next()` lint + runtime warning, veto telemetry |
| Security policy weakened by composition | policy-as-plugin inversion (dsh weakness) | SEP floor compiled-in; trust tiers; composition diff report on policy-affecting rows; CI boundary grep (05-R5) |
| Plugin crash takes product down | in-process T0/T1 tiers | per-plugin error containment (ACP-fix pattern), FAILED quarantine + backoff restart, dependents see typed unavailability |
| Unbounded retries on flaky bundles | reload cascades | kernel retry budget (reuse hardened session/retry budget pattern) |
| Supply chain via bundles | npm/git distribution | pinning + hashes in profile lock; signature verification at Phase M7; no moving-branch artifacts (audit D1 rule) |
| v1-parity loss when retiring legacy paths | dual-stack cutover | parity checklist gates (bash/edit/write safety nets etc.) tracked as release blockers, not TODOs |
| Session corruption during bundle swap mid-session | plugins never own durability | durable facts only via EventV2; quiesce barrier on upgrade; swap tests with active sessions |
| Config/patch user errors | whole-row vs field merge | field-scoped merge default w/ conflict report; dry-run `opencode profile explain` |

## 2. Complexity/maintenance burden honesty

Plugin architectures trade local simplicity for systemic indirection: debugging crosses registration
boundaries, version matrices multiply, and "where does X come from" needs tooling answers. Mitigations
baked into design: composition report at boot (provenance of every row), plugin-manager UX (exists in
TUI), manifest schema validation, and the kernel refusing partial graphs with actionable diagnostics.
Net assessment: complexity is front-loaded into M0–M4 refactors that are valuable *independently*
(god-module splits, single server, config cutover) — the architecture pays for itself even if later
phases stop.

## 3. Performance analysis

Measured baselines (this machine, hardened build): health endpoint ~2.9k RPS @p99 139ms @c250;
file pipeline ~390 RPS; cold CLI/server start measured during certification phases.

| Dimension | Expected impact | Optimization strategy |
|---|---|---|
| Startup time | +manifest parse/graph resolve (~ms-level for dozens of plugins); risk only if eager imports return | keep lazy-mount policy: contributes rows registered cheaply, heavy code loaded on first use (pattern already repo-standard); boot budget test |
| Runtime call overhead | service lookup = map access; waterfall adds closure hops on hot paths (request/tool pipelines) | waterfalls only at coarse boundaries (per-request/per-tool-call), never per-chunk; fast-path bypass when zero listeners (precomputed listener-count check) |
| Memory | per-plugin scope objects + effect registries (≈KB-scale each) | eviction semantics copied from hardened background-job TTL work; plugin-manager shows footprint |
| Tool execution | unchanged execution bodies; adds SEP mediation already present (permission evaluate exists today) | registration-time filtering (existing v2 behavior) keeps denied tools out of prompt+dispatch entirely |
| Agent execution | loop-as-plugin adds seam hop per step — negligible vs multi-second LLM latency; waterfall hooks enable compaction/context plugins without loop edits | keep per-turn waterfalls off the streaming hot path except `llm/stream` pass-through |
| UI responsiveness | slot resolution O(1); registration storms batched | pre-sorted slot views; lazy route loading (already used for pages) |

Net expectation: **sub-percent** steady-state overhead; startup delta bounded by lazy-mount discipline;
the measurable wins come from the same refactor (single server tree, config cutover, provider split)
removing today's duplicate work.

## 4. Residual risks accepted

- Two-loop maintenance continues until M5 parity gate — bounded by checklist, not hope.
- Compat layer lifetime depends on external client (VS Code ext, Slack bot) migration pace;
  tracked per-consumer, not time-based.
- Ecosystem cold-start: first-party bundles must themselves be compelling plugins, or the model
  degenerates into ceremony — hence every phase ships user-visible wins (hot-reloadable tools,
  add-a-provider-without-fork) rather than pure restructuring.
