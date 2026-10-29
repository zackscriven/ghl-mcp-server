#!/usr/bin/env python3
"""
build-v3-specs.py — rebuild per-service OpenAPI 3.0 specs for the HighLevel v3 API
from the marketplace docs' LLM bundle.

Why: GoHighLevel/highlevel-api-docs on GitHub stopped at 2026-06-19. The live
source is https://marketplace.gohighlevel.com/docs, whose per-endpoint `.md`
pages each embed a complete OpenAPI document for that one operation.

Pipeline:
  1. v3/llms.txt           -> list of the 812 endpoint page URLs
  2. v3/pages/<svc>__<slug>.md  (fetched; skipped when present and non-empty)
  3. v3/openapi/<svc>-v3.json   merged per service, drop-in for
                                 ghl-mcp-server's `GHL_SPECS_DIR=<dir>/apps` (copy into apps/v3/)

Fixes applied during the merge (both found in the 2026-10-28 audit):
  * operationId := the page's Docs URL slug (= the real operationId; the embedded
    doc carries a regenerated camelCase id that would rename ~101 tools).
  * deprecated := true when the heading ends "(Deprecated)" or the description
    starts "DEPRECATED" (the embedded docs drop the flag).
  * tags := [service] (embedded docs have none).

Usage:
  python3 build-v3-specs.py [--fetch] [--root <bundle dir>]
  --root defaults to the directory this script lives in.
"""
import argparse, json, os, re, sys, glob, collections, subprocess, concurrent.futures as cf

ap = argparse.ArgumentParser()
ap.add_argument("--root", default=os.path.dirname(os.path.abspath(__file__)))
ap.add_argument("--fetch", action="store_true", help="download missing endpoint pages")
ap.add_argument("--workers", type=int, default=12)
args = ap.parse_args()
ROOT = args.root
V3 = os.path.join(ROOT, "v3")
PAGES = os.path.join(V3, "pages")
OUT = os.path.join(V3, "openapi")
os.makedirs(PAGES, exist_ok=True); os.makedirs(OUT, exist_ok=True)

# 1. endpoint URL list
idx = open(os.path.join(V3, "llms.txt"), encoding="utf-8").read()
urls = sorted(set(re.findall(r"https://marketplace\.gohighlevel\.com/docs/ghl/[a-z0-9-]+/[a-z0-9-]+\.md", idx)))
print(f"endpoints in index: {len(urls)}")

def page_path(u):
    return os.path.join(PAGES, u.split("/docs/ghl/")[1].replace("/", "__"))

# 2. fetch
missing = [u for u in urls if not os.path.getsize(page_path(u)) if os.path.exists(page_path(u))] if False else \
          [u for u in urls if not (os.path.exists(page_path(u)) and os.path.getsize(page_path(u)) > 0)]
if missing and not args.fetch:
    sys.exit(f"{len(missing)} pages missing; re-run with --fetch")
if missing:
    def fetch(u):
        r = subprocess.run(["curl", "-sS", "--max-time", "40", "-o", page_path(u), u], capture_output=True)
        return u if r.returncode else None
    with cf.ThreadPoolExecutor(args.workers) as ex:
        fails = [u for u in ex.map(fetch, missing) if u]
    print(f"fetched {len(missing) - len(fails)}, failed {len(fails)}")
    if fails: sys.exit("\n".join(fails))

# 3. merge
specs, conflicts, stats = {}, collections.Counter(), collections.Counter()
for u in urls:
    svc, slug = u.split("/docs/ghl/")[1][:-3].split("/")
    txt = open(page_path(u), encoding="utf-8").read()
    m = re.search(r"^## OpenAPI Specification\s*\n```json\n(.*?)\n```", txt, re.S | re.M)
    if not m: sys.exit(f"no OpenAPI block: {u}")
    d = json.loads(m.group(1))
    title = txt.split("\n", 1)[0].lstrip("# ").strip()
    doc = specs.setdefault(svc, {
        "openapi": d.get("openapi", "3.0.0"),
        "info": {"title": f"{svc} API (v3)", "version": "v3",
                 "x-source": f"https://marketplace.gohighlevel.com/docs/ghl/{svc}",
                 "x-built-by": "build-v3-specs.py"},
        "servers": d.get("servers", [{"url": "https://services.leadconnectorhq.com"}]),
        "paths": {}, "components": {"schemas": {}, "securitySchemes": {}}, "tags": [{"name": svc}],
    })
    for p, ops in d.get("paths", {}).items():
        for meth, op in ops.items():
            if meth not in ("get", "post", "put", "patch", "delete", "options", "head"): continue
            op["operationId"] = slug                                   # fix 1
            desc = (op.get("description") or op.get("summary") or "").strip()
            if title.lower().endswith("(deprecated)") or re.match(r"^\(?deprecated\b", desc, re.I):
                op["deprecated"] = True                                # fix 2
                stats["deprecated"] += 1
            op.setdefault("tags", [svc])                               # fix 3
            doc["paths"].setdefault(p, {})[meth] = op
            stats["ops"] += 1
    comp = d.get("components", {})
    for kind in ("schemas", "securitySchemes"):
        for k, v in comp.get(kind, {}).items():
            have = doc["components"][kind]
            if k in have and have[k] != v:
                conflicts[(svc, k)] += 1          # same-name DTO with a different shape
            have.setdefault(k, v)

for svc, doc in sorted(specs.items()):
    with open(os.path.join(OUT, f"{svc}-v3.json"), "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2)
print(f"services: {len(specs)}  ops: {stats['ops']}  deprecated: {stats['deprecated']}")
if conflicts:
    print("same-name schema conflicts (first shape kept):")
    for (svc, k), n in sorted(conflicts.items()): print(f"  {svc}: {k} x{n}")
