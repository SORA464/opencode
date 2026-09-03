# Baseline changes — OpenCode v1.18.27

Branch: `baseline/opencode-v1.18.27` (from tag `v1.18.27` = `4b7e19e3`).
Upstream remote: `upstream = https://github.com/anomalyco/opencode.git`.
Fork remote: `origin = https://github.com/SORA464/opencode.git` (pre-existing fork).

## Tracked source changes

| # | File/module | Problem | Root cause | Fix | Why this fix |
|---|-------------|---------|-----------|-----|--------------|
| 1 | `docs/baseline/environment.md` (new) | Reproducibility info required by §2 | — | Recorded OS/CPU/RAM/disk/toolchain/PATH | Documentation, no behavior change |
| 2 | `docs/baseline/upstream.md` (new) | Traceability required by §5 | — | Recorded repo/tag/SHA/remotes/package-manager/scripts | Documentation, no behavior change |
| 3 | `docs/baseline/changes.md` (new, this file) | Change log required by §28 | — | This table | Documentation |
| 4 | `docs/baseline/validation.md` (new) | Validation matrix required by §24 | — | Full matrix + evidence | Documentation |

**No upstream source file was modified.** `git diff HEAD --stat` for tracked
source files is empty (verified 2026-09-03; remaining `git status` noise is
CRLF normalization from `core.autocrlf=true`, content-identical).

## Environment-only fixes (no repo changes)

These were applied to the machine/repo-local state, not to tracked files:

1. **Git symlinks on Windows** — `git config core.symlinks true` (repo-local)
   + re-checked-out all 60 `120000`-mode paths as real symlinks.
   Symptom: `@opencode-ai/enterprise#typecheck` failed with
   `TS1128` on `packages/enterprise/src/custom-elements.d.ts` (symlink
   materialized as a text file). Windows Developer Mode is enabled, so
   symlinks work. Required for any Windows checkout of this repo.
2. **Poisoned global Bun cache** — `bun pm cache rm` (deleted
   `~/.bun/install/cache`, ~6k entries, several stale since 2026-06-28),
   deleted every `node_modules` dir in the repo, fresh `bun install`.
   Symptom: `packages/core/node_modules/@ai-sdk/provider-utils` resolved to
   **4.0.21 content inside a 4.0.23-labelled directory** (verified against the
   genuine npm tarball, which is correct). 12 store entries had
   version/content mismatches. Effect: ~200 TS2339/TS18046/TS7006 errors in
   `packages/core/src/github-copilot/*` across 6 packages. After purge +
   reinstall: mismatch scan 0/8217, `bun.lock` content hash unchanged
   (`486c7984…7730c573`), typecheck 30/30.
3. **Test PATH** — prepended `C:\Program Files\Git\usr\bin` for test runs.
   Symptom: `cross-spawn` echo test got cmd-shim-quoted output because no
   real `echo.exe` was on PATH. Matches upstream CI Windows runners (Git
   Bash `usr/bin` on PATH).
4. **Test env hygiene** — stripped ambient `OPENCODE_*` vars for suite runs.
   Symptom: `OPENCODE_CLIENT=desktop` (leaked from this machine's global env)
   broke `models.test.ts` userAgent assertion (`/cli` expected).

## Deliberately NOT changed

- `bun.lock`: content hash identical before/after all installs and builds.
  (`git status` shows `M bun.lock` from CRLF normalization only.)
- Dependencies: no upgrades, no overrides, no new patches. OSV audit finds
  302 known vulns inherited from the upstream lockfile (4 Critical) —
  recorded in `validation.md`; upgrades deferred to a hardening phase per
  dependency policy (§21).
- Lint: 1 pre-existing upstream oxlint error
  (`packages/session-ui/.../prompt-input/index.tsx` Tailwind `'\200B'`
  misread as octal escape) + 4886 warnings. No CI gate references lint.
  Left untouched (would require editing upstream UI source for a
  linter false positive).
- `packages/{enterprise,console/app,stats/app}` Windows `vite build`
  failures: root-caused to the `@solidjs/start` PR-preview dependency
  (`https://pkg.pr.new/@solidjs/start@dfb2020`) embedding raw Windows paths
  into generated JS (`normalize(fileURLToPath(...))` without slash
  conversion; manual `"${path}"` defines instead of `JSON.stringify`).
  These packages are NOT built by release CI (`publish.yml` builds only
  `opencode`+`cli` binaries and desktop via `prepare`+electron-builder) and
  NOT covered by test CI. Patching the third-party preview dep (which would
  rewrite `bun.lock`) was judged out of scope for the baseline; documented
  in `validation.md`.
- Non-gated unit-test failures, all root-caused, none fixed in source:
  - `tui` `abbreviateHome` (uses `path.sep`, test expects `/`;
    identical on upstream `dev`; `tui#test` not in `turbo test` graph).
  - `sdk-next` `embedded …` EBUSY on `rm` (transient SQLite handle,
    Windows-only; `sdk-next#test` not in graph).
  - `httpapi-codegen` 3× POSIX-path assumptions in tests, one
    space-triggered (`new URL(...).pathname` keeps `%20`;
    `httpapi-codegen#test` not in graph).
  - `desktop` `draft-store.test.ts` (`node:sqlite` missing from the Bun
    test runner on Windows; present in Electron/Node; `desktop#test` not
    in graph).
- Timing-margin failures on this loaded host (all functional assertions
  pass; CI Windows passes): `serves search endpoints` (5 s poll vs ~9 s
  cold scan), `HttpApi Server.listen … reuse …` (28.8 s vs 30 s),
  `compaction … <250 ms` (315/395 ms), `acp stdin EOF` (6.4 s boot vs
  5 s). Evidence in `validation.md`.
- `test:httpapi` effect mode: 206/208 pass; the 2 failures are POSIX-only
  scenarios (`/bin/sh -c "sleep 30"`). Upstream gates this exerciser on
  Linux only. Coverage and auth modes: 208/208 on Windows.
