/**
 * K-DSH-B — Code Runtime worker-side execution.
 *
 * Executes one model-written program with async tool bindings in an isolated
 * worker thread. Tool-call replies flow over a dedicated MessageChannel (host
 * keeps port A, worker receives port B via workerData) so host→worker reply
 * delivery is deterministic and independent of parentPort. In-process testable
 * via runProgram(). Adapted from DSH's worker-thread code runtime, reimplemented
 * on our primitives.
 */
import { inspect } from "node:util"
import { parentPort, workerData, type MessagePort } from "node:worker_threads"

export type CodeJsonValue =
  | null
  | boolean
  | number
  | string
  | CodeJsonValue[]
  | { [key: string]: CodeJsonValue }

export interface WorkerBootData {
  readonly code: string
  readonly namespaces: ReadonlyArray<{ readonly global: string; readonly names: ReadonlyArray<string> }>
  readonly maxOutputBytes: number
}

export type WorkerToHost =
  | { type: "call"; id: number; global: string; name: string; args: unknown }
  | { type: "log"; text: string }
  | { type: "output-limit" }
  | { type: "done"; value?: CodeJsonValue; error?: { kind: string; message: string } }

export type ReplyMessage =
  | { type: "reply"; id: number; ok: true; value: CodeJsonValue }
  | { type: "reply"; id: number; ok: false; message: string }

export interface WorkerPort {
  postMessage(message: WorkerToHost): void
  on(event: "message", listener: (message: ReplyMessage) => void): void
}

const CONSOLE_LEVELS = ["log", "info", "warn", "error", "debug"] as const

export function makeConsoleShim(logs: string[]): Record<(typeof CONSOLE_LEVELS)[number], (...args: unknown[]) => void> {
  const render = (args: unknown[]): string =>
    args.map((arg) => (typeof arg === "string" ? arg : inspect(arg, { depth: 4, maxArrayLength: 100, maxStringLength: 10000 }))).join(" ")
  const shim = Object.create(null) as Record<(typeof CONSOLE_LEVELS)[number], (...args: unknown[]) => void>
  for (const level of CONSOLE_LEVELS) shim[level] = (...args) => logs.push(render(args))
  return shim
}

/**
 * Run one program body in the CURRENT thread. `namespaces` become globals that
 * bridge calls over `port`; replies arrive on `replyPort` (a MessageChannel
 * port when running in a real worker, or a fake in-process port in tests).
 */
export async function runProgram(
  port: WorkerPort,
  replyPort: { on(event: "message", listener: (message: ReplyMessage) => void): void },
  data: WorkerBootData,
): Promise<{ value?: CodeJsonValue; error?: { kind: string; message: string }; logs: string[] }> {
  const logs: string[] = []
  const pending = new Map<number, { resolve: (v: CodeJsonValue) => void; reject: (e: Error) => void }>()
  let nextId = 1

  replyPort.on("message", (message: ReplyMessage) => {
    const entry = pending.get(message.id)
    if (!entry) return
    pending.delete(message.id)
    if (message.ok) entry.resolve(message.value)
    else entry.reject(new Error(message.message))
  })

  const namespaces: Record<string, unknown> = {}
  for (const ns of data.namespaces) {
    const obj = Object.create(null) as Record<string, unknown>
    for (const name of ns.names) {
      Object.defineProperty(obj, name, {
        enumerable: true,
        value: (args: unknown): Promise<unknown> =>
          new Promise((resolve, reject) => {
            const id = nextId++
            pending.set(id, { resolve: (v) => resolve(v), reject })
            try {
              port.postMessage({ type: "call", id, global: ns.global, name, args })
            } catch (e) {
              pending.delete(id)
              reject(e as Error)
            }
          }),
      })
    }
    namespaces[ns.global] = obj
  }

  const consoleShim = makeConsoleShim(logs)
  try {
    const AsyncFunction = (async () => {}).constructor as new (...args: string[]) => (...fnArgs: unknown[]) => Promise<unknown>
    const fn = new AsyncFunction(
      ...data.namespaces.map((ns) => ns.global),
      "console",
      `'use strict';\n${data.code}`,
    )
    const value = await fn(...data.namespaces.map((ns) => namespaces[ns.global]), consoleShim)
    return { value: asJson(value), logs }
  } catch (error) {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
    return { error: { kind: "exception", message }, logs }
  }
}

function asJson(value: unknown): CodeJsonValue {
  if (value === undefined) return undefined as unknown as CodeJsonValue
  return value as CodeJsonValue
}

// Real worker glue — loads only when spawned as a worker thread.
if (parentPort && workerData) {
  const pp = parentPort
  const data = workerData as WorkerBootData & { replyPort?: MessagePort }
  const replyPort = data.replyPort
  const port: WorkerPort = {
    postMessage: (m) => pp.postMessage(m),
    on: (_event, _listener) => { /* replies go over replyPort, not parentPort */ },
  }
  if (!replyPort) {
    pp.postMessage({ type: "done", error: { kind: "worker-exit", message: "worker missing replyPort" } })
  } else {
    const result = await runProgram(port, replyPort as unknown as { on: (e: string, l: never) => void }, data)
    for (const log of result.logs) port.postMessage({ type: "log", text: log })
    if (result.error) port.postMessage({ type: "done", error: result.error })
    else port.postMessage({ type: "done", value: result.value })
  }
  process.exit(0)
}
