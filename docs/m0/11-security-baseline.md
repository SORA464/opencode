# M0.11 — Security Baseline

> Executable checks: `harness/m0/security.test.ts` (permission, containment, auth, supply-chain).

## 1. Captured expectations (must hold for any future architecture)

| Boundary | Expectation | Verification |
|---|---|---|
| **Auth** | unauth → 401 on every non-public route; bad password → 401; `auth_token` query param works for browser transports | injection battery 18/18 (harden phase) |
| **File containment** | `..`, absolute outside, UNC/drive-letter → 400 `InvalidRequestError` (never 500) | same battery: `traversal-relative` etc. 400, zero leak |
| **Session isolation** | one `x-opencode-directory` cannot read another's session via direct id without that directory's auth+path | cross-tenant attempt harness (future SaaS seam: expected 403/404) |
| **Tool permission** | `bash` on external dir triggers `ask` | toolchain harness external_directory case |
| **Credential handling** | `Redacted` wrappers; no secret appears in logs, errors, URLs (except intentional `auth_token` transport), telemetry, or DB | gitleaks + harness `credential-leak.test.ts` fixture |
| **Taint source** | env-var sprawl enumerated: Flag holds ~30, tail documented in 03-D2 (AUTH_CONTENT, RETRY_BUDGET_MS, ALLOW_UNAUTHENTICATED_REMOTE, …) | inventory enumerates; Flag sweep in M0 guardrail debt |

## 2. Supply-chain baseline (as of 2026-08-26)

- OSV scan: 62 pkgs / 200 vulns (2 Critical fast-xml-parser across majors — pinned inside AWS SDK, documented accepted risk for hosted SaaS tier; runtime-reachable clusters patched: hono, seroval, ws, dompurify, vite, tar, axios, builder-util-runtime, minimatch, valibot, diff).
- Fetched artifacts pinned: ripgrep version parameterized; ESLint zip from moving `main` branch remains the one unpinned source — flagged supply-chain high, to be pinned in M0 guardrail debt.

## 3. Future security regression harness

`harness/m0/security.test.ts` re-runs the above matrix on every PR. A new plugin that bypasses SEP (kernel-enforced permission check) fails via import-audit: `rg "permission/internal" -- packages/bundles` must return zero matches (enforced in `15-migration-safety-gates.md`).

## 4. Boundary evolution rule

Any new capability that needs a privileged operation must *request* it through the kernel SEP; direct import of `fs`, `child_process`, or credential stores outside kernel is a blocking review finding.

