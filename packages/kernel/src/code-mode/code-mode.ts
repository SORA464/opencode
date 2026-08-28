/**
 * K-DSH-C — Code Mode (Programmatic Tool Calling).
 *
 * A selectable agent execution strategy. In Code Mode, the model-facing tool
 * surface is reduced to a `run_code` capability backed by the Code Runtime +
 * Generated SDK; the underlying Tool Registry remains authoritative. Native
 * (Standard) tool execution is preserved and selectable.
 */
import type { CodeBinding, CodeJsonValue, CodeRuntime } from "../code-runtime/runtime"
import { generateSdk, type SdkTool } from "../code-runtime/generated-sdk"

export type ToolExecutionMode = "standard" | "code" | "both"

export interface CodeModeConfig {
  readonly mode: ToolExecutionMode
  readonly runtime: CodeRuntime
}

export interface ToolExecutor {
  readonly name: string
  readonly description: string
  readonly input: Record<string, unknown>
  execute(args: unknown): Promise<{ ok: boolean; value?: unknown; error?: string }>
}

export interface CodeModeResult {
  readonly value?: CodeJsonValue
  readonly logs: ReadonlyArray<string>
  readonly error?: { readonly kind: string; readonly message: string }
}

export class CodeMode {
  constructor(
    readonly id: string,
    private readonly runtime: CodeRuntime,
    private readonly executors: Map<string, ToolExecutor>,
  ) {}

  /** SDK surface exposed to the model (only authorized/available tools). */
  sdk(): { declarations: string; usage: string } {
    const tools: SdkTool[] = [...this.executors.values()].map((e) => ({
      name: e.name,
      description: e.description,
      input: e.input,
    }))
    return generateSdk({ tools })
  }

  /** Tool names this mode exposes to the model (just run_code by default). */
  modelTools(): ReadonlyArray<string> {
    return ["run_code"]
  }

  /**
   * Execute a generated program. All tool calls it makes route back through the
   * authoritative executors (which enforce permissions), never around them.
   */
  async run(program: string, signal?: AbortSignal, timeoutMs?: number): Promise<CodeModeResult> {
    const bindings: CodeBinding[] = [
      {
        global: "tools",
        functions: Object.fromEntries(
          [...this.executors.values()].map((e) => [
            e.name,
            async (args: CodeJsonValue): Promise<CodeJsonValue> => {
              const result = await e.execute(args)
              if (!result.ok) throw new Error(result.error ?? `tool ${e.name} failed`)
              return asJson(result.value)
            },
          ]),
        ),
      },
    ]
    const result = await this.runtime.run({ program, bindings, signal, timeoutMs })
    if (result.error) return { logs: result.logs, error: result.error }
    return { value: result.value, logs: result.logs }
  }
}

function asJson(value: unknown): CodeJsonValue {
  if (value === undefined) return null as unknown as CodeJsonValue
  return value as CodeJsonValue
}

export function makeCodeMode(runtime: CodeRuntime, executors: Iterable<ToolExecutor>): CodeMode {
  return new CodeMode("code-mode", runtime, new Map([...executors].map((e) => [e.name, e])))
}
