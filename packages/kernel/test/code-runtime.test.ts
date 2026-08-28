import { describe, expect, test } from "bun:test"
import { WorkerThreadCodeRuntime } from "../src/code-runtime/runtime"
import { generateSdk } from "../src/code-runtime/generated-sdk"

const runtime = new WorkerThreadCodeRuntime()

describe("Code Runtime", () => {
  test("executes a program with no tools", async () => {
    const r = await runtime.run({ program: "return 2 + 3" })
    expect(r.error).toBeUndefined()
    expect(r.value).toBe(5)
  })

  test("executes a program calling a tool binding", async () => {
    const r = await runtime.run({
      program: `const a = await tools.add({ a: 1, b: 2 }); return a`,
      bindings: [{ global: "tools", functions: { add: async (args) => (args as { a: number; b: number }).a + (args as { a: number; b: number }).b } }],
    })
    expect(r.error).toBeUndefined()
    expect(r.value).toBe(3)
  })

  test("supports loops and local computation", async () => {
    const r = await runtime.run({
      program: `let sum = 0; for (let i = 0; i < 10; i++) { sum += await tools.inc({ n: i }); } return sum`,
      bindings: [{ global: "tools", functions: { inc: async (args) => (args as { n: number }).n + 1 } }],
    })
    expect(r.error).toBeUndefined()
    expect(r.value).toBe(55)
  })

  test("captures console output", async () => {
    const r = await runtime.run({ program: `console.log("hello"); console.log("world"); return 1` })
    expect(r.logs).toContain("hello")
    expect(r.logs).toContain("world")
  })

  test("times out runaway programs", async () => {
    const r = await runtime.run({ program: `while(true) {}`, timeoutMs: 300 })
    expect(r.error?.kind).toBe("timeout")
  })

  test("cancellation aborts execution", async () => {
    const ac = new AbortController()
    const p = runtime.run({ program: `while(true) {}`, signal: ac.signal, timeoutMs: 60000 })
    setTimeout(() => ac.abort(), 100)
    const r = await p
    expect(r.error?.kind).toBe("abort")
  })

  test("returns actionable exception on runtime error", async () => {
    const r = await runtime.run({ program: `throw new Error("boom")` })
    expect(r.error?.kind).toBe("exception")
    expect(r.error?.message).toContain("boom")
  })
})

describe("Generated SDK", () => {
  test("generates declarations for active tools", () => {
    const sdk = generateSdk({
      tools: [
        { name: "read", description: "Read a file", input: { type: "object", properties: { path: { type: "string" } } } },
        { name: "bash", description: "Run a shell command", input: { type: "object", properties: { command: { type: "string" } } } },
      ],
    })
    expect(sdk.declarations).toContain("read(")
    expect(sdk.declarations).toContain("bash(")
    expect(sdk.usage).toContain("read")
    expect(sdk.usage).toContain("bash")
  })
})
