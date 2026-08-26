# M0.10 — Performance Baseline

> Machine-readable: `harness/m0/performance-baseline.json`. Captured 2026-08-26 on Windows x64, hardened build `0.0.0-harden-production-202608260440`.

## 1. Measured values (frozen datum)

| Metric | Value | Method |
|---|---|---|
| CLI `help` | 4,686 chars | spawn built binary |
| CLI `--version` | `0.0.0-harden-production-*` | spawn |
| Server cold start (listen → health) | p50 ~0.7 ms (health) under zero load; file pipeline p50 19.7 ms @c1 | load-cert.ts |
| Throughput `/global/health` | 427 RPS @c1 → 2,938 RPS @c250, p99 139 ms @c250, 0 errors | load-cert.ts stages |
| Throughput `/file?path=.` | 18 RPS @c1 → 390 RPS @c100, p95 319 ms @c100 | same |
| Soak 240 s mixed workload | 10,518 ops / 0 err, WS 483→468 MB (GC sawtooth), handles/threads flat | soak.ps1 |
| Soak 480 s mixed (+session creates) | 2,120 ops / 0 err, handles 292→290, threads 31→29 | 8-min soak phase |
| Release artifact | 168.6 MB exe, SHA256 `9FE1D8F4E6C6356C55C9AB41A7BB05331D66A7B58B9CB08B0B1FBCEC3182532E` | standalone copy run |

Cold-start wall time and RSS were not isolated per phase (baseline run lumped `bun --version` + install). Memory/CPU via `Get-Process WorkingSet/PrivateMemory` sampling as shown.

## 2. How to regenerate

```bash
bun harness/m0/performance-baseline.ts   # re-runs the four measurements and overwrites the JSON
```

CI compares `performance-baseline.json` with tolerance: throughput ±15%, p95 ±20%, WS delta ±20 MB. Exceeding tolerance fails the gate (see `15-migration-safety-gates.md`).

## 3. What it gates

Any plugin-era change that regresses startup by >5% (M0–M4 budget), adds > sub-percent steady-state overhead beyond the lazy-mount discipline (10 §3), or leaks handles/threads in soak is a blocking regression.

