# M5 — Agent Contracts (Runtime, Instance, Turn, Step)

> Implementations: `packages/kernel/src/agents/agent-contract.ts`, `agent-instance-model.ts`, `agent-turn-contract.ts`, `agent-step-contract.ts`

- **Runtime contract:** `AgentRuntime {id, version, capabilities, execute}` with `AgentInput/Output` — separates Agent Definition / Runtime / Session / Policy / Provider / Tool / Context.
- **Instance lifecycle:** `PENDING→INITIALIZING→RUNNING→WAITING→PAUSED→CANCELLING→COMPLETING→COMPLETED` plus `FAILED/QUARANTINED` with `VALID_TRANSITIONS` map — no ambiguous stuck state.
- **Turn contract:** `Turn {id, agentId, status, steps}` with observable transitions `pending→running→completed|failed|cancelled`.
- **Step contract:** `Step {id, agentId, parentTask, timestamp, input, action, output, status, error, retryState, provenance}` — persisted/recoverable.

All contracts are versioned (`KERNEL_AGENT_API_VERSION=1`) and used by registry/loader.

