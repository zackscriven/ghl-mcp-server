#!/usr/bin/env node
/**
 * extract-operations.mjs — Phase 0/1 generator for ghl-mcp-server-v2.
 *
 * Parses every GoHighLevel OpenAPI spec (legacy apps/*.json + apps/v3/*.json),
 * dedupes operations by METHOD+path (preferring the v3 spec variant, which
 * carries the current Version header and newest schema), fully dereferences
 * all $refs, and emits src/generated/operations.json.
 *
 * Design rationale (see README): schemas are carried verbatim from the specs,
 * so no request field can be silently dropped by hand-transcription — the
 * exact failure mode of the previous connector (assignedTo, customFields,
 * tags, dnd, etc. missing from update_contact/update_opportunity).
 *
 * Env:
 *   GHL_SPECS_DIR — path to a local clone of GoHighLevel's official
 *   highlevel-api-docs repo, pointing at its `apps/` directory
 *   (https://github.com/GoHighLevel/highlevel-api-docs). Required.
 */
import fs from "node:fs";
import path from "node:path";

const SPECS_DIR = process.env.GHL_SPECS_DIR;
if (!SPECS_DIR || !fs.existsSync(SPECS_DIR)) {
  console.error(
    "GHL_SPECS_DIR must point at the `apps/` directory of a local clone of " +
      "GoHighLevel/highlevel-api-docs. Example:\n" +
      '  GHL_SPECS_DIR="/path/to/highlevel-api-docs/apps" npm run extract'
  );
  process.exit(1);
}

const OUT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "src",
  "generated",
  "operations.json"
);

const listJson = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => path.join(dir, f))
    : [];

const legacyFiles = listJson(SPECS_DIR);
const v3Files = listJson(path.join(SPECS_DIR, "v3"));

/** Fully dereference $refs within a spec (cycle-safe: cycles become {}) */
function deref(node, spec, seen = new Set()) {
  if (Array.isArray(node)) return node.map((n) => deref(n, spec, seen));
  if (node && typeof node === "object") {
    if (typeof node.$ref === "string") {
      if (seen.has(node.$ref)) return { description: "[circular ref: " + node.$ref + "]" };
      const target = node.$ref
        .replace(/^#\//, "")
        .split("/")
        .reduce((acc, k) => (acc == null ? undefined : acc[decodeURIComponent(k.replace(/~1/g, "/").replace(/~0/g, "~"))]), spec);
      if (target === undefined) return { description: "[unresolved ref: " + node.$ref + "]" };
      const nextSeen = new Set(seen);
      nextSeen.add(node.$ref);
      return deref(target, spec, nextSeen);
    }
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = deref(v, spec, seen);
    return out;
  }
  return node;
}

function versionOf(params) {
  for (const p of params) {
    if (p?.in === "header" && String(p?.name).toLowerCase() === "version") {
      return p.schema?.default ?? p.schema?.enum?.[0] ?? p.example ?? "";
    }
  }
  return "";
}

function extractFile(file, tier) {
  const rel = tier === "v3" ? "v3/" + path.basename(file) : path.basename(file);
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return [{ parseError: rel, message: String(e).slice(0, 200) }];
  }
  const ops = [];
  for (const [p, methods] of Object.entries(spec.paths ?? {})) {
    const common = methods.parameters ?? [];
    for (const [m, op] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(m)) continue;
      const rawParams = [...(op.parameters ?? []), ...common];
      const params = deref(rawParams, spec);
      const body = op.requestBody ? deref(op.requestBody, spec) : null;
      const security = op.security ?? spec.security ?? [];
      const scopes = [...new Set(security.flatMap((s) => Object.values(s).flat()))];
      const securitySchemes = [...new Set(security.flatMap((x) => Object.keys(x)))].filter((x) => x !== "bearer").sort();
      ops.push({
        specFile: rel,
        tier,
        tags: op.tags ?? [],
        operationId: op.operationId ?? "",
        method: m.toUpperCase(),
        path: p,
        versionHeader: versionOf(params),
        summary: op.summary ?? "",
        description: (op.description ?? "").slice(0, 2000),
        deprecated: !!op.deprecated,
        scopes,
        securitySchemes,
        parameters: params.filter(
          (x) => !(x.in === "header" && ["version", "authorization"].includes(String(x.name).toLowerCase()))
        ),
        requestBody: body,
      });
    }
  }
  return ops;
}

