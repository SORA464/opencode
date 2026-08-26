# 08 — Connector Ecosystem & SDK Architecture

## 1. Tiered SDKs

| SDK | Audience | Contents |
|---|---|---|
| **Extension SDK** (`@opencode-ai/plugin`, evolves existing v2 surface) | tool/auth/agent/UI authors | `apply(ctx)` kernel API: service lookup, typed events, waterfalls, UI registries, config schema, storage facade, logger. Already partially shipped — this is an evolution, not a rewrite |
| **Connector SDK** (thin layer over Extension SDK) | integration authors (SaaS tools: Jira, Linear, monitoring…) | opinionated bases: `defineConnector({ auth, resources, actions, webhooks })` compiling to tools+commands+auth flow + status surface (MCP-pipeline precedent generalized) |
| **Client SDK** (`sdk/js`, `client`, `sdk-next`) | app/embedding authors | unchanged role; regenerated from protocol; sdk-next composes client+core+server for embedded scenarios |
| **Bundle CLI** | packagers | scaffold, validate manifest, pack bundle, sign (later), publish |

## 2. Runtime APIs surfaced to plugins (stability tiers)

- **Stable (v1 guarantee)**: tools registry, commands, events (durable+live), config access,
  storage facade, logger, UI slots/routes/settings, http client w/ recorder support.
- **Stable-with-evolution (deprecation window)**: llm.adapter seam, agent factory/preset,
  execution-world providers (fs/subprocess/shell/pty), permission *rule* authorship.
- **Experimental (flag-gated)**: code-runtime seam, workspace adapters, telemetry sinks.
Kernel prints the tier of every consumed key; experimental usage is visible in composition report.

## 3. Security model

- Trust tiers (from 06 §3): builtin / verified-signed / community / inline-dev.
- Manifest-declared permissions per capability family; SEP mediates grant at install (consent screen
  enumerating capabilities), at registration, and at execution where dynamic.
- T2 out-of-process transport = true isolation boundary; T1 in-process relies on review+signature
  (same tradeoff VS Code makes with extension host vs web extensions).
- Supply-chain rules emerging from audit 03-D1: pin all fetched artifacts; no moving-branch downloads;
  bundle provenance recorded in composition report.

## 4. Permission model (user-facing)

Capability families map onto the existing permission UX (ask/allow/always patterns already shipped):
`fs.read|fs.write|exec|net|ui|credentials|agents.spawn|telemetry`. Default floors by trust tier;
enterprise policy profile can raise floors (upstream console/enterprise integration point).

## 5. Upgrade model

- Kernel `apiVersion` N/N-1 compatibility window; bundles declare `engines.opencode-kernel`.
- Dependent-reload cascade (06 §4) means upgrading a base bundle deterministically reloads dependents;
  quiesce barriers protect in-flight sessions; durable log guarantees session survives any bundle swap.
- Bundles are semver'd independently; lockfile-style profile lock records resolved set + hashes.

## 6. Marketplace & distribution (phased)

Phase A: registry-less — git/npm URLs + `.opencode` dir installs (exists today for plugins/themes).
Phase B: curated index (static JSON catalog; topic tag like dsh's `dsh-plugin`) with metadata only,
install still via npm/git.
Phase C: signed artifacts + publisher verification + usage/ratings; entitlement hooks for paid
bundles ride the commerce seam (04).
Deliberately NOT built now; specified so Phase-A choices don't foreclose it.

## 7. Designing for thousands of plugins

- Order-independence (inject) removes global ordering as a coordination problem.
- Namespacing rules: `<publisher>:<capability>` ids; collision policy = deny + report.
- Registry perf: hash-map lookups + precomputed sorted views; registration storms amortized
  (batch `contributes` rows processed once per mount, not per row).
- Discovery UX: single plugin manager across surfaces (TUI first, then app settings section).
- Failure isolation per plugin (06 §6) keeps one bad actor from poisoning the graph.
