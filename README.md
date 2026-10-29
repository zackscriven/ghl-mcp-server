# ghl-mcp-server-v2 — The Definitive GoHighLevel MCP Server

A spec-driven MCP server covering **the full public GoHighLevel API surface: 867 unique operations** (v2.1, regenerated 2026-10-28 from the live marketplace docs, 46 v3 services plus the legacy tiers). **855 tools registered**; the other 12 are explicit, itemized exceptions (see `api-coverage-checklist.md`) — never silent omissions.

TypeScript, stdio transport, multi-tenant (`locationId`/`companyId` are call-time parameters — nothing tenant-specific is hardcoded).

## Why this exists

The previous production connector (`MCP_Servers/_to_delete/ghl-mcp-server-v1-retired`) was a thin wrapper with silently incomplete coverage. Confirmed failures, all fixed here and locked in as regression checks (verified per-domain in `docs/audits/`):

| Old connector failure | This server |
|---|---|
| `update_opportunity` dropped `assignedTo`, `pipelineId`, `forecastExpectedCloseDate`, `forecastProbability`, `customFields` | `ghl_opportunity_update` exposes all 9 documented body fields |
| `update_contact` dropped `assignedTo`, `customFields`, `tags`, `dnd`/`dndSettings`/`inboundDndSettings`, address fields, `dateOfBirth`, `source`, `website`, `timezone` | `ghl_contact_update` exposes all 20 documented body fields |
| `create_task` always returned 422 | Root-caused: the API requires `title`, `dueDate` AND `completed` on create; the schema now enforces exactly that (and exposes `assignedTo`) |
| `list_opportunities` could never page past record 100 (ignored `startAfter`/`startAfterId`/`page`) | `ghl_opportunity_search` exposes all ~20 filter/cursor params; cursors pass through verbatim |
| `list_media` 422'd (no way to pass required `type`) | `ghl_media_list_files` requires `type`, `altType`, `altId`, `sortBy`, `sortOrder` per spec |
| Single hardcoded `Version` header | Version header resolved **per operation** from the spec that documents it (v2.1: 806 tools send `v3`, 28 send `2021-07-28`, 21 send `2021-04-15`) |
| Social `create_post` regressed | Schema verified faithful to spec; tool description carries a warning that the live endpoint had a server-side regression as of 2026-07-04 |
| `ghl_conversation_send_message` 422'd on every send (fix 2026-08-26) | Upstream spec bug, not extraction loss: `subType` emitted as an empty `object` schema (live API validates a string enum — `{}` returned `422 CONVERSATIONS_VALIDATION_ERROR`) and `subType`/`status` wrongly listed in `required`. Fixed via the new `patchBody` override layer (`src/overrides/conversations.ts`): both now optional strings, omitted from the outbound body when absent; required is `[type, contactId]`. Resolves the 2026-08-26 send failure. |
| 12 more fields drive-wide emitted as empty `object` schemas (fix 2026-08-27) | Same upstream spec-bug pattern, swept and patched via `patchBody`: contacts `dateOfBirth` (create/update/upsert), associations `firstObjectLabel`/`firstObjectKey`/`secondObjectLabel`/`secondObjectKey` (create/update — these were *required*, so both tools were uncallable), `ghl_opportunity_upsert` `monetaryValue` (→ number), `ghl_phone_purchase_number` `numberType` (required — uncallable), `ghl_product_review_bulk_update` `status` (required — uncallable), social `postType` (→ enum post/story/reel), queue `status`, facebook account `type`. Registry-level regression scan now reports zero empty-object-with-scalar-example fields across all tools. |

## Architecture — how "no silently dropped field" is guaranteed

Tools are **generated from the official OpenAPI specs**, not hand-transcribed:

1. `scripts/extract-operations.mjs` parses every spec file, fully dereferences `$ref`s, dedupes by `METHOD` + path shape — parameter names are ignored, so a spec-side rename like `{id}` → `{emailMessageId}` never duplicates or drops a tool (v3 spec variant preferred; legacy-only operations keep their legacy `Version` header and are flagged `legacyFallback` when the live v3 docs no longer list them), and emits `src/generated/operations.json` with request schemas **verbatim**.
2. `src/registry.ts` builds one MCP tool per operation: path/query/header params become top-level arguments; the request body schema is carried verbatim under a `body` argument. Missing path-param declarations in the spec are inferred from the URL template.
3. `src/overrides/*.ts` — eight domain-audit modules (one per sub-agent) carrying curated tool names, Version-header corrections, content-type overrides (multipart, form-urlencoded), body-schema patches for known-wrong specs (`patchBody`, added 2026-08-26 — see `ghl_conversation_send_message`), agency-token warnings, and the 16 skip-with-reason exceptions.

Because the schema pipeline is mechanical, a field can only be missing if it is missing from GoHighLevel's own published spec — and the three known cases of that are documented in the audits (`POST /contacts/search`, object-record create/update, `POST /forms/upload-custom-files`), each exposed with a permissive body rather than dropped.

## Setup

```bash
npm install
npm run build        # tsc + copies src/generated into build/
npm start            # stdio server
npm run inspect      # MCP Inspector smoke test
```

