/**
 * Builds the MCP tool registry from src/generated/operations.json + the
 * per-domain curated overrides. Request schemas are carried verbatim from the
 * OpenAPI specs (full field sets — nothing hand-transcribed, nothing dropped).
 *
 * Input schema shape per tool:
 *   - path/query/header params → top-level properties (spec names preserved)
 *   - request body → a top-level `body` property carrying the spec's schema verbatim
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Operation, OperationsFile, OperationOverride, SpecParameter } from "./types.js";
import { assignNames, shapeKey, specBase } from "./naming.js";
import { allOverrides } from "./overrides/index.js";
import { SERVICE_NOTES } from "./overrides/service-notes.js";

export interface RegisteredTool {
  name: string;
  op: Operation;
  override: OperationOverride | undefined;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: {
    title: string;
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
    openWorldHint: boolean;
  };
  versionHeader: string;
  contentType: string;
  paramIndex: { path: string[]; query: string[]; header: string[] };
}

export interface Registry {
  tools: RegisteredTool[];
  byName: Map<string, RegisteredTool>;
  skipped: Array<{ key: string; name: string; reason: string }>;
}

function loadOperations(): OperationsFile {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const p = path.join(here, "generated", "operations.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as OperationsFile;
}

const PAGINATION_PARAMS = new Set([
  "limit", "offset", "page", "skip", "startAfter", "startAfterId", "cursor", "nextPageUrl", "lastMessageId", "lastDocumentId",
  "pageLength", "pageSize", "lastKnowledgeBaseId", "lastFaqId",
]);

function paramSchema(p: SpecParameter): Record<string, unknown> {
  const s = { ...(p.schema ?? { type: "string" }) } as Record<string, unknown>;
  if (p.description && !s.description) s.description = p.description;
  return s;
}

function buildInputSchema(op: Operation, ov: OperationOverride | undefined, contentType: string) {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  const idx = { path: [] as string[], query: [] as string[], header: [] as string[] };

  const params = [...op.parameters];
  for (const extra of ov?.extraQueryParams ?? []) {
    params.push({ name: extra.name, in: "query", schema: extra.schema, description: extra.description });
  }
  // Some official specs omit a path parameter declaration even though the URL
  // template requires it (confirmed: GET /conversations/messages/{id},
  // PUT/DELETE /users/{userId}). Infer missing path params from the template
  // so those tools are actually callable.
  const declaredPath = new Set(params.filter((p) => p?.in === "path").map((p) => p.name));
  for (const m of op.path.matchAll(/\{([^}]+)\}/g)) {
    if (!declaredPath.has(m[1])) {
      params.push({
        name: m[1],
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Path parameter (inferred from the URL template; the official spec omits its declaration).",
      });
    }
  }

  const seen = new Set<string>();
  for (const p of params) {
    if (!p?.name || seen.has(p.name)) continue;
    seen.add(p.name);
    properties[p.name] = paramSchema(p);
    if (p.in === "path") idx.path.push(p.name);
    else if (p.in === "header") idx.header.push(p.name);
    else idx.query.push(p.name);
    if (p.in === "path" || p.required || ov?.forceRequired?.includes(p.name)) required.push(p.name);
  }

  let bodySchema = op.requestBody?.content?.[contentType]?.schema
    ?? op.requestBody?.content?.["application/json"]?.schema;
  if (contentType.startsWith("multipart/") && bodySchema && (bodySchema as Record<string, any>).properties) {
    // Multipart file parts are typed `string` (binary) in the spec, but
    // http.ts also accepts { filePath, filename?, mimeType? } objects and
    // reads the file from local disk (see http.ts multipart branch). The
    // verbatim spec schema was rejecting that object form at validation
    // time (found 2026-07-16 while wiring media uploads for the weekly
    // social pipeline). Relax every body property to permit either form.
    const props = (bodySchema as Record<string, any>).properties as Record<string, any>;
    bodySchema = {
      ...(bodySchema as Record<string, any>),
      properties: Object.fromEntries(
        Object.entries(props).map(([k, v]) => [
          k,
          {
            anyOf: [
              v,
              {
                type: "object",
                properties: {
                  filePath: { type: "string" },
                  filename: { type: "string" },
                  mimeType: { type: "string" },
                },
                required: ["filePath"],
                additionalProperties: false,
              },
            ],
            ...(v?.description ? { description: v.description } : {}),
          },
        ]),
      ),
    };
  }
  if (ov?.patchBody && bodySchema && (bodySchema as Record<string, any>).properties) {
    // Curated body-schema patch for known-wrong upstream specs (see
    // OperationOverride.patchBody in types.ts). Applied here — not in the
    // generated output — so re-running the spec extractor can't clobber it.
    const base = bodySchema as Record<string, any>;
    const patched: Record<string, any> = { ...base, properties: { ...base.properties } };
    for (const [k, v] of Object.entries(ov.patchBody.properties ?? {})) {
      patched.properties[k] = v;
    }
    if (ov.patchBody.required !== undefined) {
      if (ov.patchBody.required.length) patched.required = ov.patchBody.required;
      else delete patched.required;
    }
    bodySchema = patched;
  }
  if (op.requestBody && bodySchema && Object.keys(bodySchema).length > 0) {
    properties["body"] = {
      description: op.requestBody.description ?? "Request body (schema carried verbatim from the official OpenAPI spec).",
      ...bodySchema,
    };
    if (op.requestBody.required) required.push("body");
  } else if (op.requestBody) {
    // Spec declares a body but gives an empty/absent schema (e.g. some
    // multipart upload endpoints) — expose a permissive object rather than
    // silently omitting the body entirely.
    properties["body"] = {
      type: "object",
      description:
        (op.requestBody.description ?? "Request body.") +
        " The official spec provides no field-level schema for this body; pass fields as documented. " +
        (contentType.startsWith("multipart/")
          ? "For multipart uploads, file values may be given as { filePath, filename?, mimeType? } objects."
          : ""),
      additionalProperties: true,
    };
    if (op.requestBody.required) required.push("body");
  }

  return {
    schema: {
      type: "object",
      properties,
      ...(required.length ? { required: [...new Set(required)] } : {}),
      additionalProperties: false,
    },
    idx,
  };
}

/** Human-readable token requirement derived from the spec's security schemes. */
export function tokenHint(op: Operation): string | undefined {
  const sch = op.securitySchemes ?? [];
  if (!sch.length) return undefined;
  const agency = sch.some((x) => x.startsWith("Agency-Access"));
  const location = sch.some((x) => x.startsWith("Location-Access"));
  const oauthOnly = sch.some((x) => x.endsWith("-Only"));
  const who = agency && location ? "an Agency or Sub-Account token" : agency ? "an Agency (company-level) token" : "a Sub-Account (location) token";
  return `Requires ${who}.` + (oauthOnly ? " OAuth access token only — Private Integration Tokens are rejected." : "");
}

