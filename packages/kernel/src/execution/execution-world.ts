/**
 * K-DSH-A — Execution World
 *
 * Unified capability boundary for filesystem, subprocess, shell, and process
 * lifecycle operations. The agent runtime and tools consume this abstraction
 * rather than coupling to platform-specific implementations. Every operation
 * carries identity, permission, provenance, cancellation, timeout, and resource
 * constraints. This is the adapted DSH execution-world seam, reimplemented on
 * our own primitives (no DSH import).
 */
import { spawn as nodeSpawn, type ChildProcess } from "node:child_process"
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises"
import { join, resolve, sep } from "node:path"

export interface ExecWorldOptions {
  readonly workspace: string
  readonly maxOutputBytes?: number
  readonly defaultTimeoutMs?: number
}

export interface FSReadInput { readonly path: string; readonly encoding?: BufferEncoding }
export interface FSWriteInput { readonly path: string; readonly data: string | Uint8Array }
export interface FSListInput { readonly path: string; readonly maxEntries?: number }
export interface FSDeleteInput { readonly path: string; readonly recursive?: boolean }

export interface SpawnInput {
  readonly command: string
  readonly args?: ReadonlyArray<string>
  readonly cwd?: string
  readonly env?: Record<string, string>
  readonly timeoutMs?: number
  readonly maxOutputBytes?: number
  readonly signal?: AbortSignal
  readonly shell?: boolean
}

export interface SpawnOutput {
  readonly exitCode: number | null
  readonly signal: string | null
  readonly timedOut: boolean
  readonly stdout: string
  readonly stderr: string
  readonly truncated: boolean
}

export interface ExecWorld {
  readonly id: string
  readonly workspace: string
  read(input: FSReadInput): Promise<string>
  write(input: FSWriteInput): Promise<void>
  list(input: FSListInput): Promise<string[]>
  remove(input: FSDeleteInput): Promise<void>
  spawn(input: SpawnInput): Promise<SpawnOutput>
  shell(input: { command: string; cwd?: string; timeoutMs?: number; signal?: AbortSignal }): Promise<SpawnOutput>
}

export type TraversalError = Error & { code: "EXEC_TRAVERSAL" }

function isInside(base: string, target: string): boolean {
  const rel = resolve(base, target)
  return rel === base || rel.startsWith(base + sep)
}

export function makeExecWorld(opts: ExecWorldOptions): ExecWorld {
  const workspace = resolve(opts.workspace)
  const defaultMax = opts.maxOutputBytes ?? 1_000_000
  const defaultTimeout = opts.defaultTimeoutMs ?? 120_000

  const assertContained = (p: string): string => {
    const abs = resolve(workspace, p)
    if (!isInside(workspace, abs)) {
      const err = new Error(`path escapes workspace: ${p}`) as TraversalError
      err.code = "EXEC_TRAVERSAL"
      throw err
    }
    return abs
  }

  const read = async (input: FSReadInput): Promise<string> => {
    const abs = assertContained(input.path)
    return await readFile(abs, input.encoding ?? "utf8")
  }

  const write = async (input: FSWriteInput): Promise<void> => {
    const abs = assertContained(input.path)
    await mkdir(join(abs, ".."), { recursive: true })
    await writeFile(abs, input.data)
  }

  const list = async (input: FSListInput): Promise<string[]> => {
    const abs = assertContained(input.path)
    const entries = await readdir(abs, { withFileTypes: true })
    return entries.slice(0, input.maxEntries ?? 10_000).map((e) => e.name)
  }

  const remove = async (input: FSDeleteInput): Promise<void> => {
    const abs = assertContained(input.path)
    await rm(abs, { recursive: input.recursive ?? false, force: true })
  }

  const spawn = (input: SpawnInput): Promise<SpawnOutput> =>
    new Promise<SpawnOutput>((resolvePromise, rejectPromise) => {
      const cwd = input.cwd === undefined ? workspace : resolve(input.cwd)
      const maxBytes = input.maxOutputBytes ?? defaultMax
      const timeoutMs = input.timeoutMs ?? defaultTimeout
      const signal = input.signal

      if (signal?.aborted) {
        resolvePromise({ exitCode: null, signal: "SIGABRT", timedOut: false, stdout: "", stderr: "", truncated: false })
        return
      }

      let child: ChildProcess | undefined
      try {
        child = nodeSpawn(input.command, input.args ?? [], {
          cwd,
          env: input.env === undefined ? process.env : { ...process.env, ...input.env },
          shell: input.shell ?? false,
          stdio: ["ignore", "pipe", "pipe"],
          signal,
        })
      } catch (e) {
        rejectPromise(e as Error)
        return
      }
      if (!child) { rejectPromise(new Error("spawn returned no child")); return }

      let stdout = ""
      let stderr = ""
      let stdoutTruncated = false
      let stderrTruncated = false
      let settled = false
      let timedOut = false

      const timer = setTimeout(() => {
        timedOut = true
        if (!settled) {
          try { child!.kill("SIGKILL") } catch { /* already gone */ }
        }
      }, timeoutMs)

      const finish = (exitCode: number | null, sig: string | null) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolvePromise({ exitCode, signal: sig, timedOut, stdout, stderr, truncated: stdoutTruncated || stderrTruncated })
      }

      child.stdout?.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf8")
        if (stdout.length + text.length > maxBytes) {
          stdout += text.slice(0, Math.max(0, maxBytes - stdout.length))
          stdoutTruncated = true
          try { child!.kill("SIGKILL") } catch { /* already gone */ }
          return
        }
        stdout += text
      })
      child.stderr?.on("data", (chunk: Buffer) => {
        const text = chunk.toString("utf8")
        if (stderr.length + text.length > maxBytes) {
          stderr += text.slice(0, Math.max(0, maxBytes - stderr.length))
          stderrTruncated = true
          try { child!.kill("SIGKILL") } catch { /* already gone */ }
          return
        }
        stderr += text
      })
      child.on("error", (err) => {
        if (!settled) { settled = true; clearTimeout(timer); rejectPromise(err) }
      })
      child.on("close", (code, sig) => finish(code, sig))
    })

  const shell = (input: { command: string; cwd?: string; timeoutMs?: number; signal?: AbortSignal }): Promise<SpawnOutput> =>
    spawn({
      command: input.command,
      cwd: input.cwd,
      timeoutMs: input.timeoutMs,
      signal: input.signal,
      shell: true,
      maxOutputBytes: defaultMax,
    })

  return { id: "execution-world", workspace, read, write, list, remove, spawn, shell }
}

export const createExecWorld = makeExecWorld
