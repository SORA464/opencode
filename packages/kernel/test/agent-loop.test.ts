import { describe, expect, test } from "bun:test"
import { reactLoop, makeReactAgent, type ModelStream } from "../src/agent-loop/react-loop"
import { makeCoordinator, DEFAULT_MULTI_AGENT_CONFIG } from "../src/agent-loop/multi-agent"
import { resolveMode, selectToolSet, MODE_PROFILES } from "../src/profiles/modes"

function makeStream(script: Array<"tool" | "stop">, toolName = "bash"): ModelStream {
  let index = 0
  return async function* () {
    const step = script[index++]
    if (step === "tool") yield { type: "tool-call", toolName, toolArgs: { command: "echo hi" } }
    else yield { type: "done", toolName: "stop" }
  }
}

describe("DSH-derived agent loop", () => {
  test("executes a single step to completion", async () => {
    const r = await reactLoop({
      provider: "test", model: "m", systemPrompt: "sys",
      tools: [{ name: "bash", description: "run", input: {} }],
      stream: makeStream(["stop"]),
      executeTool: async () => ({ ok: true, value: "ok" }),
    })
    expect(r.reason).toBe("completed")
    expect(r.toolCalls).toBe(0)
  })

  test("executes tool calls and continues", async () => {
    let calls = 0
    const r = await reactLoop({
      provider: "test", model: "m", systemPrompt: "sys",
      tools: [{ name: "bash", description: "run", input: {} }],
      stream: makeStream(["tool", "stop"]),
      executeTool: async () => { calls++; return { ok: true, value: "ok" } },
    })
    expect(r.reason).toBe("completed")
    expect(r.toolCalls).toBe(1)
    expect(calls).toBe(1)
  })

  test("detects no-progress (repeated identical calls)", async () => {
    // 3+ identical tool calls triggers the no-progress guard
    const r = await reactLoop({
      provider: "test", model: "m", systemPrompt: "sys",
      tools: [{ name: "bash", description: "run", input: {} }],
      stream: makeStream(["tool", "tool", "tool", "tool"]),
      executeTool: async () => ({ ok: true, value: "ok" }),
    })
    expect(r.reason).toBe("no-progress")
  })

  test("cancellation returns aborted", async () => {
    const ac = new AbortController()
    const r = await reactLoop({
      provider: "test", model: "m", systemPrompt: "sys",
      tools: [{ name: "bash", description: "run", input: {} }],
      stream: async function* () {
        ac.abort()
        yield { type: "tool-call", toolName: "bash", toolArgs: {} }
      },
      executeTool: async () => ({ ok: true, value: "ok" }),
      signal: ac.signal,
    })
    expect(r.reason).toBe("aborted")
  })

  test("AgentRuntime adapter maps results", async () => {
    const agent = makeReactAgent({
      provider: "test", model: "m", systemPrompt: "sys",
      tools: [], stream: makeStream(["stop"]), executeTool: async () => ({ ok: true, value: "ok" }),
    })
    expect(agent.id).toBe("dsh-react-loop")
    expect(agent.capabilities).toContain("no-progress-guard")
    const out = await agent.execute({ sessionID: "s", prompt: "p", model: "m", tools: [], context: {} })
    expect(out.status).toBe("completed")
  })
})

describe("Multi-agent", () => {
  test("delegates within limits", async () => {
    const coord = makeCoordinator({ maxDepth: 3, maxSiblings: 5, maxTotal: 20 })
    const r = await coord.delegate({
      id: "specialist", prompt: "do x", model: "m",
      execute: async () => ({ status: "completed", result: "done" }),
    }, 1)
    expect(r.status).toBe("completed")
    expect(r.result).toBe("done")
  })

  test("enforces depth limit", async () => {
    const coord = makeCoordinator({ ...DEFAULT_MULTI_AGENT_CONFIG, maxDepth: 2 })
    const r = await coord.delegate({
      id: "deep", prompt: "x", model: "m",
      execute: async () => ({ status: "completed", result: "x" }),
    }, 5)
    expect(r.status).toBe("failed")
    expect(r.error).toMatch(/depth/)
  })
})

describe("Profile / mode integration", () => {
  test("all four modes resolve", () => {
    expect(resolveMode("standard").toolMode).toBe("standard")
    expect(resolveMode("code").toolMode).toBe("code")
    expect(resolveMode("minimal").tools).toContain("bash")
    expect(resolveMode("assistant").tools).toEqual([])
  })

  test("selectToolSet filters to available + run_code", () => {
    const available = ["read", "bash", "write"]
    const codeTools = selectToolSet("code", available)
    expect(codeTools).toEqual(["run_code"])
    const standardTools = selectToolSet("standard", available)
    expect(standardTools).toContain("read")
    expect(standardTools).toContain("bash")
  })

  test("mode profiles are composition, not runtimes", () => {
    expect(Object.keys(MODE_PROFILES).sort()).toEqual(["assistant", "code", "minimal", "standard"])
  })
})
