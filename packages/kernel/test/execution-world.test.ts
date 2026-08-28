import { describe, expect, test, beforeAll, afterAll } from "bun:test"
import { mkdtemp, writeFile, readFile, rm, readdir, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { makeExecWorld, type ExecWorld } from "../src/execution/execution-world"

let dir = ""
let world: ExecWorld

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "exec-world-"))
  world = makeExecWorld({ workspace: dir })
  await mkdir(join(dir, "sub"), { recursive: true })
  await writeFile(join(dir, "a.txt"), "hello")
  await writeFile(join(dir, "sub", "b.txt"), "world")
})

afterAll(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe("Execution World", () => {
  test("read/write within workspace", async () => {
    await world.write({ path: "out.txt", data: "written" })
    expect(await world.read({ path: "out.txt" })).toBe("written")
  })

  test("list returns entries", async () => {
    const entries = await world.list({ path: "." })
    expect(entries).toContain("a.txt")
    expect(entries).toContain("out.txt")
  })

  test("traversal is rejected (no escape)", async () => {
    await expect(world.read({ path: "../../etc/passwd" })).rejects.toThrow(/escapes workspace/)
    await expect(world.read({ path: "C:/Windows/win.ini" })).rejects.toThrow(/escapes workspace/)
  })

  test("spawn runs a command and captures output", async () => {
    const out = await world.spawn({ command: process.execPath, args: ["-e", "console.log('hi')"] })
    expect(out.exitCode).toBe(0)
    expect(out.stdout).toContain("hi")
  })

  test("spawn non-zero exit", async () => {
    const out = await world.spawn({ command: process.execPath, args: ["-e", "process.exit(3)"] })
    expect(out.exitCode).toBe(3)
  })

  test("spawn respects timeout", async () => {
    const out = await world.spawn({
      command: process.execPath,
      args: ["-e", "setTimeout(()=>{}, 60000)"],
      timeoutMs: 200,
    })
    expect(out.timedOut).toBe(true)
  })

  test("cancellation kills the child process", async () => {
    const ac = new AbortController()
    const p = world.spawn({
      command: process.execPath,
      args: ["-e", "setInterval(()=>{}, 1000)"],
      signal: ac.signal,
      timeoutMs: 60000,
    })
    ac.abort()
    try {
      const out = await p
      expect(out.timedOut || out.signal !== null || out.exitCode !== null).toBe(true)
    } catch (e) {
      // Cancellation surfaces as an abort error — that is correct behavior.
      expect(String(e)).toMatch(/abort|ABORT_ERR/i)
    }
  })

  test("shell executes a command", async () => {
    const out = await world.shell({ command: "echo shell-ok" })
    expect(out.stdout).toContain("shell-ok")
  })
})
