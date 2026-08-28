/**
 * K-DSH-E — DSH-derived agent loop behind the existing M5 AgentRuntime contract.
 *
 * A React-style loop: turn = one or more steps; step = one model request + its
 * tool calls. Adapted from DSH's ReactLoopAgent, reimplemented on our
 * AgentRuntime contract with no DSH import.
 */
import type { AgentInput, AgentOutput } from "../agents/agent-contract"

export interface ModelStream {
  (request: {
    provider: string
    model: string
    system: string
    messages: unknown[]
    tools?: ReadonlyArray<{ name: string; description: string; input: Record<string, unknown> }>
    signal?: AbortSignal
  }): AsyncIterable<{
    type: "text" | "tool-call" | "done"
    text?: string
    toolName?: string
    toolArgs?: unknown
    usage?: unknown
  }>
}

export interface ReactLoopOptions {
  readonly provider: string
  readonly model: string
  readonly systemPrompt: string
  readonly tools: ReadonlyArray<{ name: string; description: string; input: Record<string, unknown> }>
  readonly stream: ModelStream
  readonly executeTool: (name: string, args: unknown) => Promise<{ ok: boolean; value: unknown; error?: string }>
  readonly signal?: AbortSignal
  readonly maxTurns?: number
  readonly maxStepsPerTurn?: number
}

export interface LoopStep {
  readonly step: number
  readonly toolCalls: ReadonlyArray<{ name: string; args: unknown }>
}

export interface ReactLoopResult {
  readonly output: string
  readonly steps: ReadonlyArray<LoopStep>
  readonly toolCalls: number
  readonly reason: "completed" | "max-tokens" | "aborted" | "error" | "no-progress"
}

/**
 * Drive one agent turn with step boundaries and tool execution. Turns loop up
 * to maxTurns; each turn up to maxStepsPerTurn steps. No-progress protection:
 * repeated identical tool calls within a turn abort the loop.
 */
export async function reactLoop(opts: ReactLoopOptions): Promise<ReactLoopResult> {
  const maxTurns = opts.maxTurns ?? 10
  const maxStepsPerTurn = opts.maxStepsPerTurn ?? 20
  const signal = opts.signal
  const steps: LoopStep[] = []
  let toolCalls = 0
  let output = ""
  let reason: ReactLoopResult["reason"] = "completed"

  const seenCalls = new Set<string>()
  let repeats = 0

  for (let turn = 1; turn <= maxTurns; turn++) {
    let turnToolCalls = 0
    for (let step = 1; step <= maxStepsPerTurn; step++) {
      if (signal?.aborted) { reason = "aborted"; return { output, steps, toolCalls, reason } }
      const stream = opts.stream({
        provider: opts.provider,
        model: opts.model,
        system: opts.systemPrompt,
        messages: [],
        tools: opts.tools,
        signal,
      })
      let finish: "tool-calls" | "stop" | "max-tokens" | undefined
      const calls: Array<{ name: string; args: unknown }> = []
      for await (const chunk of stream) {
        if (chunk.type === "text") output += chunk.text ?? ""
        else if (chunk.type === "tool-call" && chunk.toolName) {
          calls.push({ name: chunk.toolName, args: chunk.toolArgs })
        } else if (chunk.type === "done") {
          finish = chunk.toolName === "max-tokens" ? "max-tokens" : "stop"
        }
      }
      if (calls.length === 0) { reason = "completed"; return { output, steps, toolCalls, reason } }

      // No-progress protection
      for (const c of calls) {
        const key = `${c.name}:${JSON.stringify(c.args)}`
        if (seenCalls.has(key)) {
          repeats++
          if (repeats >= 3) { reason = "no-progress"; return { output, steps, toolCalls, reason } }
        }
        seenCalls.add(key)
      }

      steps.push({ step, toolCalls: calls })
      for (const c of calls) {
        const r = await opts.executeTool(c.name, c.args)
        toolCalls++
        if (!r.ok) { reason = "error"; return { output, steps, toolCalls, reason } }
      }
      turnToolCalls += calls.length
      if (finish === "max-tokens") { reason = "max-tokens"; return { output, steps, toolCalls, reason } }
      if (turnToolCalls === 0) { reason = "completed"; return { output, steps, toolCalls, reason } }
    }
  }
  return { output, steps, toolCalls, reason }
}

/**
 * Adapter: run the React loop as an AgentRuntime.execute(...) implementation.
 */
export function makeReactAgent(opts: ReactLoopOptions): {
  readonly id: string
  readonly version: string
  readonly capabilities: ReadonlyArray<string>
  readonly execute: (input: AgentInput) => Promise<AgentOutput>
} {
  return {
    id: "dsh-react-loop",
    version: "1.0.0",
    capabilities: ["react-loop", "turn", "step", "tool-calls", "no-progress-guard"],
    execute: async (input: AgentInput) => {
      const result = await reactLoop({
        ...opts,
        systemPrompt: input.context?.["systemPrompt"] as string ?? opts.systemPrompt,
        signal: input.context?.["signal"] as AbortSignal | undefined,
      })
      if (result.reason === "aborted") return { status: "cancelled", result: result.output }
      if (result.reason === "error") return { status: "failed", error: result.output, result: result.output }
      return { status: "completed", result: result.output }
    },
  }
}
