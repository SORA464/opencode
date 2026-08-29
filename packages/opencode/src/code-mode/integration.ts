/**
 * M6-M7 — Code Mode integration (wires CodeRuntime + PTC into ToolRegistry)
 * Code Mode is selectable via composition; Standard remains default.
 */
import { WorkerThreadCodeRuntime } from "@opencode-ai/kernel/src/code-runtime/runtime"
import { CodeMode, makeCodeMode } from "@opencode-ai/kernel/src/code-mode/code-mode"
import type { ToolExecutor } from "@opencode-ai/kernel/src/code-mode/code-mode"

export function createCodeMode(executors: Iterable<ToolExecutor>): CodeMode {
  const runtime = new WorkerThreadCodeRuntime()
  return makeCodeMode(runtime, executors)
}

export const CODE_MODE_TOOL = "run_code" as const
