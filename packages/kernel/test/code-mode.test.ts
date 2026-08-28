import { describe, expect, test } from "bun:test"
import { WorkerThreadCodeRuntime } from "../src/code-runtime/runtime"
import { CodeMode, makeCodeMode } from "../src/code-mode/code-mode"

const runtime = new WorkerThreadCodeRuntime()

function makeMode() {
  const executors = new Map<string, { name: string; description: string; input: Record<string, unknown>; execute: (a: unknown) => Promise<{ ok: boolean; value?: unknown; error?: string }> }>()
  executors.set("add", {
    name: "add", description: "Add two numbers", input: { type: "object", properties: { a: { type: "number" }, b: { type: "number" } } },
    execute: async (args) => ({ ok: true, value: (args as { a: number; b: number }).a + (args as { a: number; b: number }).b }),
  })
  executors.set("inc", {
    name: "inc", description: "Increment", input: { type: "object", properties: { n: { type: "number" } } },
    execute: async (args) => ({ ok: true, value: (args as { n: number }).n + 1 }),
  })
  executors.set("fail", {
    name: "fail", description: "Always fails", input: { type: "object", properties: {} },
    execute: async () => ({ ok: false, error: "intentional failure" }),
  })
  return makeCodeMode(runtime, executors.values())
}

describe("Code Mode (PTC)", () => {
  test("model surface exposes run_code and SDK", () => {
    const mode = makeMode()
    expect(mode.modelTools()).toEqual(["run_code"])
    const sdk = mode.sdk()
    expect(sdk.declarations).toContain("add(")
    expect(sdk.declarations).toContain("inc(")
  })

  test("program orchestrates multiple tool calls in one run", async () => {
    const mode = makeMode()
    const r = await mode.run(`
      const a = await tools.add({ a: 1, b: 2 })
      const b = await tools.add({ a: 10, b: 20 })
      const c = await tools.inc({ n: a })
      return { a, b, c }
    `)
    expect(r.error).toBeUndefined()
    expect(r.value).toEqual({ a: 3, b: 30, c: 4 })
  })

  test("program can loop and batch", async () => {
    const mode = makeMode()
    const r = await mode.run(`
      let sum = 0
      for (let i = 0; i < 5; i++) { sum += await tools.inc({ n: i }) }
      return sum
    `)
    expect(r.error).toBeUndefined()
    expect(r.value).toBe(15)
  })

  test("failed tool call produces actionable error", async () => {
    const mode = makeMode()
    const r = await mode.run(`
      try {
        await tools.fail({})
        return "should-not-reach"
      } catch (e) {
        return "caught:" + e.message
      }
    `)
    expect(r.error).toBeUndefined()
    expect(String(r.value)).toContain("caught:")
    expect(String(r.value)).toContain("intentional failure")
  })

  test("timeout prevents runaway programs", async () => {
    const mode = makeMode()
    const r = await mode.run(`while (true) {}`, undefined, 200)
    expect(r.error?.kind).toBe("timeout")
  })
})
