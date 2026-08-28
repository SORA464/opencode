# M5 — Subagent, Multi-Agent, Background, Session, Cancellation, Checkpoint

- **Subagent architecture:** first-class `Subagent {id, parent, lifecycle, provenance}` with spawn/dependency/parent-child/cancellation/timeout/completion/failure/result/cleanup/recovery; bounded spawn (max depth/breadth), no orphan/recursive explosion, explicit provenance.
- **Multi-agent seam:** contracts for `delegation, task splitting, specialist selection, parallel execution, result aggregation, conflict resolution, final synthesis`; orchestration mechanism replaceable, not yet full intelligence.
- **Background-agent integration:** reuses `core/background-job.ts` and `kernel` TTL/cap (1h/500) + sweep; persistent jobs with cancellation/retry/recovery/ownership.
- **Session integration:** session provides identity/persistence/history/resumability; agent provides execution behavior; no duplicate state ownership (SessionV2 remains kernel).
- **Cancellation:** propagates `User→Session→Agent→Turn→Step→Model→Tool→Subagent→BackgroundJob` — no orphaned execution (verified via abort→ping 1→0 in prior cert).
- **Checkpoint & resume:** captures `agentId, turnId, stepId, context, tool results` sufficient to resume without duplicate side effects; tested via `process kill / provider failure / tool failure / cancellation / restart / resume`.

