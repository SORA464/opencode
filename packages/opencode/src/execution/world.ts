/**
 * K-M6-M7 — Execution World integration (authoritative seam)
 * Wraps OpenCode's existing FSUtil/subprocess primitives behind the unified ExecWorld contract.
 * No mature implementation is replaced — it is connected behind the contract.
 */
import { makeExecWorld, type ExecWorld } from "@opencode-ai/kernel/src/execution/execution-world"
import { InstanceState } from "@/effect/instance-state"
import { Effect, Context, Layer } from "effect"
import { makeLocationNode } from "@opencode-ai/core/effect/app-node"

export class ExecWorldService extends Context.Service<ExecWorldService, ExecWorld>()("@opencode/ExecWorld") {}

export const node = makeLocationNode({
  service: ExecWorldService,
  layer: Layer.effect(
    ExecWorldService,
    Effect.gen(function* () {
      const ctx = yield* InstanceState.context
      const world = makeExecWorld({ workspace: ctx.directory })
      return world
    }),
  ),
  deps: [],
})

export * as ExecWorldIntegration from "./world"
