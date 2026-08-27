# M4.8 — Composition Diff & Locking

## 1. Composition Diff

```ts
interface CompositionDiff {
  added: Capability[];
  removed: Capability[];
  changed: { id: string; before: Capability; after: Capability }[];
  conflicts: Conflict[];
}
```

## 1. Composition Diff

```ts
interface CompositionDiff {
  added: Capability[];
  removed: Capability[];
  changed: { id: string; before: Capability; after: Capability }[];
  conflicts: Conflict[];
}
```

## 1. Composition Diff

```ts
interface CompositionDiff {
  added: Capability[];
  removed: Capability[];
  changed: { id: string; before: Capability; after: Capability }[];
  conflicts: Conflict[];
}
```

## 2. Composition Lock

```ts
interface CompositionLock {
  compositionHash: string;          // SHA256 of canonicalized effective composition
  plugins: LockEntry[];
  dependencies: DependencyLock[];
  timestamp: number;
  kernelVersion: string;
}

interface LockEntry {
  id: string;
  version: string;
  hash: string;          // content hash of plugin code
  resolvedFrom: string;  // npm/git/path
}
```

## 1. Composition Lock

```ts
interface CompositionLock {
  compositionHash: string;          // SHA256 of canonicalized effective composition
  plugins: LockEntry[];
  dependencies: DependencyLock[];
  timestamp: number;
  kernelVersion: string;
}

interface LockEntry {
  id: string;
  version: string;
  hash: string;          // content hash of plugin code
  resolvedFrom: string;  // npm/git/path
}
```

## 1. Composition Lock

```ts
interface CompositionLock {
  compositionHash: string;          // SHA256 of canonicalized effective composition
  plugins: LockEntry[];
  dependencies: DependencyLock[];
  timestamp: number;
  kernelVersion: string;
}

interface LockEntry {
  id: string;
  version: string;
  hash: string;          // content hash of plugin code
  resolvedFrom: string;  // npm/git/path
}
```

## 2. Lock File Format

```json
{
  "compositionHash": "sha256:abc123...",
  "kernelVersion": "1.18.14",
  "timestamp": 1724567890123,
  "plugins": [
    { "id": "read", "version": "1.0.0", "hash": "sha256:abc...", "resolvedFrom": "builtin" },
    { "id": "bash", "version": "1.0.0", "hash": "sha256:def...", "resolvedFrom": "builtin" }
  ],
  "dependencies": [
    { "from": "glob", "to": "read", "version": "1.0.0" }
  ]
}
```

## 2. Lock File Format

```json
{
  "compositionHash": "sha256:abc123...",
  "kernelVersion": "1.18.14",
  "timestamp": 1724567890123,
  "plugins": [
    { "id": "read", "version": "1.0.0", "hash": "sha256:abc...", "resolvedFrom": "builtin" },
    { "id": "bash", "version": "1.0.0", "hash": "sha256:def...", "resolvedFrom": "builtin" }
  ],
  "dependencies": [
    { "from": "glob", "to": "read", "version": "1.0.0" }
  ]
}
```

## 3. Integrity / Signature Preparation

```ts
interface SignedComposition {
  lock: CompositionLock;
  signatures: Signature[];
}

interface Signature {
  alg: "Ed25519";
  keyId: string;
  signature: string;  // base64
}
```

## 2. Integrity / Signature Preparation

```ts
interface SignedComposition {
  lock: CompositionLock;
  signatures: Signature[];
}

interface Signature {
  alg: "Ed25519";
  keyId: string;
  signature: string;  // base64
}
```

## 3. Integrity / Signature Preparation

```ts
interface SignedComposition {
  lock: CompositionLock;
  signatures: Signature[];
}

interface Signature {
  alg: "Ed25519";
  keyId: string;
  signature: string;  // base64
}
```