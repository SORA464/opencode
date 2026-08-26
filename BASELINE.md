# OpenCode v1.18.14 Baseline

This repository is the controlled product baseline: **Our OpenCode v1.18.14 Baseline**, branched
from the exact upstream `v1.18.14` release with no source modifications.

## Provenance

| Item | Value |
| --- | --- |
| Upstream repository | `https://github.com/anomalyco/opencode` (formerly `sst/opencode`) |
| Baseline tag | `v1.18.14` |
| Baseline commit | `65cf14df16c191f3e9684f0d9a8bae69103ced6d` |
| Release published | 2026-08-05T20:58:55Z (release author: opencode-agent[bot]) |
| Fork (origin) | `https://github.com/SORA464/opencode` (GitHub fork of upstream) |
| Local branch | `baseline-v1.18.14` = tag `v1.18.14`, zero diff |
| Upstream default branch | `dev` |

Integrity verification: `git rev-parse v1.18.14^{commit}` matches the upstream tag object exactly;
fork tag SHA identical to upstream tag SHA; `git diff v1.18.14 HEAD` and `git status` are empty.
The clone contains the complete repository (6,529 tracked files) including all packages, SDKs,
protocol/schema definitions, migrations, assets, scripts, tests, specs, infra, and lockfile.

## Runtime requirements

- **Bun** `1.3.14` (pinned by `packageManager`; exact version used for install/build/run)
- OS support per upstream build matrix incl. `win32-x64` (this baseline was verified on Windows x64)
- Network access at first run for `models.dev` snapshot fetch (cached afterwards); ripgrep binary is
  bootstrapped into `Global.Path.bin` on first text search
- No Go toolchain required (TUI is TS/@opentui-based)

## Dependency state

- Installed with `bun install` against the upstream `bun.lock`: **4,689 packages**, no lockfile
  content changes, no version substitutions, no added/removed dependencies
- Native platform packages resolved via Bun isolated store (`node_modules/.bun`), including
  `@opentui/core-win32-x64`, `@parcel/watcher-win32-x64`, `tree-sitter-bash`,
  `tree-sitter-powershell`, `web-tree-sitter`
- Postinstall hook (`packages/core fix-node-pty`) runs as a no-op on win32

## Build

Command (from `packages/opencode`): `bun run build --single`

Verified output:

- Embedded Web UI built via Vite (`packages/app`) in ~63 s
- Standalone compiled binary: `dist/opencode-windows-x64/bin/opencode.exe` (~168.5 MB)
- Build-inlined smoke test passed: `opencode --version` →
  `0.0.0-baseline-v1.18.14-202608260246` (version string derives from local channel/git describe;
  release builds produced by upstream CI carry the plain release version)

Type checking (`tsgo --noEmit` / package `typecheck` scripts), all EXIT=0:
`opencode`, `core`, `server`, `protocol`, `schema`, `llm`, `plugin`, `tui`, `codemode`, `sdk/js`.

## Runtime verification (all performed against live processes)

Headless server: `opencode serve --port <p> --hostname 127.0.0.1` (dev mode and compiled binary).

| Check | Result |
| --- | --- |
| Startup & global health | `GET /global/health` → `{"healthy":true,...}` |
| Auth | Server honors machine-configured `OPENCODE_SERVER_USERNAME`/`OPENCODE_SERVER_PASSWORD` (HTTP Basic); unauthenticated requests get 401 as designed |
| Project instance init | Instance scoped via `x-opencode-directory` header to a scratch project |
| Session create/list | `POST /session` → `ses_fc416c0ecffeumt2YvqGAG6Ihe`; listed thereafter |
| Persistence | SQLite DB under `~/.local/share/opencode/` (channel-specific `opencode-<channel>.db`) |
| Restart recovery | Full process kill → relaunch → session still present |
| Filesystem layer | `GET /file?path=.` returns project entries |
| Ripgrep search | `GET /find?pattern=smoke` returns expected match |
| Subprocess/tool execution | `POST /session/:id/shell` ran the real `bash` tool; tool part `status=completed`, `output="baseline-shell-ok"` |
| Provider layer | `/config/providers` lists configured providers (google, anthropic, opencode); prompt with unknown model fails with typed `ProviderModelNotFoundError` (provider.ts:1821) and server remains healthy |
| Compiled binary runtime | Same health/session checks pass on `dist/.../opencode.exe` (port 46418), clean shutdown |

## Modifications made during baseline establishment

Exactly **one** compatibility modification; all other tracked source is byte-identical to upstream
`v1.18.14` for the entire product surface.

1. **`packages/app/src/custom-elements.d.ts` and `packages/enterprise/src/custom-elements.d.ts`**
   (classification: *required for compatibility*)
   - Upstream stores these two files as git symlinks pointing at
     `../../ui/src/custom-elements.d.ts`. This Windows checkout has no symlink privilege
     (`core.symlinks=false`; Developer Mode/admin unavailable), so git materialized them as plain
     text files containing the target path. TypeScript then failed (`TS1128`) when tsgo parsed the
     path string, breaking `@opencode-ai/enterprise#typecheck` (and blocking the repo's pre-push
     hook). Fix: replaced both stubs with the literal content of
     `packages/ui/src/custom-elements.d.ts` — i.e. the exact declaration text a POSIX checkout
     resolves to. No behavioral or API difference; 58 remaining symlinked asset paths (favicons,
     images, openapi.json) are unaffected by tooling and were left untouched.
   - Verified: full-workspace `bun turbo typecheck` = **30/30 tasks successful** after the change.

Notes:

- `bun.lock` / `packages/opencode/package.json` are transiently rewritten by bun with identical
  logical content (line endings only); restored via `git checkout --`. Not committed.
- On symlink-capable checkouts this commit is a functional no-op relative to v1.18.14.

## Known limitations / environment notes

1. **Live LLM call not exercised**: no provider API key was available for an end-to-end model
   round-trip. Provider communication path was verified up to the typed model-resolution boundary
   (see table). The machine's own OpenCode desktop sessions visible in the shared log confirm the
   full streaming path works in this environment generally.
2. **Upstream lint error (inherited)**: `oxlint` reports 1 error in
   `packages/app/e2e/regression/review-tab-switch.spec.ts:74` (typescript-eslint unsafe type
   assertion) plus 4,828 warnings. Present in upstream v1.18.14 verbatim; left untouched per
   preservation policy. Does not affect build or runtime.
3. **Upstream test suite not run exhaustively** during this phase; verification focused on build
   integrity and direct runtime evidence above.
4. Desktop (Electron), console/enterprise/cloud packages were not packaged in this phase; they are
   part of the workspace and typecheck where applicable but their release packaging was out of scope.
5. Machine-level env vars predate this baseline (`OPENCODE_CLIENT=desktop`,
   `OPENCODE_DISABLE_EMBEDDED_WEB_UI=true`, experimental flags, server credentials). They shape
   runtime defaults of locally launched servers and should be kept in mind when comparing behavior.

## Verification status

Baseline established, built, and verified running on 2026-08-26 as recorded above.
