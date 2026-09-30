/**
 * MCP (Model Context Protocol) stubs — two directions, both documented.
 *
 * ── A) CLIENT: call tools exposed by an external MCP server ──────────
 *    Configure: MCP_SERVER_URL=https://…  (MCP_SERVER_TOKEN optional bearer)
 *    Activate:  npm i @modelcontextprotocol/sdk
 *    Then implement callMcpTool() with StreamableHTTPClientTransport
 *    (see the commented sketch below).
 *
 * ── B) SERVER: expose THIS app's tools to Claude / other MCP clients ─
 *    The tool-definition shape lives in HACKATHON.md → Connect MCP.
 *    Expose it under /api/mcp when you install the SDK.
 */

import { getIntegrationStatus } from "@/lib/integrations/status";

export function isMcpConfigured(): boolean {
  return getIntegrationStatus().mcp.configured;
}

export interface McpToolCall {
  tool: string;
  args: Record<string, unknown>;
}

export interface McpToolResult {
  content: unknown;
}

/**
 * Calls a tool on the configured MCP server. Throws helpful errors until
 * the SDK is installed.
 */
export async function callMcpTool({
  tool,
  args,
}: McpToolCall): Promise<McpToolResult> {
  if (!isMcpConfigured()) {
    throw new Error(
      "MCP_SERVER_URL is not set. Add it to .env.local (see HACKATHON.md → Connect MCP).",
    );
  }
  throw new Error(
    "MCP SDK not installed. Run `npm i @modelcontextprotocol/sdk`, then implement callMcpTool() in lib/integrations/mcp.ts.",
  );

  // Implementation sketch once installed:
  // import { Client } from "@modelcontextprotocol/sdk/client/index.js";
  // import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
  // const transport = new StreamableHTTPClientTransport(new URL(process.env.MCP_SERVER_URL!), {
  //   requestInit: { headers: process.env.MCP_SERVER_TOKEN
  //     ? { Authorization: `Bearer ${process.env.MCP_SERVER_TOKEN}` } : {} },
  // });
  // const client = new Client({ name: "hackathon-app", version: "0.1.0" });
  // await client.connect(transport);
  // const result = await client.callTool({ name: tool, arguments: args });
  // await client.close();
  // return { content: result.content };
}

/** Definition shape for exposing this app's tools over MCP (direction B). */
export interface McpServerToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}
