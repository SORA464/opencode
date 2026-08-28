/**
 * K-DSH-B — Generated SDK system.
 *
 * Deterministically generates a TypeScript program-scaffold that exposes the
 * active tool set as typed async functions over a `tools` binding. Only tools
 * that are available and authorized are included.
 */
export interface SdkTool {
  readonly name: string
  readonly description: string
  readonly input: Record<string, unknown>
}

export interface GeneratedSdkOptions {
  readonly tools: ReadonlyArray<SdkTool>
  readonly includeHelp?: boolean
}

export interface GeneratedSdk {
  readonly language: "typescript"
  readonly declarations: string
  readonly usage: string
}

function tsTypeFor(schema: Record<string, unknown> | undefined, depth = 0): string {
  if (!schema || depth > 4) return "unknown"
  const t = schema["type"]
  if (t === "string") return "string"
  if (t === "number" || t === "integer") return "number"
  if (t === "boolean") return "boolean"
  if (t === "null") return "null"
  if (t === "array") return `${tsTypeFor(schema["items"] as Record<string, unknown>, depth + 1)}[]`
  if (t === "object") {
    const props = schema["properties"] as Record<string, Record<string, unknown>> | undefined
    if (!props) return "Record<string, unknown>"
    const entries = Object.entries(props).map(([k, v]) => `  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${tsTypeFor(v, depth + 1)}`)
    return `{\n${entries.join(",\n")}\n}`
  }
  return "unknown"
}

/**
 * Generate a TypeScript interface + usage scaffold describing how to call the
 * active tools from a program.
 */
export function generateSdk(opts: GeneratedSdkOptions): GeneratedSdk {
  const lines: string[] = []
  lines.push(`// Generated opencode tool SDK — ${opts.tools.length} tools available`)
  lines.push(`interface ToolResult { ok: boolean; value: unknown; error?: string }`)
  lines.push(`declare const tools: {`)
  for (const tool of opts.tools) {
    lines.push(`  /** ${tool.description.replace(/\n/g, " ")} */`)
    lines.push(`  ${tool.name}(input: ${tsTypeFor(tool.input)}): Promise<ToolResult>`)
  }
  lines.push(`}`)
  lines.push(``)
  lines.push(`// Call tools with: const r = await tools.${opts.tools[0]?.name ?? "yourTool"}({ ... })`)

  const usage = `Available tools: ${opts.tools.map((t) => t.name).join(", ")}`

  return { language: "typescript", declarations: lines.join("\n"), usage }
}

export const makeGeneratedSdk = generateSdk
