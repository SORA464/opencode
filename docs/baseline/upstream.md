# Upstream baseline — OpenCode v1.18.27

## Upstream identity

- Upstream repository: https://github.com/anomalyco/opencode
- Verified: repo exists (203k stars / 26.5k forks observed 2026-09-03), default branch `dev`.
- Intended version: `v1.18.27` (per Rule 1; NOT dev, NOT v2, NOT mirror).
- Tag verification (2026-09-03, via `git ls-remote --tags`):
  - `refs/tags/v1.18.27` → `4b7e19e315cca414121ba1d61523fef74bb3ae8b`
  - Single entry (no `^{}` peel line) — lightweight tag pointing directly at the release commit.
- Commit verification (after `git fetch --tags`, `git rev-parse v1.18.27` + `git log -1`):
  - SHA: `4b7e19e315cca414121ba1d61523fef74bb3ae8b`
  - Author: opencode <opencode@sst.dev>
  - Date: 2026-09-02 21:40:42 +0000
  - Subject: `release: v1.18.27`
- Checkout state at baseline record time:
  - `git status`: clean, `On branch baseline/opencode-v1.18.27`, nothing to commit
  - `git rev-parse HEAD`: `4b7e19e315cca414121ba1d61523fef74bb3ae8b`
  - `git describe --tags --always`: `v1.18.27`
  - Branch `baseline/opencode-v1.18.27` created from tag `v1.18.27` (exact, no drift).

## Remotes

- `upstream = https://github.com/anomalyco/opencode.git` (fetch+push; renamed from `origin` to preserve upstream identity)
- `origin` = (none — intentionally unassigned)
  - Reason: no organization/repository fork destination was provided. Per §4, we do NOT invent one.
  - Local clone is at `C:\ESTERION 3DAYS\opencode`.
  - ACTION REQUIRED FROM USER: provide fork destination (org/account + repo name) to set `origin` and push `baseline/opencode-v1.18.27`.

## Package manager / lockfile / build system

- Package manager: Bun, pinned `bun@1.3.14` in root package.json (`packageManager` field). Installed Bun 1.3.14 ✅.
- Lockfile: `bun.lock` (882925 bytes) at repo root. No package-lock.json / pnpm-lock.yaml.
- Workspace: Bun workspaces (`packages/*`, `packages/console/*`, `packages/stats/*`, `packages/sdk/js`, `packages/slack`) + catalog pins in root package.json.
- Build orchestration: Turbo 2.10.2 (`turbo.json`; tasks: typecheck, build→dist/**, per-package test tasks).
- TypeScript: 5.8.2 catalog + `@typescript/native-preview` tsgo (`tsgo --noEmit` per package; NEVER plain `tsc` except plugin `tsc` build as defined).
- Lint: oxlint (`bun run lint` at root, `.oxlintrc.json`).
- Format: prettier 3.6.2 (`semi:false, printWidth:120`).
- `bunfig.toml`: exact installs, 3-day minimumReleaseAge with excludes.
- `postinstall`: `bun run --cwd packages/core fix-node-pty` (native module fixup — expect native build sensitivity on Windows).
- Trusted deps include esbuild, node-pty, protobufjs, tree-sitter (+bash/powershell), web-tree-sitter, electron.
- Patched deps: 14 entries under `patchedDependencies` (dnd-kit, npm agent, photon-node, openapi, solid-js, ai-sdk xai/mistral/google/groq/anthropic/bedrock/openai-compatible, gcp-metadata, pacote, pierre/trees, MCP sdk, effect, tanstack virtual-core).

## Build commands (upstream-defined, to be used verbatim in §8)

- Install: `bun install` (from repo root, respecting bun.lock; no --force/--legacy-peer-deps)
- Full typecheck: `bun run typecheck` (turbo) or per-package `bun run typecheck`
- Lint: `bun run lint`
- Per-package builds: `packages/opencode`: `bun run build` (script/build.ts); `packages/cli`: `bun run script/build.ts`; `packages/ui`: `tsc -p tsconfig.build.json`; `packages/app`: `vite build`; `packages/web`: `astro build`; `packages/desktop`: `electron-vite build` + `electron-builder` packaging; see §6 audit for full list
- Tests: NEVER from root (guard exits 1). Run from package dirs, e.g. `bun --cwd packages/opencode test`, `bun --cwd packages/core test`, etc. `packages/opencode` also has `test:httpapi` (coverage/auth/effect modes).

## Test commands (upstream-defined)

- `packages/opencode`: `bun test --timeout 30000 --only-failures`
- `packages/core`: `bun test --only-failures`
- `packages/tui`, `packages/llm`, `packages/http-recorder`, `packages/effect-drizzle-sqlite`: variants with `--timeout 30000`
- `packages/app`: unit (happy-dom, solid condition) + browser + playwright e2e
- `packages/client`, `packages/sdk-next`, `packages/httpapi-codegen`, `packages/function`, `packages/ui`, `packages/session-ui`: `bun test` variants
- Typecheck CI: `.github/workflows/typecheck.yml`; Tests CI: `test.yml`; Publish: `publish.yml`; Desktop packaging via electron-builder (win/mac/linux targets in package scripts).

## Known upstream warnings (pre-build, to confirm during install/build)

- Default branch is `dev` (per AGENTS.md); local `main` may not exist — use `dev`/`upstream/dev` for diffs. Our baseline branch intentionally diverges from dev at the v1.18.27 tag.
- AGENTS.md conventions (branch names ≤3 words no slashes, conventional commits, no import aliasing/star imports, Effect-generator binding style, Bun APIs, drizzle snake_case) — relevant only if we must patch source.
- V2 session core notes in AGENTS.md — do NOT redesign; relevant only for understanding session tests.
- `packages/sdk/js` regeneration: `./packages/sdk/js/script/build.ts`; client generation: `bun run generate` from `packages/client` (do not hand-edit generated dirs).
- No `node_modules` at baseline record time (verified absent). No root `docs/` previously (we created `docs/baseline/` for this phase only).
- Upstream tag is 2026-09-02 (yesterday relative to 2026-09-03) — very fresh; expect dependency minimumReleaseAge (3-day) behavior to matter on fresh installs.
