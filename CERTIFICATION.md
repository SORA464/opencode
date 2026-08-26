# Final Cross-Platform & Scale Certification Report

Branch/state: `harden-production` @ `f65dbb983` (frozen release candidate) · Artifact: standalone compiled binary per-platform · Date: 2026-08-26

## 0. Authoritative cross-platform run (GitHub-hosted hardware)

Run `32969037820` (workflow `.github/workflows/cert.yml`, dispatchable, reproducible):

| Job | Result | Scope executed |
|---|---|---|
| platform ubuntu-24.04 / linux-x64 | **SUCCESS** | install → typecheck(core/opencode/tui) → core unit suite → `build --single` → binary `--version` → headless serve `/global/health` |
| platform macos-14 / darwin-arm64 | **SUCCESS** | same scope |
| platform windows-2025 / windows-x64 | **SUCCESS** | same scope |
| desktop-build ubuntu-24.04 | **SUCCESS** | Electron renderer/main compile (`electron-vite build`) |
| desktop-build windows-2025 | **SUCCESS** | Electron renderer/main compile |

Fixes required to make this pass (regression-hardened in-repo): YAML parse error in workflow summary step; Windows-runner symlink checkout ("Filename too long") resolved by normalizing the two de-symlinked `custom-elements.d.ts` entries to true file modes (`100644`) plus pre-checkout `core.symlinks` config; strict-typing fix for `VITE_OPENCODE_CHANNEL` surfaced by full-workspace typecheck gate.

Legend: **TESTED** = executed here with artifacts/logs · **VERIFIED-CI** = executed on GitHub-hosted hardware via reproducible workflow · **MODELED** = capacity math anchored to tested numbers, not a test result · **NOT TESTED / BLOCKED** = stated plainly.

## 1. Platform matrix (actual execution)

| Environment | Install | Launch | Auth | Agent(LLM) | Tools | Persistence | Recovery | Result |
|---|---|---|---|---|---|---|---|---|
| Windows x64 (local, release binary) | TESTED | TESTED | TESTED | TESTED (complex task, retry-through-outage) | TESTED | TESTED (crash-recovery, WAL) | TESTED | PASS |
| Ubuntu 26.04 x64 (native WSL2, cold env) | TESTED (bun 1.3.14 pinned; toolchain note¹) | TESTED | TESTED (machine store) | TESTED (`run` created notes.md via Write→shell→verify, exit 0) | TESTED | inherited engine | serve restart PASS | PASS |
| Linux x64 (GH runner ubuntu-24.04) | VERIFIED-CI | VERIFIED-CI | n/a smoke | smoke only | suite | suite | serve-health PASS | PASS (run 32969037820) |
| macOS 14 arm64 (GH runner) | VERIFIED-CI | VERIFIED-CI | n/a smoke | smoke only | suite | suite | serve-health PASS | PASS (run 32969037820) |
| Desktop (Electron renderer/main) | VERIFIED-CI compile (ubuntu + windows, run 32969037820) | NOT TESTED (GUI) | — | — | — | — | — | BLOCKED² |
| Browser (embedded web UI) | n/a | TESTED (protocol-level: auth-gated shell, title, JS/CSS assets) | TESTED (401 unauth / token auth) | TESTED server-side; UI automation BLOCKED³ | server-side TESTED | server-side TESTED | reload contract PASS | PARTIAL |
| SaaS multi-tenant (console/enterprise cloud) | — | — | NOT TESTED | — | — | — | — | BLOCKED⁴ |

¹ First Linux install hit a transient `tree-sitter-powershell` postinstall failure; clean rerun installed 2,717 packages cleanly (documented, non-deterministic installer script issue worth an upstream look).
² Windows CI cannot materialize the repo's 60 git-symlinks without extra runner config ("Filename too long" at checkout); macOS/Linux unaffected. GUI drive requires interactive display.
³ Local EDR blocks Chromium DevTools transports (pipe **and** WebSocket) — automation impossible here; protocol-level verification substituted and labeled as such.
⁴ Requires upstream-operated cloud accounts/sandbox credentials not available in this environment.

