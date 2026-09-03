# Baseline environment — OpenCode v1.18.27

Checkout date (UTC): 2026-09-03
Machine role: baseline build/validation host (Windows-first, per §19)

## OS / hardware

- OS: Microsoft Windows 11 Home Single Language, 64-bit (Build 10.0.26100.9278)
- Architecture: x64 (process.arch=x64, process.platform=win32)
- CPU: AMD Ryzen AI 7 350 w/ Radeon 860M, 8 cores / 16 logical processors
- RAM: 15853420 KB total visible (~15.1 GiB)
- Disk (C:): Size 509662793728 bytes (~474.7 GiB), Free 58896760832 bytes (~54.9 GiB) at inspection time
- Shell: Windows PowerShell 5.1.26100.9278 (Desktop edition), CLR 4.0.30319.42000
- Workspace: `C:\ESTERION 3DAYS` (note: path contains a space — relevant for Windows path-handling validation §13)
- Baseline repo: `C:\ESTERION 3DAYS\opencode` on branch `baseline/opencode-v1.18.27`

## Toolchain (exact, at inspection)

- Git: 2.54.0.windows.1
- Bun: 1.3.14+0d9b296af (packageManager pin in package.json: `bun@1.3.14`) ✅ matches
- Node: v24.18.0 (x64 win32)
- npm: 11.18.0
- pnpm: 11.12.0
- Python: 3.11.9 (also present: 3.10, 3.9, 3.12, 3.13 via separate installs; `python` resolves to 3.11.9)
- Java: openjdk 21.0.11 LTS (Microsoft build 21.0.11+10-LTS)
- Go: go1.26.4 windows/amd64
- Rust: cargo 1.96.0 / rustc 1.96.0
- GitHub CLI: gh 2.95.0 (logged in as SORA464, scopes: gist, read:org, repo, workflow)
- Docker: NOT AVAILABLE (`docker` not recognized) — container-based validation not possible locally
- gcc: NOT AVAILABLE natively (Windows host; build relies on Bun/Node prebuilds, node-pty fix script, no gcc needed)
- jq: available via WinGet package path; protoc (protobuf) available via WinGet path; ninja available; cmake 4.x at `C:\Program Files\CMake\bin`; 7-Zip available

## PATH (abridged, secrets excluded)

JDK 21, System32, OpenSSH, Git cmd, nodejs, SQL Server tools, dotnet, Go, CMake, Git LFS, gh, Python 3.11/3.10/3.9/3.12/3.13 + launcher, cargo, pnpm, WindowsApps, npm roaming, bun (`~/.bun/bin`), dotnet tools, go bin, ninja, 7-Zip, pkg-config-lite, protobuf, jq, LMStudio bin, cursor bin.

No secrets recorded here per §2/§22.

## Reproducibility notes

- Package manager for this repo is Bun (bun.lock, 882925 bytes). Do NOT substitute npm/pnpm.
- `bunfig.toml`: `exact=true`, `minimumReleaseAge=259200` (3 days) with excludes for fast-moving AI/native packages.
- Root `test` script guards against running tests from root (`do-not-run-tests-from-root`); run tests from package dirs.
- Root scripts of interest: `dev`, `lint` (oxlint), `typecheck` (bun turbo typecheck), `postinstall` (core fix-node-pty).
- Docker absent: `containers` package and any docker-dependent e2e cannot be validated locally — must be classified accordingly, not marked PASS.
- Workspace path contains a space: keep this path for at least one full install/build/test cycle to prove Windows space handling; do not silently relocate to a space-free path.
