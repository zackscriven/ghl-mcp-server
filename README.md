# ghl-mcp-server-v2 — The Definitive GoHighLevel MCP Server

A from-the-ground-up MCP server covering **the full public GoHighLevel API surface: 667 unique operations** enumerated from the complete official OpenAPI spec corpus (84 spec files, legacy + v3 tiers). **651 tools registered**; the other 16 are explicit, itemized exceptions (see `api-coverage-checklist.md`) — never silent omissions.

Built 2026-07-16 in a Cowork session (orchestrator + 8 parallel domain-audit sub-agents), following the `mcp-builder` skill's four-phase workflow. TypeScript, stdio transport, multi-tenant (`locationId`/`companyId` are call-time parameters — nothing tenant-specific is hardcoded).

## Why this exists

The previous production connector (`MCP_Servers/_to_delete/ghl-mcp-server-v1-retired`) was a thin wrapper with silently incomplete coverage. Confirmed failures, all fixed here and locked in as regression checks (verified per-domain in `docs/audits/`):

| Old connector failure | This server |
|---|---|
| `update_opportunity` dropped `assignedTo`, `pipelineId`, `forecastExpectedCloseDate`, `forecastProbability`, `customFields` | `ghl_opportunity_update` exposes all 9 documented body fields |
| `update_contact` dropped `assignedTo`, `customFields`, `tags`, `dnd`/`dndSettings`/`inboundDndSettings`, address fields, `dateOfBirth`, `source`, `website`, `timezone` | `ghl_contact_update` exposes all 20 documented body fields |
| `create_task` always returned 422 | Root-caused: the API requires `title`, `dueDate` AND `completed` on create; the schema now enforces exactly that (and exposes `assignedTo`) |
| `list_opportunities` could never page past record 100 (ignored `startAfter`/`startAfterId`/`page`) | `ghl_opportunity_search` exposes all ~20 filter/cursor params; cursors pass through verbatim |
| `list_media` 422'd (no way to pass required `type`) | `ghl_media_list_files` requires `type`, `altType`, `altId`, `sortBy`, `sortOrder` per spec |
| Single hardcoded `Version` header | Version header resolved **per operation** from the spec that documents it (494 tools send `v3`, 117 send `2021-07-28`, 10 send `2021-04-15`, 30 send none — e.g. store ops) |
| Social `create_post` regressed | Schema verified faithful to spec; tool description carries a warning that the live endpoint had a server-side regression as of 2026-07-04 |

## Architecture — how "no silently dropped field" is guaranteed

Tools are **generated from the official OpenAPI specs**, not hand-transcribed:

1. `scripts/extract-operations.mjs` parses every spec file, fully dereferences `$ref`s, dedupes by `METHOD /path` (v3 spec variant preferred; legacy-only operations keep their legacy `Version` header), and emits `src/generated/operations.json` with request schemas **verbatim**.
2. `src/registry.ts` builds one MCP tool per operation: path/query/header params become top-level arguments; the request body schema is carried verbatim under a `body` argument. Missing path-param declarations in the spec are inferred from the URL template.
3. `src/overrides/*.ts` — eight domain-audit modules (one per sub-agent) carrying curated tool names, Version-header corrections, content-type overrides (multipart, form-urlencoded), agency-token warnings, and the 16 skip-with-reason exceptions.

Because the schema pipeline is mechanical, a field can only be missing if it is missing from GoHighLevel's own published spec — and the three known cases of that are documented in the audits (`POST /contacts/search`, object-record create/update, `POST /forms/upload-custom-files`), each exposed with a permissive body rather than dropped.

## Setup

```bash
npm install
npm run build        # tsc + copies src/generated into build/
npm start            # stdio server
npm run inspect      # MCP Inspector smoke test
```

Client config (e.g. Claude Desktop / Cowork):

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
| `GHL_ENABLE_WRITES` (fallback `HD_GHL_ENABLE_WRITES`) | **unset = read-only** | The dry-run safety gate. Unless set to `true`/`1`, every non-GET call is blocked with an explanatory error (arguments are still validated, so you can dry-run writes). Default-safe because this can point at a live healthcare-business CRM. |
| `GHL_ENABLED_DOMAINS` | all | Comma-separated spec basenames (e.g. `contacts,opportunities,calendars`) to expose a subset of the 651 tools — useful to keep client context small. |
| `GHL_BASE_URL` | `https://services.leadconnectorhq.com` | Override for testing. |
| `GHL_TIMEOUT_MS` | `30000` | Request timeout. |
| `GHL_SPECS_DIR` | (PPC corpus path) | Only used by `npm run extract` to regenerate `operations.json` when GHL ships spec updates. |

## Conventions

- Tool names: `ghl_<resource>_<action>` (snake_case, ≤64 chars), curated per domain (e.g. `ghl_contact_update`, `ghl_opportunity_search`, `ghl_calendar_appointment_create`, `ghl_invoice_schedule_cancel`).
- Annotations: `readOnlyHint` (GET), `destructiveHint` (DELETE), `idempotentHint` (GET/PUT/DELETE), `openWorldHint` always true.
- Multi-tenant: pass `locationId` / `companyId` / `altId` per call. ~44 platform ops require an **agency-level (Company) token** — their descriptions say so.
- Multipart uploads: pass file fields as `{ "filePath": "...", "filename?": "...", "mimeType?": "..." }` inside `body`; the server builds the multipart request.
- Responses: `structuredContent = { status, ok, data }` plus pretty-printed text; errors return real HTTP status + body + actionable hints.

## Deliverables map

- `api-coverage-checklist.md` — all 667 operations, per-row status, exceptions itemized. **This is the proof of coverage.**
- `docs/audits/*.md` — the 8 domain audit reports (regression verifications, renames, spec bugs found).
- `docs/evaluation.xml` — 10 verified evaluation Q&A pairs (mcp-builder Phase 4 format).
- `docs/generated-names.json` — `"METHOD /path"` → tool-name map.

## Not done here (operator steps)

- **Live testing.** This was a docs-driven build; no live GHL call was made. Smoke-test read-only against a real location, then enable writes deliberately.
- Registering the server in a live MCP config (kept separate from the existing `ghl-mcp-server` registration — do not overwrite it without deciding to retire the old one).
- Re-run `npm run extract && npm run build` when GHL ships API changes; the checklist regenerates from the same pipeline.
