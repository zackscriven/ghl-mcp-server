#!/usr/bin/env node
/** Entry point — stdio transport (local server). */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const server = createServer();
  await server.connect(new StdioServerTransport());
  console.error("[ghl-mcp-server-v2] running on stdio");
}

main().catch((e) => {
  console.error("[ghl-mcp-server-v2] fatal:", e);
  process.exit(1);
});