Client config (e.g. Claude Desktop):

```json
{
  "mcpServers": {
    "ghl-v2": {
      "command": "node",
      "args": ["<path>/ghl-mcp-server/build/index.js"],
      "env": { "GHL_API_KEY": "...", "GHL_ENABLE_WRITES": "false" }
    }
  }
}
```

## Environment variables

| Var | Default | Meaning |
|---|---|---|
| `GHL_API_KEY` (fallback `HD_GHL_API_KEY`) | — | Private-integration token / OAuth access token. Env-only, never hardcoded. |
| `GHL_ENABLE_WRITES` (fallback `HD_GHL_ENABLE_WRITES`) | **unset = read-only** | The dry-run safety gate. Unless set to `true`/`1`, every non-GET call is blocked with an explanatory error (arguments are still validated, so you can dry-run writes). Default-safe because this can point at a live CRM. POST operations that only search or list (operationId `search-*` / `list-*`, plus explicit overrides such as workflow definition validation) are treated as read-only and are not blocked. |
| `GHL_ENABLED_DOMAINS` | all | Comma-separated spec basenames (e.g. `contacts,opportunities,calendars`) to expose a subset of the tools — useful to keep client context small. |
| `GHL_BASE_URL` | `https://services.leadconnectorhq.com` | Override for testing. |
| `GHL_TIMEOUT_MS` | `30000` | Request timeout. |
| `GHL_SPECS_DIR` | — | Only used by `npm run extract`: an `apps/` directory holding the legacy specs plus a `v3/` folder (see *Regenerating from the live docs*). |
| `GHL_ACCEPT_HEADER_CHANGES` | unset | `npm run extract` only: set to `1` to accept Version-header drift versus the previous `operations.json` (the report is always written to `src/generated/version-header-changes.json`). |

## Conventions

- Tool names: `ghl_<resource>_<action>` (snake_case, ≤64 chars), curated per domain (e.g. `ghl_contact_update`, `ghl_opportunity_search`, `ghl_calendar_appointment_create`, `ghl_invoice_schedule_cancel`).
- Names are public API: `src/generated/tool-names.json` pins every tool name, and `npm test` fails if any pinned name changes or an override key matches no operation. New tools are added with `npm run pin-names` after review.
- Annotations: `readOnlyHint` (GET and read-only POST search/list), `destructiveHint` (DELETE), `idempotentHint` (GET/PUT/DELETE), `openWorldHint` always true.
- Token requirements come from each operation's spec security schemes and are stated in the tool description (Agency vs Sub-Account token, OAuth-only variants that reject Private Integration Tokens); 401/403 errors repeat the hint.
- Rate limits: HTTP 429 is retried up to 3 times (honouring `Retry-After`, otherwise 2s/5s/10s); `X-RateLimit-*` values are returned under `structuredContent.rateLimit`.
- Multi-tenant: pass `locationId` / `companyId` / `altId` per call. ~44 platform ops require an **agency-level (Company) token** — their descriptions say so.
- Multipart uploads: pass file fields as `{ "filePath": "...", "filename?": "...", "mimeType?": "..." }` inside `body`; the server builds the multipart request.
- Responses: `structuredContent = { status, ok, data }` plus pretty-printed text; errors return real HTTP status + body + actionable hints.

## Deliverables map

- `api-coverage-checklist.md` — all 667 operations, per-row status, exceptions itemized. **This is the proof of coverage.**
- `docs/audits/*.md` — the 8 domain audit reports (regression verifications, renames, spec bugs found).
- `docs/evaluation.xml` — 10 verified evaluation Q&A pairs (mcp-builder Phase 4 format).
- `src/generated/tool-names.json` — pinned tool names (path-shape key → name). `docs/generated-names.json` is the v2.0 historical map.

## Regenerating from the live docs

The official GitHub spec repo stopped updating in June 2026; the live source is the HighLevel marketplace docs, whose per-endpoint pages each embed one OpenAPI document.

```bash
# 1. Rebuild per-service v3 specs from the docs' LLM bundle (fetches missing pages)
python3 scripts/build-v3-specs.py --fetch --root <bundle dir containing v3/llms.txt>
# 2. Assemble GHL_SPECS_DIR: legacy specs at the top, rebuilt v3 specs under v3/
# 3. Extract, review the Version-header report, then build and test
GHL_SPECS_DIR=<dir> npm run extract      # exits 2 on header drift; re-run with GHL_ACCEPT_HEADER_CHANGES=1 after review
npm run pin-names && npm test && npm run checklist
```

`build-v3-specs.py` sets `operationId` to the docs URL slug (the real operationId — the embedded docs carry regenerated camelCase ids that would rename tools), derives `deprecated` from the page heading/description, and tags each operation with its service.

## Not done here (operator steps)

- **Live testing.** This was a docs-driven build; no live API call was made, including for the 2.1 changes. Smoke-test read-only against a sandbox location, then enable writes deliberately. In particular, 143 operations changed their `Version` header to follow the live docs (see `src/generated/version-header-changes.json`) and none has been exercised against the live API.
- Registering the server in a live MCP config.
- The 12 itemized exceptions in `api-coverage-checklist.md` remain skipped by curated override.
