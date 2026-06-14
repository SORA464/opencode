import { describe, expect, mock, test } from "bun:test"
import type { Client } from "@modelcontextprotocol/sdk/client/index.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { convertTool } from "../../src/mcp/catalog"

const definition = {
  name: "example",
  description: "Example tool",
  inputSchema: { type: "object" as const, properties: {} },
}

function tool(result: CallToolResult | { toolResult: unknown }) {
  const callTool = mock(async () => result)
  const converted = convertTool(definition, { callTool } as unknown as Client)
  if (!converted.execute) throw new Error("expected executable tool")
  return { callTool, execute: converted.execute }
}

describe("mcp catalog", () => {
  test("returns ordinary tool results", async () => {
    const result = {
      content: [{ type: "text" as const, text: "ordinary output" }],
      structuredContent: { value: 42 },
    }
    const converted = tool(result)

    await expect(converted.execute({}, { toolCallId: "call-1", messages: [] })).resolves.toEqual({
      ...result,
      content: [{ type: "text", text: '{"value":42}' }],
    })
    expect(converted.callTool).toHaveBeenCalledTimes(1)
  })

  test("returns task tool results", async () => {
    const result = { toolResult: { taskId: "task-1" } }
    const converted = tool(result)

    await expect(converted.execute({}, { toolCallId: "call-1", messages: [] })).resolves.toBe(result)
  })

  test("throws MCP tool errors with text and structured diagnostics", async () => {
    const converted = tool({
      isError: true,
      content: [
        { type: "text", text: "validation failed" },
        { type: "resource", resource: { uri: "error://details", text: "labels must be an object" } },
      ],
      structuredContent: { field: "labels", expected: "object" },
    })

    await expect(converted.execute({}, { toolCallId: "call-1", messages: [] })).rejects.toThrow(
      'validation failed\n\nlabels must be an object\n\n{"field":"labels","expected":"object"}',
    )
  })
})
