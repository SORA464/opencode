/**
 * Code Runtime service (authoritative, kernel-owned)
 * Provides WorkerThreadCodeRuntime as a service for Code Mode.
 */
import { WorkerThreadCodeRuntime } from "@opencode-ai/kernel/code-runtime/runtime"
import { Context, Layer } from "effect"
import { makeLocationNode } from "@opencode-ai/core/effect/app-node"

export class CodeRuntimeService extends Context.Service<CodeRuntimeService, WorkerThreadCodeRuntime>()("@opencode/CodeRuntime") {}

export const node = makeLocationNode({
  service: CodeRuntimeService,
  layer: Layer.succeed(CodeRuntimeService, new WorkerThreadCodeRuntime()),
  deps: [],
})
