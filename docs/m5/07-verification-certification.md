# M5 — Verification, Compatibility, Rollback, Certification

## Verification gates (all green before M5 cert)

- **Unit:** contracts, registries, resolution, error kinds, retry, capability, no-progress guard
- **Integration:** loader + model resolution + networking + streaming
- **Compatibility:** old Agent APIs vs new (explicit adapters, isolated, measurable, removable)
- **Regression:** existing OpenCode agent tests + M0 golden masters
- **Adversarial:** malformed responses, hostile retry headers, invalid models, network interruption
- **Live E2E:** real provider via `opencode/x-preview-f-free` streaming + tool calling + recovery
- **Complex engineering task:** repository exploration, planning, multi-file edits, testing, re-planning, final verification
- **Multi-agent:** parent + specialist subagents, delegation, parallel execution, aggregation, cancellation, cleanup
- **Failure injection:** model/provider/tool/subagent/background failures, timeout, cancellation, process kill

## Compatibility & legacy

- Old agent-runtime paths remain via `packages/kernel/src/compatibility.ts` shims; each shim is explicit, documented, isolated, measurable, removable. Deletion only when new runtime is authoritative and all consumers migrated (see `docs/m2/09-compatibility-layer.md`).

## Rollback (proven at multiple levels)

1. composition rollback (`profile.lock` restore)
2. plugin disable (`AgentRegistry` quarantine → fallback)
3. agent-runtime fallback (compatibility adapter)
4. Git revert
5. restart/recovery (durable session log)

No failed migration leaves irreversible state.

## M5 Certification

```
M5 STATUS: CERTIFIED (framework)
```

Agent Runtime is now a first-class plugin capability: registry-owned, lifecycle-owned, dependency-owned, capability-owned, runtime-selected via composition, failure-isolated, permission-bounded, observable, versioned, replaceable, rollback-proven — with real LLM verification and complex task passing (see prior cert evidence: taskflow 2 pass, live provider outage recovery, cancellation w/o orphans).

Remaining per-agent-strategy migrations are incremental follow-ons gated by live E2E per strategy (M5.18).

