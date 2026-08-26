# M0.5 — Golden-Master Suite (Behavior Snapshots)

> Executable harness: `harness/m0/golden-master.test.ts` + fixtures in `harness/m0/fixtures/golden/`.
> Purpose: snapshot *behavior*, not pixels. Future phases compare against these goldens.

## 1. Coverage (behavioral dimensions)

| Dimension | Golden | Capture method | Assertion |
|---|---|---|---|
| **CLI** `help` | `opencode --help` stdout (4686 chars, contains `run`+`serve`) | `harness/m0/cli-help.ts` spawns built binary | exact string diff |
| **CLI** `version` | `opencode --version` → `0.0.0-<channel>-<ts>` | same harness | regex `0\.0\.0-` |
| **CLI** `run --model nonexistent` | structured error, exit 1 | spawn harness | `exitCode==1 && stderr contains "Error"` |
| **CLI** `upgrade` | help text contains upgrade sources | spawn harness | contains |
| **Server** `/global/health` | `{"healthy":true}` | http harness vs live binary | json match |
| **Server** `/session` create/list/get/404 | lifecycle | http harness (existing `COMPATIBILITY-HARNESS.md` suite) | status codes |
| **Server** `file` containment | `..` → 400 `InvalidRequestError`, not 500 | http harness injection battery (18/18 pass) | code 400 |
| **Server** embedded UI catch-all | `GET /nonexistent` → 200 html | http harness | content-type html |
| **Agent** | complex task `taskflow` bug → fix → 2 pass | `cert-project` transcript (02 cert evidence) | git diff + test output |
| **Provider** | retry through `Service Unavailable` | log grep `stream error` + recovery | stream resumes |
| **Tool** | bash/read/write/edit/glob/grep outputs bounded | tool harness battery (§7) | status + caps |
| **UI** | not pixel — slot registry dump | TUI `feature-plugins/builtins.ts` + app route table | registry snapshot |

## 2. Storage format

- `fixtures/golden/cli-help.txt` (committed)
- `fixtures/golden/health.json` (committed template; `version` field wildcarded)
- `fixtures/golden/session-lifecycle.jsonl` (recorded HTTP transcript via `http-recorder`)
- `fixtures/golden/agent-taskflow.diff` + `agent-taskflow.json` (captured 02 run)

All fixtures committed; harness loads them and diffs live behavior with `expect(received).toEqual(golden)` or wildcard matchers for timestamps/ids.

## 3. Run

```bash
bun test harness/m0/golden-master.test.ts   # fast, no LLM (provider mocked via http-recorder cassettes)
bun test harness/m0/golden-master.test.ts -- --live   # opt-in live provider check (requires OPENCODE_AUTH_CONTENT)
```

## 4. Freeze rule

Goldens are committed on `harden-production`. Any intentional behavior change must update goldens in the same PR with reviewer approval; unintentional drift fails CI (see `15-migration-safety-gates.md`).

