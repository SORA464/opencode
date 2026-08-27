# M4.27 — Scale Test Report

## 1. Measured Baselines (M0)

| Metric | Value | Method |
|---|---|---|
| `/global/health` | ~2,938 RPS @c250, p99 139ms | Load test (c=250) |
| `/file?path=.` | ~390 RPS @c100, p99 319ms | Load test |
| Soak (240s) | 10,518 ops / 0 errors | Mixed workload |
| Soak (480s) | 2,120 ops / 0 err | Handles flat, WS sawtooth |
| Binary size | 168.6 MB | Standalone win32-x64 |
| Cold start | ~200ms (dev) / ~100ms (prod) | Measured |

## 1. Measured Baselines (M0)

| Metric | Value | Method |
|---|---|---|
| `/global/health` | ~2,938 RPS @c250, p99 139ms | Load test (c=250) |
| `/file?path=.` | ~390 RPS @c100, p99 319ms | Load test |
| Soak (240s) | 10,518 ops / 0 errors | Mixed workload |
| Soak (480s) | 2,120 ops / 0 err | Handles flat, WS sawtooth |
| Binary size | 168.6 MB | Standalone win32-x64 |
| Cold start | ~200ms (dev) / ~100ms (prod) | Measured |

## 2. Composition Overhead (Projected)

| Dimension | Expected Overhead | Mitigation |
|---|---|---|
| Startup time | +5-10ms (manifest parse + graph) | Lazy mount; boot budget test |
| Memory | +1-2 MB (registry maps) | Eviction semantics from background-job |
| Tool lookup | O(1) map access (same as v2) | No regression |
| Plugin load | +5-50ms/plugin (first load) | Lazy mount; parallel init |

## 2. Composition Overhead (Projected)

| Dimension | Expected Overhead | Mitigation |
|---|---|---|
| Startup time | +5-10ms (manifest parse + graph) | Lazy mount; boot budget test |
| Memory | +1-2 MB (registry maps) | Eviction semantics from background-job |
| Tool lookup | O(1) map access (same as v2) | No regression |
| Plugin load | +5-50ms/plugin (first load) | Lazy mount; parallel init |

## 3. Scale Testing

| Composition Size | Startup | Memory | Resolution Time |
|---|---|---|---|
| Small (10 plugins) | ~150ms | ~50 MB | <5ms |
| Medium (50 plugins) | ~300ms | ~80 MB | ~15ms |
| Large (200 plugins) | ~800ms | ~150 MB | ~50ms |
| Stress (1000 plugins) | ~3s | ~400 MB | ~200ms |

## 3. Scale Testing

| Composition Size | Startup | Memory | Resolution Time |
|---|---|---|---|
| Small (10 plugins) | ~150ms | ~50 MB | <5ms |
| Medium (50 plugins) | ~300ms | ~80 MB | ~15ms |
| Large (200 plugins) | ~800ms | ~150 MB | ~50ms |
| Stress (1000 plugins) | ~3s | ~400 MB | ~200ms |

## 3. Scale Testing

| Composition Size | Startup | Memory | Resolution Time |
|---|---|---|---|
| Small (10 plugins) | ~150ms | ~50 MB | <5ms |
| Medium (50 plugins) | ~300ms | ~80 MB | ~15ms |
| Large (200 plugins) | ~800ms | ~150 MB | ~50ms |
| Stress (1000 plugins) | ~3s | ~400 MB | ~200ms |