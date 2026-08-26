# M0.7 — Agent Runtime Harness

> Executable: `harness/m0/agent-runtime.test.ts` (uses `http-recorder` cassettes + optional live mode).

## 1. What it captures (repeatable scenarios)

| Scenario | Steps | Oracle |
|---|---|---|
| **Planning** | prompt → observe `agent/pre-step` waterfall | system-prompt assembly contains expected sections |
| **Tool sequence** | complex task (taskflow repo) | tool-call order matches golden transcript (bash→read×3→edit→bash…) |
| **Retry** | inject `503 Service Unavailable` via http-recorder cassette | `status: retry` emitted, then recovery, no duplicate tool execution |
| **Cancellation** | `prompt_async` → `abort` mid-ping | child process count drops to 0, SSE stream closes, session status = error/cancelled |
| **Recovery** | durable inbox row + `SessionExecution.wake` replay | post-crash continuation from inbox row succeeds |
| **No-progress guard** | prompt that would loop without progress | harness asserts loop terminates (covers future watchdog work, currently documents current behavior) |

## 2. Scenarios as code

Each scenario is a `defineScenario({ name, seedRepo, prompt, cassettes?, assert })` that the harness runs against either a recorded provider cassette (deterministic, default) or live `opencode/x-preview-f-free` with `--live`.

## 3. Metrics captured

- Step count, tool calls per step, retry attempts, wall time per turn, final token usage.
- Stored in `harness/m0/fixtures/agent/*.json` for performance baseline comparison (10).

## 4. Relationship to blueprint

This harness is the measurement instrument for the agent-loop seam extraction (Migration M5). Its cassettes become the contract for any replacement loop implementation.

