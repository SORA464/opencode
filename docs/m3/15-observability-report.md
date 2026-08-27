# M3 — Observability Report

Every provider plugin has provenance (`provider`, `plugin version`, `model`) tracked in `ProviderRegistry` and `ModelRegistry`. Request lifecycle logs include provider, model, latency, retry count, error kind via `error-normalization`. No secrets are logged.

