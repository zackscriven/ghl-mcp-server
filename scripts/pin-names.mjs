#!/usr/bin/env node
/** Adds names for NEW tools to src/generated/tool-names.json. Never rewrites an existing pin. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { buildRegistry } = await import(path.join(root, "build/registry.js"));
const { shapeKey } = await import(path.join(root, "build/naming.js"));
const file = path.join(root, "src/generated/tool-names.json");
const pins = JSON.parse(fs.readFileSync(file, "utf8"));
let added = 0;
for (const t of buildRegistry(null).tools) {
  const k = shapeKey(t.op.method, t.op.path);
  if (!(k in pins)) { pins[k] = t.name; added++; }
}
fs.writeFileSync(file, JSON.stringify(Object.fromEntries(Object.entries(pins).sort()), null, 1) + "\n");
console.log(`pinned ${added} new name(s); ${Object.keys(pins).length} total`);