function buildDescription(op: Operation, ov: OperationOverride | undefined): string {
  const parts: string[] = [];
  if (ov?.descriptionNote) parts.push(ov.descriptionNote);
  const svcNote = SERVICE_NOTES[specBase(op.specFile)];
  if (svcNote) parts.push(svcNote);
  if (op.deprecated) parts.push("[DEPRECATED per official docs — prefer the documented replacement if one exists.]");
  if (op.legacyFallback) {
    parts.push(
      "[LEGACY FALLBACK — this endpoint is no longer in the live v3 docs (checked 2026-10-28) but is still served under the legacy Version header. Expect removal; prefer a current equivalent.]",
    );
  }
  parts.push(op.summary || op.operationId || `${op.method} ${op.path}`);
  const desc = op.description?.trim();
  if (desc && desc !== op.summary) parts.push(desc.slice(0, 1500));
  parts.push(`Endpoint: ${op.method} ${op.path} (Version header: ${op.versionHeader || "none"}; source: ${op.specFile})`);
  const th = tokenHint(op);
  if (th) parts.push(th);
  if (op.scopes.length) parts.push(`OAuth scopes: ${op.scopes.join(", ")}`);
  const pag = op.parameters.filter((p) => p.in === "query" && PAGINATION_PARAMS.has(p.name)).map((p) => p.name);
  if (pag.length) parts.push(`Pagination params: ${pag.join(", ")} — pass them to page through full result sets.`);
  return parts.join("\n");
}

/** Pinned tool names (public API): shape key -> name. Committed; never regenerated blindly. */
function loadPinnedNames(): Record<string, string> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const p = path.join(here, "generated", "tool-names.json");
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, string>) : {};
}

export function buildRegistry(enabledDomains: string[] | null): Registry {
  const opsFile = loadOperations();
  const overrideMap = new Map<string, OperationOverride>();
  for (const dom of allOverrides) {
    for (const [key, ov] of Object.entries(dom.overrides)) {
      const [m, ...rest] = key.split(" ");
      overrideMap.set(shapeKey(m, rest.join(" ")), ov);
    }
  }
  const pinned = loadPinnedNames();

  let ops = opsFile.operations;
  if (enabledDomains) {
    ops = ops.filter((op) => enabledDomains.includes(specBase(op.specFile).toLowerCase()));
  }

  const names = assignNames(ops, (op) => {
    const sk = shapeKey(op.method, op.path);
    return overrideMap.get(sk)?.name ?? pinned[sk];
  });
  const tools: RegisteredTool[] = [];
  const skipped: Registry["skipped"] = [];

  for (const op of ops) {
    const key = op.method + " " + op.path;
    const ov = overrideMap.get(shapeKey(op.method, op.path));
    const name = names.get(op)!;
    if (ov?.skip) {
      skipped.push({ key, name, reason: ov.skip.reason });
      continue;
    }
    const contentType = ov?.contentType
      ?? (op.requestBody?.content && !op.requestBody.content["application/json"]
        ? Object.keys(op.requestBody.content)[0] ?? "application/json"
        : "application/json");
    const { schema, idx } = buildInputSchema(op, ov, contentType);
    const isRead = ov?.readOnly ?? (op.method === "GET" || (op.method === "POST" && /^(search|list)-/.test(op.operationId)));
    tools.push({
      name,
      op,
      override: ov,
      description: buildDescription(op, ov),
      inputSchema: schema,
      annotations: {
        title: op.summary || name,
        readOnlyHint: isRead,
        destructiveHint: ov?.destructive ?? op.method === "DELETE",
        idempotentHint: isRead || op.method === "PUT" || op.method === "DELETE",
        openWorldHint: true,
      },
      versionHeader: ov?.versionHeader ?? op.versionHeader,
      contentType,
      paramIndex: idx,
    });
  }

  return { tools, byName: new Map(tools.map((t) => [t.name, t])), skipped };
}
