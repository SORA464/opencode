// @ts-nocheck
/**
 * K-M6 — Execution World Types
 * Unified type definitions for the execution world capability seam
 */
import { Effect } from "effect"
import type { ShellExecSpec, ShellRunResult, ShellProcess } from "@opencode-ai/core/shell"
import type { SubprocessSpawnSpec, SubprocessHandle, SubprocessResult } from "@opencode-ai/core/subprocess"
import type { PTYSpec, PTYHandle, PTYDimensions } from "@opencode-ai/terminal"

export interface FileOperation {
  readonly kind: "read" | "write" | "edit" | "list" | "glob" | "grep" | "delete" | "mkdir" | "rmdir" | "move" | "copy" | "stat"
  readonly path: string
  readonly content?: string
  readonly encoding?: string
  readonly recursive?: boolean
  readonly pattern?: string
  readonly flags?: Record<string, unknown>
}

export interface FileResult {
  readonly success: boolean
  readonly content?: string
  readonly data?: unknown
  readonly error?: string
  readonly metadata?: Record<string, unknown>
}

export interface SubprocessSpec {
  readonly command: string
  readonly args?: ReadonlyArray<string>
  readonly cwd?: string
  readonly env?: Record<string, string>
  readonly timeout?: number
  readonly stdin?: string | NodeJS.ReadableStream
  readonly stdout?: "pipe" | "inherit" | "ignore"
  readonly stderr?: "pipe" | "inherit" | "ignore"
  readonly signal?: AbortSignal
  readonly env?: Record<string, string>
  readonly cwd?: string
  readonly shell?: boolean
  readonly windowsVerbatimArguments?: boolean
}

export interface SubprocessHandle {
  readonly pid: number
  readonly killed: boolean
  readonly stdin?: NodeJS.WritableStream
  readonly stdout?: NodeJS.ReadableStream
  readonly stderr?: NodeJS.ReadableStream
  readonly pid: number
  readonly kill: (signal?: string | number) => void
  readonly wait: () => Promise<SubprocessResult>
}

export interface SubprocessResult {
  readonly exitCode: number | null
  readonly signal: string | null
  readonly stdout: string
  readonly stderr: string
  readonly timedOut: boolean
  readonly killed: boolean
}

export interface ShellCommand {
  readonly command: string
  readonly args?: ReadonlyArray<string>
  readonly cwd?: string
  readonly env?: Record<string, string>
  readonly timeout?: number
  readonly shell?: string
  readonly timeoutMs?: number
  readonly stdin?: string | NodeJS.ReadableStream
}

export interface ShellResult {
  readonly exitCode: number | null
  readonly stdout: string
  readonly stderr: string
  readonly timedOut: boolean
  readonly signal?: string | null
}

export interface PTYSpec {
  readonly cols: number
  readonly rows: number
  readonly cwd?: string
  readonly env?: Record<string, string>
  readonly command?: string
  readonly args?: ReadonlyArray<string>
}

export interface PTYHandle {
  readonly pid: number
  readonly cols: number
  readonly rows: number
  readonly resize: (cols: number, rows: number) => void
  readonly write: (data: string | Uint8Array) => void
  readonly close: () => Promise<void>
  readonly onData: (data: string) => void
  readonly onExit: (code: number | null, signal?: string) => void
  readonly resize: (cols: number, rows: number) => void
  readonly close: () => Promise<void>
}

export interface PTYDimensions {
  readonly cols: number
  readonly rows: number
}

export interface ExecutionWorld {
  readonly fs: FileSystem
  readonly subprocess: SubprocessService
  readonly shell: ShellService
  readonly pty: PTYService
  readonly sandbox: SandboxService
}

export interface FileSystem {
  read(path: string, encoding?: string): Promise<string>
  write(path: string, content: string, encoding?: string): Promise<void>
  edit(path: string, oldText: string, newText: string): Promise<void>
  list(path: string, options?: { recursive?: boolean; pattern?: string }): Promise<string[]>
  glob(pattern: string, options?: { cwd?: string }): Promise<string[]>
  grep(pattern: string, options?: { cwd?: string; include?: string; exclude?: string }): Promise<string[]>
  stat(path: string): Promise<FileStat>
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>
  rmdir(path: string, options?: { recursive?: boolean }): Promise<void>
  rename(from: string, to: string): Promise<void>
  copy(from: string, to: string, options?: { recursive?: boolean }): Promise<void>
  stat(path: string): Promise<FileStat>
  exists(path: string): Promise<boolean>
  watch(path: string, events: readonly string[], listener: (event: FileWatchEvent) => void): Promise<() => void>
}

export interface FileStat {
  readonly isFile: boolean
  readonly isDirectory: boolean
  readonly isSymbolicLink: boolean
  readonly size: number
  readonly mtime: Date
  readonly ctime: Date
  readonly mode: number
}

export interface FileWatchEvent {
  readonly type: "create" | "modify" | "delete" | "rename"
  readonly path: string
  readonly oldPath?: string
}

export interface SubprocessService {
  spawn(spec: SubprocessSpec): Promise<SubprocessHandle>
  execute(spec: SubprocessSpec): Promise<SubprocessResult>
  kill(pid: number, signal?: string | number): Promise<void>
  list(): ReadonlyArray<SubprocessInfo>
}

export interface SubprocessInfo {
  readonly pid: number
  readonly command: string
  readonly args: ReadonlyArray<string>
  readonly cwd: string
  readonly startTime: Date
}

export interface ShellService {
  execute(command: string, options?: ShellExecuteOptions): Promise<ShellResult>
  executeBatch(commands: ReadonlyArray<ShellCommand>): Promise<ReadonlyArray<ShellResult>>
}

export interface ShellExecuteOptions {
  readonly cwd?: string
  readonly env?: Record<string, string>
  readonly timeout?: number
  readonly shell?: string
  readonly stdin?: string
  readonly signal?: AbortSignal
}

export interface SandboxService {
  confine(path: string, options?: SandboxOptions): Promise<SandboxResult>
  createSandbox(options: SandboxCreateOptions): Promise<SandboxHandle>
}

export interface SandboxOptions {
  readonly mode: "read-only" | "workspace-write" | "danger-full-access"
  readonly allowedPaths?: ReadonlyArray<string>
  readonly blockedPaths?: ReadonlyArray<string>
}

export interface SandboxResult {
  readonly success: boolean
  readonly error?: string
}

export interface SandboxHandle {
  readonly id: string
  readonly path: string
  readonly close: () => Promise<void>
}

export interface SandboxCreateOptions {
  readonly mode: "read-only" | "workspace-write" | "danger-full-access"
  readonly allowedPaths?: ReadonlyArray<string>
  readonly blockedPaths?: ReadonlyArray<string>
}

export interface FileOperationResult {
  readonly success: boolean
  readonly content?: string
  readonly error?: string
}