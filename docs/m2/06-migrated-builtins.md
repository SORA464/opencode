# M2.6 — Built-in Tool Migration (Incremental)

> Implementation: `packages/kernel/src/tools/builtins/` (thin wrappers re-exporting `core` tools).

**Priority order executed in M2:**

1. **Filesystem/Read** — `read` as plugin, V1 read shim, both registries green. Verified via `read` paging test.
2. **Write/Edit** — shared `edit` permission family preserved; per-path Semaphore leak noted for hardening (M2.10 will replace with `KeyedMutex`).
3. **Search** — `glob`/`grep` with ripgrep dep declared.
4. **Shell** — `bash` with caps (120s/600s, 1MB) preserved; V1 `shell` retained as compat.
5. **Execution (task)** — **deferred to M5** (needs agent loop seam).
6. **Remaining** — `webfetch`, `websearch`, `skill`, `question`, `todowrite` as plugin specs, flag-gated where experimental.

**One family per PR rule:** Each migration is a single commit that adds the kernel manifest + wrapper, runs `harness/m0/toolchain.test.ts` 6-case matrix, and keeps the old V1 tool behind a feature flag for one release.

**Current M2 state:** Wrappers for `read, write, edit, glob, grep, bash` exist as `packages/kernel/src/tools/builtins/index.ts` re-exports. Full cutover to kernel registry as authoritative source is M4.

