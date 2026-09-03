# Baseline validation — OpenCode v1.18.27

Date: 2026-09-03. Host: Windows 11 x64 (see `environment.md`).
Upstream: `anomalyco/opencode` tag `v1.18.27` (`4b7e19e3`). Branch:
`baseline/opencode-v1.18.27`. Fork: `SORA464/opencode` (`origin`).

Conventions: PASS = evidence below. FAIL = reproduced + root-caused, with
classification. N/A = surface does not exist or genuinely not applicable.
`turbo-gated` = part of upstream CI (`test.yml` / `typecheck.yml`).

Host caveat: this box runs OneDrive sync, Everything indexer, Opera, and two
foreign `opencode` server processes during validation. Several failures are
timing margins attributable to that load (functional assertions pass; upstream
CI Windows passes). Evidence per row.

## Validation matrix

| Area | Test | Result | Evidence |
|------|------|--------|----------|
| Install | `bun install` clean | PASS | 4683 pkgs/116 s; after `bun pm cache rm` + full `node_modules` purge: 4683 pkgs/288 s, `bun.lock` sha256 identical (`486c7984…7730c573`), 0/8217 store version mismatches |
| Install | lockfile integrity | PASS | sha256(`bun.lock` CRLF-normalized) unchanged across 4 installs + 3 builds |
| Build | `opencode` binary (12 targets) | PASS | `script/build.ts`: linux/darwin/windows × arm64/x64 × musl/baseline all built; built-in smoke tests passed (`0.0.0-baseline/opencode-v1.18.27-202609030629`) |
| Build | `cli` (12 targets) | PASS (sequential) | Failed under parallel `turbo build` (concurrent `bun add` race, missing `@opentui/core-linux-arm64` link); green standalone, all 12 `dist/cli-*` produced |
| Build | desktop (`electron-vite`) | PASS (sequential) | `prebuild` (icons/metainfo/node-server/CLI download) + `electron-vite build` → `✓ built in 59.72s`. Parallel failure was registry socket storm only |
| Build | web (`astro`) | PASS | `astro build`, 648 pages indexed, sitemap created |
| Build | app (`vite`) | PASS | Production bundle built |
| Build | ui (`tsc`), plugin (`tsc`), http-recorder, sdk, storybook | PASS | All green in `turbo build` |
| Build | enterprise / console-app / stats-app (`vite`) | FAIL (upstream, Windows-only) | Deterministic. Root cause: `@solidjs/start` PR-preview dep (`pkg.pr.new/@solidjs/start@dfb2020`): (1) `` `import … from "${normalize(fileURLToPath(...))}"` `` keeps `\` → Rollup unresolvable import; (2) manual `"${path}"` vite defines instead of `JSON.stringify` → `Invalid define value` for `C:\…` paths. Fails on ALL Windows checkouts (space not required). NOT built by release CI (`publish.yml` builds only binaries + desktop) and NOT covered by test CI. No source change (would require patching third-party preview dep + lockfile rewrite; Linux SST deploy path unverifiable here) |
| Typecheck | `bun turbo typecheck` | PASS | 30/30 packages (after repo-local `core.symlinks=true` fix + cache purge; initial enterprise TS1128 + ~200 `github-copilot` errors both environment-caused, see `changes.md`) |
| Lint | `bun run lint` | FAIL (upstream, non-gated) | 1 error: oxlint octal-escape false positive on Tailwind `content-['\200B']` (`packages/session-ui/.../prompt-input/index.tsx`); 4886 warnings = repo normal state. No CI workflow gates lint. Source untouched |
| Unit (gated) | core | PASS | 1091 pass / 7 skip / 0 fail (1098 tests, 143 files, clean env). Initial 3 fails root-caused to env (PATH 九州 echo shim, `OPENCODE_CLIENT=desktop` contamination, load flake) and re-verified green |
| Unit (gated) | opencode | PASS w/ 4 latency FAILs | 3587 pass total (shards A–E). FAILs, all timing margins on loaded host, functional asserts green: `serves search endpoints` (5 s poll vs ~9 s cold scan; probe proves results arrive at ~10 s; also passes with fff forced), `Server.listen reuse` (28.8 s vs 30 s, passes solo), `compaction <250 ms` (315/395 ms; interrupt semantics correct), `acp stdin EOF` (6.4 s cold `bun run` boot vs 5 s; exits 0) |
| Unit (gated) | app unit / browser | PASS | 724/0 (103 files), 41/0 (14 files) |
| Unit (gated) | ui / session-ui / function | PASS | 27/0, 83/0, 5/0 |
| Unit (non-gated) | tui | 192 pass / 1 FAIL (upstream) | `abbreviateHome` uses `path.sep`, test expects `/`; deterministic on all Windows; identical on upstream `dev`; `tui#test` NOT in `turbo test` graph (dry-run verified) |
| Unit (non-gated) | llm | PASS | 298 pass / 30 skip / 0 fail |
| Unit (non-gated) | client + `check:generated` | PASS | 16/0; generate→diff clean |
| Unit (non-gated) | sdk-next | 4 pass / 1 FAIL (Windows cleanup race) | Test body green; `finally rm()` hits transient EBUSY (open `opencode.sqlite` handle); dir deletable right after. `sdk-next#test` not in graph |
| Unit (non-gated) | http-recorder / effect-drizzle-sqlite / codemode | PASS | 33/0, 7/0, 263/0 |
| Unit (non-gated) | httpapi-codegen | 63 pass / 3 FAIL (upstream Windows) | 2× POSIX-path test assumptions (`\` vs `/`); 1× space-triggered (`new URL(...).pathname` keeps `%20` + leading `/`) — our space-path checkout caught it. Not in graph |
| Unit (non-gated) | desktop | 71 pass / 1 FAIL+1 err (toolchain) | `draft-store.test.ts` can't load: Bun runner lacks `node:sqlite` on Windows (present in Node 24 + Electron). WSL tests 12/12 pass. Not in graph |
| Integration | Playwright app e2e (CI-gated on Windows) | PASS | 106/106 in 3.4 min (chromium 1217, `CI=true`); smoke subset 4 passed + 1 flaky-pass |
| Integration | `test:httpapi` coverage / auth | PASS | 208/208 fail=0 skip=0 missing=0 extra=0 in BOTH modes on Windows |
| Integration | `test:httpapi` effect | 206/208 | 2 FAILs are POSIX-only scenarios (`/bin/sh -c "sleep 30"`); exerciser is Linux-gated upstream |
| CLI | version/help/models/providers | PASS | `0.0.0-baseline/…`, full command list, deepinfra catalog, `mcp list` |
| CLI | `run` / session | PASS | `session list --format json` shows 4 probe sessions; `export` full transcript (tokens/cost/parentID) |
| Desktop | launch/packaging | NOT VERIFIED | Build passes; launch + `electron-builder` packaging not attempted (display installer flow; CI packages on release runners). Honest gap |
| Web | served UI | PASS | `serve` serves embedded app shell (200 HTML); `astro build` passes. `vite dev` not run |
| Provider | auth + model discovery | PASS | deepinfra via stored `auth.json` (never exposed); `models deepinfra` lists catalog |
| Provider | real request / streaming / multi-turn | PASS | `DeepSeek-V3.2`: exact `BASELINE_OK`; `-c` continuation recalled it (input 38/output 5, cache-assisted) |
| Agent | end-to-end build→break→fix→green | PASS | list→read→write×2→`node --test` fail (-1≠5)→edit(diff)→pass; total session cost $0.003 |
| Tools | read/write/edit/shell/git | PASS | Above + probe git ops (init/status/add/commit/log/branch/switch/delete) |
| Tools | glob/grep/LSP/subagent | PASS (auto) + subagent live | findText/findSymbol HTTP pass; `lsp` suite green in shard D; live Explore subagent returned file content |
| MCP | real stdio server | PASS | config→connect (`mcp list ✓ probe`)→discover→invoke `probe_probe_echo`→`BASELINE_MCP:MCP_BASELINE`; automated `test/mcp/*` green; OAuth N/A (no OAuth server available) |
| Plugin | disposable native plugin | PASS | discovery→load→`baseline_ping`→`BASELINE_PLUGIN_PONG`; automated plugin tests green |
| Session | persist/continue/export | PASS | Cross-invocation `-c` continue; JSON list/export; cost ledger |
| Recovery | stop/restart | PASS | `serve` stop→port closed→restart→listening. Graceful-SIGTERM path not exercised (SIGKILL used); interrupted-request recovery not exercised — partial |
| Git | workflow | PASS | Disposable repo: all ops green; agent operated inside git repo |
| Database | fresh init/migration | PASS | Isolated XDG dirs → `.db`+shm+wal created, `models.json` cached, log written; restart-safe |
| Security | secret scan | PASS | 2 placeholder hits only (`sk-ant-api03-1234567890` README example, `xoxb-your-bot-token` `.env.example`); no `.env`/keys in repo; baseline docs clean; `.gitignore` covers secrets |
| Security | OSV audit | RECORDED | 302 known vulns in locked deps (4 Critical, e.g. fast-xml-parser 9.x, tar, form-data). No upgrades per §21; hardening-phase input |
| Security | credential handling | PASS w/ 1 disclosure | Provider test used pre-existing user `auth.json` via the binary (values never in context/files). Disclosure: global `opencode.jsonc` (localhost-gateway key) was printed into tool transcript once during inspection; never written to files; recommend rotation if sensitive |
| Reproducibility | clean reinstall + rebuild | PASS | Cache purge → fresh install (lockfile hash identical) → typecheck 30/30 → builds. CRLF `git status` noise verified content-identical (`--ignore-cr-at-eol --numstat` empty); tree restored clean |

## Cross-platform statement (per §19)

- Verified on this machine: Windows 11 x64 only.
- Verified through upstream CI at release (`anomalyco/opencode` run
  33686467537, 2026-09-02): `unit (windows)` PASS, `e2e (windows)` PASS,
  `e2e (linux)` PASS, `unit (linux)` FAIL (1 test:
  `opencode run … model is unknown`, timing).
- Linux/macOS local runs: NOT performed. Never represent them as tested.

## Known limitations carried into next phase

1. `enterprise`/`console-app`/`stats-app` production builds fail on
   Windows (upstream `@solidjs/start` preview bug). Linux SST deploy path
   not locally verified.
2. Desktop app launch + installer packaging not exercised.
3. Interactive TUI flows (keybinds, theme picker) need manual verification;
   headless start is clean and `tui` unit tests are 192/193.
4. `OPENCODE_DISABLE_FFF=true` is the Windows default: file `find` uses the
   ripgrep fallback (f
...[truncated 911 chars]