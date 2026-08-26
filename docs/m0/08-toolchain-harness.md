# M0.8 — Toolchain Harness

> Executable: `harness/m0/toolchain.test.ts` — deterministic per-tool verification.

## 1. Matrix (all production-critical tools)

For each tool the harness runs 6 cases:

| Case | Example (`bash`) |
|---|---|
| valid input | `{command:"echo hi"}` → completed, output="hi" |
| invalid input | `{}` → 400 validation |
| permission gate | `external_directory` path → `ask` flow |
| timeout | `sleep 999` with 1s budget → error, no hang |
| large output | 200k-line payload → truncated, status completed |
| failure | `exit 7` → error status, never false success |

Tools covered: `bash`, `read`, `write`, `edit`, `apply_patch`, `glob`, `grep`, `webfetch`, `websearch` (stubbed), `question`, `skill`, `todowrite`, `task` (subagent depth), `lsp` (flag-gated), `plan_exit`, `code-mode` (experimental).

## 2. Determinism

- Filesystem tools run against `harness/m0/fixtures/repo/` (committed small repo with known files).
- Shell tools use `node -e` payloads (portable, avoids `cmd.exe` quote divergence on Windows — see earlier flake fix in `cross-spawn-spawner.test.ts`).
- Search tools stub ripgrep via `http-recorder` where network would be required.

## 3. What it guards

Any future ToolRegistry re-registration (M2) must keep the 6-case matrix green. The harness also asserts the "definition filtering ≠ execution auth" invariant (registry has no PermissionV2 dep) by checking that a would-be-denied tool is absent from `ToolDefinition` list yet still blocked if called directly.

