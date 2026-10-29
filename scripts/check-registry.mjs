#!/usr/bin/env node
/**
 * check-registry.mjs — regression gate (npm test). Fails when:
 *  1. a pinned tool name (src/generated/tool-names.json) is missing or changed
 *     — tool names are public API;
 *  2. two tools share a name, or a name exceeds 64 chars;
 *  3. an override key matches no operation (silently lost curation);
 *  4. an operation has no pinned name yet (run `npm run pin-names` after reviewing new tools).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { buildRegistry } = await import(path.join(root, "build/registry.js"));
const { allOverrides } = await import(path.join(root, "build/overrides/index.js"));
const { shapeKey } = await import(path.join(root, "build/naming.js"));
const pins = JSON.parse(fs.readFileSync(path.join(root, "src/generated/tool-names.json"), "utf8"));
const ops = JSON.parse(fs.readFileSync(path.join(root, "src/generated/operations.json"), "utf8")).operations;
const reg = buildRegistry(null);
const fails = [];

const byShape = new Map(reg.tools.map((t) => [shapeKey(t.op.method, t.op.path), t.name]));
for (const s of reg.skipped) byShape.set(shapeKey(...s.key.split(/ (.*)/s).slice(0, 2)), s.name);
for (const [k, name] of Object.entries(pins)) {
  if (!byShape.has(k)) fails.push(`pinned op missing: ${k} (${name})`);
  else if (byShape.get(k) !== name) fails.push(`name changed: ${k}: ${name} -> ${byShape.get(k)}`);
}
for (const t of reg.tools) {
  const k = shapeKey(t.op.method, t.op.path);
  if (!(k in pins)) fails.push(`unpinned new tool: ${t.name} (${k})`);
}
const seen = new Map();
for (const t of reg.tools) {
  if (t.name.length > 64) fails.push(`name too long: ${t.name}`);
  if (seen.has(t.name)) fails.push(`duplicate name: ${t.name}`);
  seen.set(t.name, 1);
}
const opShapes = new Set(ops.map((o) => shapeKey(o.method, o.path)));
for (const dom of allOverrides) {
  for (const key of Object.keys(dom.overrides)) {
    const [m, ...rest] = key.split(" ");
    if (!opShapes.has(shapeKey(m, rest.join(" ")))) fails.push(`orphaned override key: ${key}`);
  }
}
if (fails.length) {
  console.error(fails.join("\n"));
  console.error(`\n${fails.length} registry check failure(s).`);
  process.exit(1);
}
console.log(`registry ok: ${reg.tools.length} tools, ${Object.keys(pins).length} pinned names, ${reg.skipped.length} skipped`);
