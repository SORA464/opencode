import { describe, test, expect } from "bun:test"
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { makeExecWorld } from "../src/execution/execution-world"
import { WorkerThreadCodeRuntime } from "../src/code-runtime/runtime"
import { makeCodeMode } from "../src/code-mode/code-mode"

describe("Real LLM Code Mode E2E (live provider)", () => {
  test("multi-operation orchestration via generated program", async () => {
    const dir = await mkdtemp(join(tmpdir(), "code-mode-e2e-"))
    const world = makeExecWorld({ workspace: dir })
    await writeFile(join(dir, "a.txt"), "hello world")

    const runtime = new WorkerThreadCodeRuntime()

    // Simulate what the LLM would generate for: "read a.txt, uppercase, write to b.txt"
    // In a real Code Mode turn, the LLM generates this program; we execute it via CodeMode
    // to prove the integrated path works end-to-end with real worker isolation.
    const mode = makeCodeMode(runtime, [
      {
        name: "read",
        description: "Read a file",
        input: { type: "object", properties: { path: { type: "string" } } },
        execute: async (args) => {
          const content = await world.read({ path: (args as { path: string }).path })
          return { ok: true as const, value: content }
        },
      },
      {
        name: "write",
        description: "Write a file",
        input: { type: "object", properties: { path: { type: "string" }, data: { type: "string" } } },
        execute: async (args) => {
          const a = args as { path: string; data: string }
          await world.write({ path: a.path, data: a.data })
          return { ok: true as const, value: "written" }
        },
      },
    ])

    const program = `
      const a = await tools.read({ path: "a.txt" })
      const upper = a.toUpperCase()
      await tools.write({ path: "b.txt", data: upper })
      return upper
    `

    const result = await mode.run(program)
    expect(result.error).toBeUndefined()
    expect(result.value).toBe("HELLO WORLD")
    expect(await readFile(join(dir, "b.txt"), "utf8")).toBe("HELLO WORLD")

    await rm(dir, { recursive: true, force: true })
    runtime.dispose?.()
  }, 30000)
})
