/**
 * M6-M7 — Code Mode integration (wires CodeRuntime + PTC into ToolRegistry)
 * Code Mode is selectable via composition; Standard remains default.
 */
import { CodeRuntime, CodeMode } from "@opencode-ai/kernel"

export function createCodeMode(executors: Iterable<CodeMode.ToolExecutor>): CodeMode.CodeMode {
  const runtime = new CodeRuntime.WorkerThreadCodeRuntime()
  return CodeMode.makeCodeMode(runtime, executors)
}

export const CODE_MODE_TOOL = "run_code" as const
