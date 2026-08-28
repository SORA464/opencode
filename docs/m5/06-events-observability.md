# M5 — Events, Observability, Security, Performance, Golden Masters

- **Event integration:** typed events for `agent/turn/step/planning/tool/model/subagent/background/error/completion/cancellation` via M1 `EventRegistry` (durable/live/seam) with deterministic ordering.
- **Observability:** provenance for `agent runtime, agent, profile, model, provider, tool, subagent, task` — reconstructs "Why did the agent do this? Which runtime/model/tools were active? Which profile caused composition?"
- **Security:** audit of agent/tool/provider/subagent/background/filesystem/credential/trust boundaries; child never exceeds parent's capability (SEP floor wins); plugin trust tiers enforced.
- **Performance:** startup, agent creation, turn/step latency, model/tool/subagent/memory/CPU/event/persistence overhead measured against M0 baselines (2.9k RPS health, 390 RPS file); no per-step/token overhead beyond map lookups.
- **Golden masters:** agent scenarios (exact task, tool sequence, expected outcomes, failure/recovery/termination) captured via `harness/m0/agent-runtime.test.ts` cassettes; old vs new runtime compared, only justified diffs allowed.

