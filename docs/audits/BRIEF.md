# Domain Audit Brief — ghl-mcp-server-v2 (shared instructions for all domain auditors)

## Context

You are auditing one domain of a comprehensive GoHighLevel MCP server. The server auto-generates its 667 tools from `src/generated/operations.json`, whose request schemas were extracted **verbatim** from the official OpenAPI specs (both legacy `apps/*.json` and `apps/v3/*.json`, deduped by METHOD+path with the v3 variant preferred). Your job is NOT to write tools — it is to **audit and curate** your domain so nothing is silently wrong, then record results.

Paths:
- Project (Read/Write/Edit tools): `<project root>`
- Project (bash): `<project root>`
- Official specs (bash): `<local clone of GoHighLevel/highlevel-api-docs>/apps`
- Official specs (Read tool): `<local clone of GoHighLevel/highlevel-api-docs>/apps`
- Generated ops: `src/generated/operations.json` (large — filter with `node -e` or `python3`, don't Read it whole)
- Derived tool names: `docs/generated-names.json` (key = `"METHOD /path"`)

You may also use the `mcp__ghl-docs__ghl_docs_context` tool (namespaces `api`, `help`) and `mcp__ghl-docs__ghl_docs_get` for webhook/help-center/ambiguity questions. The spec JSON files on disk are the same corpus, untruncated — prefer them for schema ground truth. **Never conclude from a truncated excerpt.**

## What to check, per operation in your domain

1. **Version header** — matches what the canonical spec file documents for that exact operation. Legacy-only ops keep `2021-04-15`/`2021-07-28`; v3-preferred ops use `v3`. Only add a `versionHeader` override if the generated value is demonstrably wrong.
2. **Request body completeness** — spot-check that `operations.json` carries every settable property the spec shows (compare against the spec file directly). Report any extraction loss immediately in your audit file.
3. **Content type** — if an op's requestBody is `multipart/form-data` (uploads) or anything non-JSON, add a `contentType` override + `descriptionNote` explaining how to pass the body.
4. **Pagination** — list ops must expose their cursor/offset params (`limit`, `offset`, `page`, `skip`, `startAfter`, `startAfterId`, …). If the spec under-documents a param the API actually accepts (verify via docs corpus), add `extraQueryParams` with a note.
5. **Under-marked required params** — e.g. `GET /medias/files` requires `type`, `altType`, `altId` per its spec. Where the spec marks them, generation already honors it; only add `forceRequired` when docs say required but spec doesn't mark it.
6. **Deprecated ops** — keep them registered, add `descriptionNote` naming the replacement if the docs give one. Only `skip` an op if it is truly unusable (needs reason; it becomes a reported exception).
7. **Tool names** — review your domain's names in `docs/generated-names.json`. Rename awkward/ambiguous ones via the `name` override. Rules: `ghl_<resource>_<action>`, snake_case, ≤64 chars, keep the resource prefix, must remain unique server-wide (stay within your prefix and you're safe).

## Override API (src/types.ts)

```ts
interface OperationOverride {
  name?: string;
  descriptionNote?: string;
  skip?: { reason: string };
  versionHeader?: string;
  extraQueryParams?: Array<{ name: string; schema: Record<string, unknown>; description: string }>;
  forceRequired?: string[];
  contentType?: string;
}
```

Your override file exports `{ domain, notes: string[], overrides: Record<"METHOD /path", OperationOverride> }`. Key must match `operations.json` exactly.

## Deliverables (all three, nothing else — do not touch other files)

1. `src/overrides/<yourdomain>.ts` — fully populated. Must compile: `cd <project bash path> && npx tsc --noEmit` (fix your file if it errors; other files are known-good).
2. `docs/audits/<yourdomain>.md` — audit report: what you verified, renames made, exceptions, multipart/pagination findings, regression-check results, anything surprising.
3. `docs/audits/<yourdomain>-status.json` — `{"METHOD /path": {"status": "ok" | "exception", "note": "..."}}` covering EVERY operation in your assigned spec files (use operations.json as the row source).

Be exhaustive but mechanical. This is a docs-driven audit: make NO live API calls.
