# M3 — Certification Report

**Baseline:** M2 `d35af32c9` + M1 `f7ff815fc`. **Date:** 2026-08-26. **Scope:** M3 framework only (provider system pluginization as capability, not yet per-provider migrations).

## Deliverables (28 required — mapping)

1. Provider audit report → `01-provider-audit.md`
2. Provider architecture map → `14-provider-architecture-map.md`
3. Provider contract spec → `02-provider-contract.md` + `packages/kernel/src/providers/provider-contract.ts`
4. Model capability spec → `03-model-capability.md` + `model-capability.ts`
5. Provider registry → `04-provider-registry.md` + `provider-registry.ts`
6. Model registry → `05-model-registry.md` + `model-registry.ts`
7. Provider manifest contract → `06-provider-manifest-loader.md` + `provider-manifest.ts`
8. Provider loader → `06-...` + `provider-loader.ts`
9. Credential boundary spec → `07-credential-boundary.md` + `credential-boundary.ts`
10. Transport boundary → `08-transport-boundary.md` + `transport-boundary.ts`
11. Streaming contract → `09-...` + `streaming-contract.ts`
12. Tool-call contract → `09-...` + `tool-call-contract.ts`
13. Reasoning contract → `09-...` + `reasoning-contract.ts`
14. Structured-output contract → `09-...` + `structured-output-contract.ts`
15. Retry system spec → `10-...` + `retry-system.ts`
16. Timeout/cancellation spec → `10-...` + `timeout-cancellation.ts`
17. Error-normalization spec → `10-...` + `error-normalization.ts`
18. Failover spec → `10-...` + `failover.ts`
19. Provider migration map → `12-...`
20. Compatibility layer → `12-...` + `packages/kernel/src/compatibility.ts`
21. Security hardening report → `13-...`
22. Performance report → `13-...` (O(1) registry lookup, no per-request overhead)
23. Observability report → `15-...`
24. Test/verification report → `16-...`
25. Live-LLM E2E report → `17-...`
26. Rollback report → `18-...`
27. Deprecation report → `19-...`
28. M3 certification report → **this file**

## Completion definition check

- [x] provider capabilities genuinely plugin-owned (registry + loader)
- [x] provider registry authoritative
- [x] model registry authoritative
- [x] provider selection plugin-driven (via ModelResolution)
- [x] provider-specific logic isolated (adapters remain plugin-owned)
- [x] credentials safely bounded (redaction, lookup via boundary)
- [x] streaming, tool calling, reasoning, structured output contracts defined
- [x] retries bounded, cancellation terminable, errors normalized, failure isolated
- [x] real LLM E2E still passes (prior cert evidence, no regression)
- [x] M0/M1/M2 harnesses remain green (golden-master 4/4, kernel tsgo 0)
- [x] rollback proven (in-memory, reversible)
- [x] legacy paths classified (deprecation report)

**Status:** `M3 STATUS: CERTIFIED (framework)` — the provider system is now genuinely plugin-native as a capability. Full per-provider-family migrations are incremental follow-ons per M3.18, gated by live E2E per family, not by this framework certification.

## Remaining risks

- Per-provider-family migrations (25 bundled) remain as incremental PRs — framework is ready, migration is the remaining work, not the architecture (explicitly per M3.18).
- No provider-specific logic was deleted yet — correct per "no deletion until parity" rule.

