# M0.9 — Provider Harness

> Executable: `harness/m0/provider.test.ts` + cassettes in `harness/m0/fixtures/provider/`.

## 1. What it protects

- **Request generation**: for each bundled provider (25 loaders), assert the outbound `Request` shape (URL, headers, body schema) against golden cassette.
- **Streaming**: replay `StreamChunk` sequences via http-recorder; assert `assistant/message` final shape.
- **Retries/errors/timeouts/fallback**: inject 429/503/ETIMEDOUT via cassette; assert `SessionRetry` policy emits `status: retry` with `next` timestamp and obeys wall-clock budget (24h default, env-overridable).
- **Model discovery**: `models.dev` catalog fetch mocked; assert `GET /api.json` with correct `User-Agent` and cache TTL.

## 2. Live vs cassette

- Default: cassette playback (deterministic, no credentials).
- `--live` (requires `OPENCODE_AUTH_CONTENT` or `auth.json`): one real streaming call per provider (cheap `x-preview-f-free` fixture) to prove end-to-end wiring; cassette regenerated on demand with `UPDATE_CASSETTES=1`.

## 3. Compatibility promise

Provider abstraction change (M3) must keep cassette diffs empty except for intentionally version-bumped fixtures reviewed in PR.

