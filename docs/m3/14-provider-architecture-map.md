# M3 — Provider Architecture Map

Target: `Agent → Model Resolution → Provider Registry → Provider Plugin → Transport → External Model`

Core contains no provider-specific logic; it consumes `ProviderRegistry` + `ModelRegistry` via canonical contracts. Transport and credential boundaries are shared services; adapters normalize provider-specific request/response shapes before core sees them.