const all = [];
for (const f of legacyFiles) all.push(...extractFile(f, "legacy"));
for (const f of v3Files) all.push(...extractFile(f, "v3"));

const errors = all.filter((o) => o.parseError);
const ops = all.filter((o) => !o.parseError);

// Dedupe by METHOD + path SHAPE (param names normalised, so a rename such as
// {audienceId} -> {customAudienceId} or {id} -> {emailMessageId} does not emit
// a duplicate tool bound to the legacy twin); prefer the v3 variant and keep a
// pointer to the legacy twin.
const shape = (o) => o.method + " " + o.path.replace(/\{[^}]+\}/g, "{}");
const byKey = new Map();
for (const o of ops) {
  const key = shape(o);
  const cur = byKey.get(key);
  if (!cur) byKey.set(key, o);
  else if (o.tier === "v3" && cur.tier === "legacy") {
    o.legacyTwin = { specFile: cur.specFile, versionHeader: cur.versionHeader, operationId: cur.operationId };
    byKey.set(key, o);
  } else if (o.tier === "legacy" && cur.tier === "v3") {
    cur.legacyTwin = { specFile: o.specFile, versionHeader: o.versionHeader, operationId: o.operationId };
  }
}

// Legacy-fallback flag: a legacy-only op whose service HAS a v3 spec but whose
// endpoint is absent from it was removed from the live v3 docs. It still works
// against the old Version header, so we keep it, flagged, for one minor release.
const v3Services = new Set(v3Files.map((f) => path.basename(f).replace(/-v3\.json$/, "")));
let legacyFallbackCount = 0;
for (const o of byKey.values()) {
  const svc = o.specFile.replace(/^v3\//, "").replace(/(-v3)?\.json$/, "");
  if (o.tier === "legacy" && v3Services.has(svc)) {
    o.legacyFallback = true;
    legacyFallbackCount++;
  }
}

// Version-header drift report vs the previous operations.json. A header change
// silently changes request behaviour, so unexpected drift fails the build
// unless GHL_ACCEPT_HEADER_CHANGES=1 (the report is written either way).
let headerChanges = [];
if (fs.existsSync(OUT)) {
  try {
    const prev = JSON.parse(fs.readFileSync(OUT, "utf8")).operations ?? [];
    const prevByShape = new Map(prev.map((o) => [shape(o), o]));
    for (const [k, o] of byKey) {
      const p = prevByShape.get(k);
      if (p && p.versionHeader !== o.versionHeader) {
        headerChanges.push({ key: k, from: p.versionHeader, to: o.versionHeader });
      }
    }
  } catch {
    /* no usable previous file */
  }
}

const result = {
  generatedAt: new Date().toISOString(),
  specsDir: path.basename(path.resolve(SPECS_DIR)), // basename only — no local paths in the artifact
  totals: { rawOperations: ops.length, uniqueOperations: byKey.size, parseErrors: errors.length },
  errors,
  operations: [...byKey.values()].sort((a, b) =>
    (a.specFile + a.path + a.method).localeCompare(b.specFile + b.path + b.method)
  ),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
console.log(`Wrote ${byKey.size} unique operations (${ops.length} raw) → ${OUT}`);
console.log(`Legacy-fallback ops (removed from live v3 docs, kept flagged): ${legacyFallbackCount}`);
if (errors.length) console.error("Parse errors:", errors);
if (headerChanges.length) {
  const tally = {};
  for (const c of headerChanges) tally[`${c.from || "(none)"} -> ${c.to || "(none)"}`] = (tally[`${c.from || "(none)"} -> ${c.to || "(none)"}`] ?? 0) + 1;
  const report = path.resolve(path.dirname(OUT), "version-header-changes.json");
  fs.writeFileSync(report, JSON.stringify({ generatedAt: result.generatedAt, tally, changes: headerChanges }, null, 1));
  console.log("Version header changes vs previous operations.json:", tally, "→", report);
  if (process.env.GHL_ACCEPT_HEADER_CHANGES !== "1") {
    console.error("Header drift is not accepted. Review the report, then re-run with GHL_ACCEPT_HEADER_CHANGES=1.");
    process.exit(2);
  }
}
