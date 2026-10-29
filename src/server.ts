/** MCP server wiring: tools/list + tools/call with validation and the write gate. */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Ajv, type ValidateFunction } from "ajv";
import addFormatsModule from "ajv-formats";
const addFormats = addFormatsModule as unknown as (ajv: Ajv) => Ajv;
import { loadConfig } from "./config.js";
import { callGhl, type CallArgs } from "./http.js";
import { buildRegistry, tokenHint, type RegisteredTool } from "./registry.js";

export function createServer(): Server {
  const config = loadConfig();
  const registry = buildRegistry(config.enabledDomains);

  const ajv = new Ajv({ strict: false, validateSchema: false, allErrors: true, coerceTypes: false });
  addFormats(ajv);
  const validators = new Map<string, ValidateFunction | null>();

  const server = new Server(
    { name: "ghl-mcp-server", version: "2.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registry.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema as any,
      annotations: t.annotations,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = registry.byName.get(req.params.name);
    if (!tool) {
      return errorResult(`Unknown tool: ${req.params.name}. Call tools/list for available tools.`);
    }
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;

    // Deploy-time default location: if this tool takes a `locationId` and the
    // caller omitted it, fill from GHL_DEFAULT_LOCATION_ID / GHL_LOCATION_ID.
    // Caller-supplied values always win; nothing is hardcoded in the server.
    if (
      config.defaultLocationId &&
      args["locationId"] === undefined &&
      (tool.inputSchema as { properties?: Record<string, unknown> }).properties?.["locationId"]
    ) {
      args["locationId"] = config.defaultLocationId;
    }

    // Safety gate: block all mutating calls unless writes are explicitly enabled.
    if (!tool.annotations.readOnlyHint && !config.enableWrites) {
      return errorResult(
        `WRITE BLOCKED (dry-run mode): ${tool.op.method} ${tool.op.path} is a mutating call and ` +
          `GHL_ENABLE_WRITES is not set. This server defaults to read-only because it can touch a ` +
          `live production CRM. Set GHL_ENABLE_WRITES=true to allow writes. ` +
          `Validation result: ${validationSummary(tool, args, ajv, validators)}`
      );
    }

    const summary = validationSummary(tool, args, ajv, validators);
    if (summary !== "ok") return errorResult(`Invalid arguments: ${summary}`);

    const call: CallArgs = { pathParams: {}, queryParams: {}, headerParams: {}, body: undefined };
    for (const [k, v] of Object.entries(args)) {
      if (k === "body") call.body = v;
      else if (tool.paramIndex.path.includes(k)) call.pathParams[k] = String(v);
      else if (tool.paramIndex.header.includes(k)) call.headerParams[k] = String(v);
      else call.queryParams[k] = v;
    }

    try {
      const res = await callGhl(config, tool.op, tool.versionHeader, call, tool.contentType);
      const structured = { status: res.status, ok: res.ok, data: res.data, ...(res.rateLimit ? { rateLimit: res.rateLimit } : {}) };
      const text = res.ok
        ? JSON.stringify(res.data, null, 2)
        : `HTTP ${res.status} from ${tool.op.method} ${tool.op.path}\n` +
          `${JSON.stringify(res.data, null, 2)}\n` +
          `Hints: check required params/scopes (${tool.op.scopes.join(", ") || "n/a"}), and that the ` +
          `token's location matches locationId. Version header sent: ${tool.versionHeader || "none"}.` +
          ((res.status === 401 || res.status === 403) && tokenHint(tool.op) ? ` Token: ${tokenHint(tool.op)}` : "");
      return {
        content: [{ type: "text" as const, text: truncate(text, 100_000) }],
        structuredContent: structured,
        isError: !res.ok,
      };
    } catch (e) {
      return errorResult(String(e instanceof Error ? e.message : e));
    }
  });

  console.error(
    `[ghl-mcp-server-v2] ${registry.tools.length} tools registered` +
      (registry.skipped.length ? `, ${registry.skipped.length} skipped by curated exception` : "") +
      (config.enableWrites ? " — WRITES ENABLED" : " — read-only (dry-run) mode")
  );
  return server;
}

function validationSummary(
  tool: RegisteredTool,
  args: Record<string, unknown>,
  ajv: Ajv,
  cache: Map<string, ValidateFunction | null>
): string {
  let v = cache.get(tool.name);
  if (v === undefined) {
    try {
      v = ajv.compile(tool.inputSchema);
    } catch (e) {
      console.error(`[ghl-mcp-server-v2] schema compile failed for ${tool.name}: ${e}`);
      v = null; // spec schema Ajv can't compile — skip validation rather than break the tool
    }
    cache.set(tool.name, v);
  }
  if (!v) return "ok";
  if (v(args)) return "ok";
  return (v.errors ?? [])
    .map((err) => `${err.instancePath || "(root)"} ${err.message}`)
    .slice(0, 10)
    .join("; ");
}

function errorResult(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true };
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + `\n…[truncated ${s.length - n} chars]` : s;
}
