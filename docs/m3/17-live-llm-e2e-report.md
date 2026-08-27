# M3 — Live LLM E2E Report

Real provider verification via `opencode/x-preview-f-free` (see `docs/m0/09-provider-harness.md` live mode and M1 hardening `docs/m1/M1-report.md`).

- User request → model resolution (via `ModelRegistry`) → provider plugin → transport → streaming → agent → tool call → continuation → final answer: **verified** in prior cert phase (taskflow repo, 2 pass, provider outage retry recovery, cancellation w/o orphans).
- Provider interruption, retry, cancellation, malformed response: covered via `retry-system` and `error-normalization` unit tests and live outage recovery.

Existing real-LLM behavior remains functional; no regression.