## 2. Real LLM end-to-end (per platform where driven)
- Windows: full complex autonomous task (see HARDENING.md §8) incl. live provider-outage recovery, cancellation w/o orphans, context continuity.
- Linux: native `opencode run` agent turn — file created via tool, verified by second tool call, exit 0.
- macOS: smoke-tier only (build+serve). No LLM call — labeled honestly.

## 3. Measured performance (single hardened node, Windows)
- `/global/health`: 427 → 1,734 → 2,915 → **2,938 RPS** at c=1/25/100/250; p99 13→139 ms; **0 errors**
- `/file?path=.` pipeline: 18 → 311 → **390 RPS**; p95 39→319 ms; one 3.1 s cold-start outlier; 0 errors
- Post-load health: healthy. Bottleneck: single-process CPU — by-design limit before horizontal scale-out.
- Soak windows this phase: 4 min (prior) + 8 min (0 errors, flat handles/threads). Multi-hour/day: **NOT TESTED**.

## 4. Scale assessment (MODELED — anchored to §3, not tested at target)
Target 200M registered:
- DAU @5% → 10M; peak concurrent @2% DAU → **~200k online**
- Session churn ~3/user-day → ~350k creates/hr ≈ **~100 RPS** create-rate (trivial for a clustered SQL tier; today's embedded SQLite-per-node covers single-node/team scope only)
- Steady API load est. **50–80k RPS** → at measured per-node rates ⇒ ~20–30 active API nodes (×3 headroom ⇒ 60–90 nodes) behind LB; instances are stateless-per-directory by design, requiring externalized metadata DB + object storage for multi-node state (the in-repo console/enterprise stack's role)
- Concurrent agent streams @5% of online → **~10k** — provider quota/throughput and cost dominate; product already carries retry-budget/backoff hardening verified under live outage
- Storage: ≈200 KB/session ⇒ ~6 TB/day transcripts+outputs at target ⇒ object storage + lifecycle policies mandatory
- Confidence: **moderate** for API tier (anchored to measurements), **low** overall until multi-node SaaS deployment is itself tested. No claim of 200M-user readiness is made.

## 5. Distribution/update (evidence-based)
- Standalone artifact verified on Windows (empty-dir run, SHA256 recorded) and built+smoked on linux-x64/darwin-arm64 in CI.
- Installer/signing/updater flows: **NOT TESTED** — no signing identities; `opencode upgrade` targets upstream release channel (untouched by design).
- Update-system resilience (interrupted/corrupt update): **NOT TESTED** — blocked pending a controlled release channel.

## 6. Security at scale
Local-tool threat model fully adversarially re-verified this phase (auth matrix, containment, ReDoS bound, hostile MCP config, body-size accepted-risk documented). Tenant isolation, SSRF-at-edge, rate-limiting, abuse quotas: **NOT TESTED** — they live in the un-deployed SaaS tier. Listed as launch blockers for any hosted launch, not for the local product.

## 7. Final state
- Commit chain: baseline `65cf14df` (v1.18.14) → hardening series → cert infra → final fixes; HEAD recorded below.
- All gates run through repo hooks (turbo typecheck 30/30 enforced on every push).

## 8. Decision
Windows/Linux/macOS CLI+server product: **certified-quality evidence across install/build/test/run/agent/persistence/recovery**. Hosted-product dimensions (desktop GUI drive, browser automation, multi-tenant SaaS, subscriptions, distribution signing, long-soak, horizontal-scale-under-load) remain outside what was executable in this environment and stay honestly uncertified.

```text
PUBLIC LAUNCH STATUS:
NOT CERTIFIED
```

Blockers (exact): hosted-SaaS deployment+tenant-isolation testing; account/subscription entitlements; desktop GUI pass incl. macOS; signed distribution + update-resilience; ≥multi-day soak; multi-node load validation of the modeled tiers.
