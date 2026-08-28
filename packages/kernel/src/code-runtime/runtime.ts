/**
 * K-DSH-B — Code Runtime contract + host-side worker-thread executor.
 */
import { resolve } from "node:path"
import { MessageChannel, Worker } from "node:worker_threads"
import type { CodeJsonValue } from "./worker"
export type { CodeJsonValue } from "./worker"

export interface CodeBinding {
  readonly global: string
  readonly functions: Record<string, (args: CodeJsonValue) => Promise<CodeJsonValue>>
}

export interface CodeRunRequest {
  readonly program: string
  readonly bindings?: ReadonlyArray<CodeBinding>
  readonly signal?: AbortSignal
  readonly timeoutMs?: number
  readonly maxOutputBytes?: number
}

export type CodeRunFailureKind = "timeout" | "abort" | "worker-exit" | "exception" | "invalid-output" | "output-limit"

export interface CodeRunResult {
  readonly value?: CodeJsonValue
  readonly logs: ReadonlyArray<string>
  readonly error?: { readonly kind: CodeRunFailureKind; readonly message: string }
}

export interface CodeRuntime {
  readonly language: string
  readonly isolation: string
  run(request: CodeRunRequest): Promise<CodeRunResult>
}

const DEFAULT_TIMEOUT_MS = 60_000
const DEFAULT_MAX_OUTPUT = 16 * 1024 * 1024

/**
 * Worker-thread Code Runtime. Runs the program in a child worker thread with
 * no inherited environment, a wall-clock timeout, an output budget, and
 * cancellation. Tool bindings bridge back to the host via a dedicated
 * MessageChannel (deterministic host→worker replies).
 */
export class WorkerThreadCodeRuntime implements CodeRuntime {
  readonly language = "typescript"
  readonly isolation = "worker-thread"
  private readonly workerPath: string
  private disposed = false

  constructor() {
    this.workerPath = resolve(import.meta.dirname, "worker.ts")
  }

  async run(request: CodeRunRequest): Promise<CodeRunResult> {
    if (this.disposed) return { logs: [], error: { kind: "worker-exit", message: "code runtime disposed" } }
    const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const maxOutput = request.maxOutputBytes ?? DEFAULT_MAX_OUTPUT
    const signal = request.signal
    const bindings = request.bindings ?? []

    // Strip type annotations for plain-JS worker execution.
    const code = stripTypeAnnotations(request.program)

    return new Promise<CodeRunResult>((resolvePromise) => {
      let logs: string[] = []
      let settled = false

      const namespaces = bindings.map((b) => ({ global: b.global, names: Object.keys(b.functions) }))

      const { port1, port2 } = new MessageChannel()

      let worker: Worker
      try {
        worker = new Worker(this.workerPath, {
          workerData: { code, namespaces, maxOutputBytes: maxOutput, replyPort: port2 } as never,
          transferList: [port2 as unknown as ArrayBuffer],
          env: {},
          execArgv: [],
          stdout: true,
          stderr: true,
        })
      } catch (e) {
        resolvePromise({ logs: [], error: { kind: "worker-exit", message: String(e) } })
        return
      }

      const finish = (result: CodeRunResult) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolvePromise(result)
        try { void worker.terminate() } catch { /* already gone */ }
        try { port1.close() } catch { /* already closed */ }
      }

      const timer = setTimeout(() => {
        finish({ logs, error: { kind: "timeout", message: `code execution exceeded ${timeoutMs}ms` } })
      }, timeoutMs)

      signal?.addEventListener("abort", () => {
        finish({ logs, error: { kind: "abort", message: "code execution aborted" } })
      }, { once: true })

      // Tool-call replies are sent by the host on port1 and received by the
      // worker on port2 (the replyPort). No host-side receive needed.

      worker.on("message", (message) => {
        if (message.type === "log") {
          logs = [...logs, String(message.text as string)]
        } else if (message.type === "call") {
          const call = message as { id: number; global: string; name: string; args: CodeJsonValue }
          const binding = bindings.find((b) => b.global === call.global)
          const fn = binding?.functions[call.name]
          if (!fn) {
            port1.postMessage({ type: "reply", id: call.id, ok: false, message: `unknown binding ${call.global}.${call.name}` })
            return
          }
          Promise.resolve()
            .then(() => fn(call.args))
            .then((value) => port1.postMessage({ type: "reply", id: call.id, ok: true, value: asJson(value) }))
            .catch((e) => port1.postMessage({ type: "reply", id: call.id, ok: false, message: String(e) }))
        } else if (message.type === "done") {
          const done = message as { value?: CodeJsonValue; error?: { kind: string; message: string } }
          if (done.error) {
            finish({ logs, error: { kind: done.error.kind as CodeRunFailureKind, message: done.error.message } })
          } else {
            finish({ logs, value: done.value })
          }
        }
      })

      worker.on("error", (err) => {
        finish({ logs, error: { kind: "worker-exit", message: String(err) } })
      })

      worker.on("exit", (code) => {
        if (!settled) {
          finish({ logs, error: { kind: "worker-exit", message: `worker exited with code ${code}` } })
        }
      })
    })
  }

  dispose(): void {
    this.disposed = true
  }
}

function asJson(value: unknown): CodeJsonValue {
  if (value === undefined) return null as unknown as CodeJsonValue
  if (typeof value === "bigint") return String(value) as unknown as CodeJsonValue
  return value as CodeJsonValue
}

/** Minimal type-annotation stripper for TS program bodies. */
function stripTypeAnnotations(code: string): string {
  const noInterfaces = code.replace(/(^|\n)\s*(interface|type)\s+[A-Za-z_$][\w$]*[\s\S]*?\{[\s\S]*?\}\s*(\n|$)/g, "\n")
  const noAnnotations = noInterfaces.replace(/:\s*(string|number|boolean|any|unknown|void|Promise<[^>]*>|Array<[^>]*>|Record<string,[^>]*>|CodeJsonValue|readonly\s+[^=,)]+)/g, "")
  return noAnnotations
}

export const makeCodeRuntime = () => new WorkerThreadCodeRuntime()
