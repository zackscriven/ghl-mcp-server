/**
 * Shared authenticated request helper.
 *
 * Key design points (each traces to a confirmed failure of the old connector):
 * - The `Version` header is resolved PER OPERATION from the spec that documents
 *   that exact endpoint (legacy 2021-04-15, legacy 2021-07-28, and v3 all
 *   coexist in the live API). Never a global constant.
 * - Query params are passed through verbatim, including cursor/offset params
 *   (startAfter, startAfterId, page, limit, offset, skip) so pagination
 *   actually moves — the old connector accepted and then ignored them.
 * - Errors return the real HTTP status + response body so an agent can act.
 */
import type { Config } from "./config.js";
import type { Operation } from "./types.js";

export interface CallArgs {
  pathParams: Record<string, string>;
  queryParams: Record<string, unknown>;
  headerParams: Record<string, string>;
  body: unknown;
}

export interface GhlResponse {
  ok: boolean;
  status: number;
  data: unknown;
  requestUrl: string;
}

export async function callGhl(
  config: Config,
  op: Operation,
  versionHeader: string,
  args: CallArgs,
  contentType = "application/json"
): Promise<GhlResponse> {
  if (!config.apiKey) {
    throw new Error(
      "No API key configured. Set GHL_API_KEY (or HD_GHL_API_KEY) in the environment."
    );
  }

  let path = op.path;
  for (const [k, v] of Object.entries(args.pathParams)) {
    path = path.replace(`{${k}}`, encodeURIComponent(v));
  }
  const unresolved = path.match(/\{[^}]+\}/g);
  if (unresolved) {
    throw new Error(
      `Missing required path parameter(s): ${unresolved.join(", ")}. Provide them as tool arguments.`
    );
  }

  const url = new URL(config.baseUrl + path);
  for (const [k, v] of Object.entries(args.queryParams)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) for (const item of v) url.searchParams.append(k, String(item));
    else url.searchParams.set(k, String(v));
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    Accept: "application/json",
    ...args.headerParams,
  };
  if (versionHeader) headers["Version"] = versionHeader;

  const init: RequestInit = { method: op.method, headers };
  if (args.body !== undefined && args.body !== null && op.method !== "GET") {
    if (contentType === "application/json") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(args.body);
    } else if (contentType === "application/x-www-form-urlencoded") {
      headers["Content-Type"] = contentType;
      const form = new URLSearchParams();
      for (const [k, v] of Object.entries(args.body as Record<string, unknown>)) {
        if (v !== undefined && v !== null) form.set(k, String(v));
      }
      init.body = form.toString();
    } else if (contentType.startsWith("multipart/")) {
      // Build real multipart bodies. File fields may be passed as
      // { filePath, filename?, mimeType? } — read from disk and attached.
      const fd = new FormData();
      for (const [k, v] of Object.entries(args.body as Record<string, unknown>)) {
        if (v === undefined || v === null) continue;
        if (typeof v === "object" && v !== null && "filePath" in (v as object)) {
          const f = v as { filePath: string; filename?: string; mimeType?: string };
          const { readFileSync } = await import("node:fs");
          const buf = readFileSync(f.filePath);
          const blob = new Blob([buf], { type: f.mimeType ?? "application/octet-stream" });
          fd.append(k, blob, f.filename ?? f.filePath.split("/").pop() ?? "file");
        } else if (typeof v === "object") {
          fd.append(k, JSON.stringify(v));
        } else {
          fd.append(k, String(v));
        }
      }
      init.body = fd; // fetch sets the multipart boundary Content-Type itself
    } else {
      headers["Content-Type"] = contentType;
      init.body = args.body as BodyInit;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  init.signal = controller.signal;

  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      /* keep raw text */
    }
    return { ok: res.ok, status: res.status, data, requestUrl: url.toString() };
  } catch (e) {
    const msg = e instanceof Error && e.name === "AbortError"
      ? `Request timed out after ${config.timeoutMs}ms`
      : String(e);
    throw new Error(`GHL request failed (${op.method} ${url}): ${msg}`);
  } finally {
    clearTimeout(timer);
  }
}
