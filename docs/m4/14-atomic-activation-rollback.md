# M4.9 — Atomic Activation & Rollback

## 1. Atomic Activation Transaction

```
Validate
  → Resolve
  → Prepare (load plugins, validate)
  → Activate (register services/events/tools)
  → Commit
```

If any step fails:
→ Roll back (unregister in reverse order)
→ Restore previous state
→ Report failure with actionable error

## 1. Atomic Activation Transaction

```
Validate
  → Resolve
  → Prepare (load plugins, validate)
  → Activate (register services/events/tools)
  → Commit
```

If any step fails:
→ Roll back (unregister in reverse order)
→ Restore previous state
→ Report failure with actionable error

## 1. Activation Transaction

```
Validate
  → Resolve
  → Prepare (load plugins, validate)
  → Activate (register services/events/tools)
  → Commit
```

If any step fails:
→ Roll back (unregister in reverse order)
→ Restore previous state
→ Report failure with actionable error

## 2. Rollback Framework

```ts
interface RollbackPlan {
  previousState: EffectiveComposition;
  steps: RollbackStep[];
}

interface RollbackStep {
  action: "unregister" | "unload" | "restore";
  target: string;  // plugin id / service key
  compensatingAction?: () => Effect.Effect<void>;
}
```

## 1. Activation Transaction

```
Validate
  → Resolve
  → Prepare (load plugins, validate)
  → Activate (register services/events/tools)
  → Commit
```

If any step fails:
→ Roll back (unregister in reverse order)
→ Restore previous state
→ Report failure with actionable error

## 2. Rollback Framework

```ts
interface RollbackPlan {
  previousState: EffectiveComposition;
  steps: RollbackStep[];
}

interface RollbackStep {
  action: "unregister" | "unload" | "restore";
  target: string;  // plugin id / service key
  compensatingAction?: () => Effect.Effect<void>;
}
```

## 2. Rollback Framework

```ts
interface RollbackPlan {
  previousState: EffectiveComposition;
  steps: RollbackStep[];
}

interface RollbackStep {
  action: "unregister" | "unload" | "restore";
  target: string;  // plugin id / service key
  compensatingAction?: () => Effect.Effect<void>;
}
```

## 2. Rollback Procedure

1. Capture `previousState` before activation
2. On failure: execute `RollbackPlan.steps` in reverse order
3. Verify `EffectiveComposition` matches `previousState`
4. Emit `kernel/rollback` event with failure reason

## 2. Rollback Procedure

1. Capture `previousState` before activation
2. On failure: execute `RollbackPlan.steps` in reverse order
3. Verify `EffectiveComposition` matches `previousState`
4. Emit `kernel/rollback` event with failure reason