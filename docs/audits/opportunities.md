# Opportunities domain audit

Scope: all 12 operations in `apps/v3/opportunities-v3.json` under `/opportunities*` (opportunities CRUD/search/upsert/followers/status, plus the nested `/opportunities/pipelines` and `/opportunities/lost-reason` reads). Confirmed this is the full set: `operations.json` filtered for opportunity/pipeline paths returns exactly these 12, matching `paths × methods` in the spec file 1:1. The legacy twin (`apps/opportunities.json`, header `2021-07-28`) exists for every op but the v3 variant is what generation carries (v3-preferred dedup rule), so this audit is against the v3 spec throughout.

## Method

For each op: pulled the operation straight from `apps/v3/opportunities-v3.json` (parameters, requestBody, `$ref`-resolved schemas, deprecated flag, security scopes), pulled the matching entry from `src/generated/operations.json`, and diffed property-for-property. Cross-checked `docs/generated-names.json` for naming. Used `mcp__ghl-docs__ghl_docs_context` once to compare the legacy vs v3 spec shapes for `/opportunities/search`, which explained the regression root cause (see below). No live API calls made.

## Mandatory regression checks

### 1. `PUT /opportunities/{id}` body — CONFIRMED FIXED

Old connector silently dropped `assignedTo`, `pipelineId`, `forecastExpectedCloseDate`, `forecastProbability`, `customFields`.

Spec (`UpdateOpportunityDtoV3`) properties: `pipelineId`, `name`, `pipelineStageId`, `status`, `monetaryValue`, `forecastExpectedCloseDate`, `forecastProbability`, `assignedTo`, `customFields`.

`operations.json`'s extracted `requestBody.content["application/json"].schema.properties` contains all 9, byte-for-byte matching the spec including the fully dereferenced 3-variant `customFields` `anyOf` (string / array / object `fieldValue` variants, each with `id`-or-`key`). No extraction loss. No override needed — the generator already gets this right.

### 2. `GET /opportunities/search` pagination/filter params — CONFIRMED FIXED

Old connector ignored `offset`/`contact_id`/`startAfter`/`startAfterId` and could never reach past page 1 of 100 on a live 264-opportunity pipeline.

Spec query params (19, plus the `Version` header): `q`, `status`, `campaignId`, `id`, `order`, `endDate`, `startAfter`, `startAfterId`, `date`, `country`, `page`, `limit`, `getTasks`, `getNotes`, `getCalendarEvents`, `locationId` (required), `pipelineId`, `pipelineStageId`, `contactId`, `assignedTo`.

`operations.json`'s extracted `parameters` list contains all 20 (19 query + `id`... actually `Version` is stripped from the params array by design, `id` is not part of this op — the 20th confirmed name in the dump was `assignedTo`, full list verified: `q, status, campaignId, id, order, endDate, startAfter, startAfterId, date, country, page, limit, getTasks, getNotes, getCalendarEvents, locationId, pipelineId, pipelineStageId, contactId, assignedTo`). No extraQueryParams override needed — the spec already documents everything and generation already honors it.

**Root cause, for the record**: pulled up the legacy spec (`apps/opportunities.json`, header `2021-07-28`) via the docs corpus for comparison. It uses **snake_case** param/body names (`location_id`, `pipeline_id`, `pipeline_stage_id`, `contact_id`) and is missing `startAfter`/`startAfterId`/`page`/`assignedTo`/`status`/`q`/`date`/`country` entirely — those are v3-only additions with **camelCase** names. The old connector's behavior (silently dropping exactly these fields) is consistent with it having been built against the legacy snake_case shape while pointed at the v3 endpoint. Since this audit's 12 ops are sourced exclusively from the v3 spec with a clean `$ref`-resolved extraction, the fix here is structural — right spec, fully extracted — not a targeted patch.

### 3. Version header — CONFIRMED v3 for all 12 ops

Every operation in `apps/v3/opportunities-v3.json` declares `"Version"` header with `enum: ["v3"]`, and every corresponding `operations.json` entry has `versionHeader: "v3"`. No `versionHeader` overrides needed.

## Pagination mechanism (documented per BRIEF requirement #4)

`GET /opportunities/search`'s response (`SearchSuccessfulResponseDto`) returns `opportunities[]` plus a `meta` object (`SearchMetaResponseSchema`):

- `total` — total matching count
- `nextPageUrl` — a ready-to-use next-page URL (spec example shows it echoes all filter params plus `page`, `startAfter`, `startAfterId`)
- `startAfterId` / `startAfter` — cursor id + timestamp for the next page
- `currentPage` / `nextPage` / `prevPage` — page-number bookkeeping

Two valid ways to page through the full result set, both now exposed as plain query params on `ghl_opportunity_search`:

1. **Page-based**: increment `page` (1-based) with a fixed `limit` (default 20, max 100) until results run out or `page` exceeds `meta.nextPage`.
2. **Cursor-based** (recommended for deep pagination on large pipelines): take `meta.startAfter` and `meta.startAfterId` from the previous response and pass them back as the `startAfter`/`startAfterId` query params on the next call. This is exactly the mechanism the old connector never wired up — it's why a live 264-opportunity pipeline could never be paged past the first 100.

Documented in a `descriptionNote` override on `GET /opportunities/search` so the tool description itself carries this guidance for callers.

## Request body completeness — spot-checked, no extraction loss found

Diffed every requestBody-bearing op's `operations.json` schema against the spec's dereferenced schema:

- `PUT /opportunities/{id}` — 9/9 props (see regression check 1)
- `PUT /opportunities/{id}/status` — `status`, `lostReasonId` — 2/2
- `POST /opportunities/{id}/followers` — `followers` — 1/1
- `DELETE /opportunities/{id}/followers` — body `followers` (`FollowersDTO`) **plus** a separate `isRemoveAllFollowers` query param — both present. Notable: this DELETE op carries both a query param and a JSON body, which is unusual but spec-documented and correctly extracted on both sides.
- `POST /opportunities/` (create) — `pipelineId`, `locationId`, `name`, `pipelineStageId`, `status`, `contactId`, `monetaryValue`, `forecastExpectedCloseDate`, `forecastProbability`, `assignedTo`, `customFields` — 11/11
- `POST /opportunities/search` (advanced) — `locationId`, `query`, `limit`, `page`, `searchAfter`, `additionalDetails` — 6/6
- `POST /opportunities/upsert` — `id`, `pipelineId`, `locationId`, `followers`, `isRemoveAllFollowers`, `followersActionType`, `name`, `status`, `pipelineStageId`, `monetaryValue`, `forecastExpectedCloseDate`, `forecastProbability`, `assignedTo`, `lostReasonId` — 14/14

No gaps found anywhere in this domain.

## Content type

All 12 ops are `application/json`. No multipart/form-data uploads in this domain. No `contentType` overrides needed.

## Deprecated ops

None. All 12 ops report `deprecated: false`/`undefined` in both the spec and `operations.json`. No `skip` entries.

## Under-marked required params

Spot-checked required flags against the spec; nothing under-marked. `locationId` correctly required on `lost-reason`, `pipelines`, and `search` (GET); `id` correctly required as a path param everywhere it appears. No `forceRequired` overrides needed.

## Tool name renames (2 of 12)

| Operation | Generated name | Curated name | Why |
|---|---|---|---|
| `GET /opportunities/pipelines` | `ghl_opportunity_get_pipelines` | `ghl_pipeline_list` | Pipelines are effectively their own resource nested under the `/opportunities` path in the spec; this exact rename is the brief's own worked example (`ghl_pipeline_list`), followed verbatim. |
| `POST /opportunities/search` | `ghl_opportunity_search_opportunities_advanced` | `ghl_opportunity_search_advanced` | Removed the redundant `search_opportunities` stutter — the `ghl_opportunity_` prefix already names the resource. |

The other 10 generated names (`ghl_opportunity_search`, `ghl_opportunity_update`, `ghl_opportunity_create`, `ghl_opportunity_get`, `ghl_opportunity_delete`, `ghl_opportunity_upsert`, `ghl_opportunity_update_status`, `ghl_opportunity_add_followers`, `ghl_opportunity_remove_followers`, `ghl_opportunity_get_lost_reason`) were already clear, correctly resource-prefixed, and left unchanged.

## Exceptions

None. No `skip` entries in this domain — all 12 ops are usable and registered.

## Anything surprising

- `DELETE /opportunities/{id}/followers` accepting both a query param (`isRemoveAllFollowers`) and a JSON body (`followers` via `FollowersDTO`) on a DELETE verb is unusual API design but is spec-documented and both are correctly wired through.
- The legacy (2021-07-28) and v3 specs for `/opportunities/search` diverge enough (snake_case vs camelCase, several v3-only fields) that they explain the two mandatory regressions cleanly — worth flagging to whoever owns the legacy-twin dedup logic, since it confirms the "v3-preferred" dedup rule is exactly the right call for this domain, not just a style preference.

## Deliverables

1. `src/overrides/opportunities.ts` — populated, compiles clean (`npx tsc --noEmit` — no errors).
2. `docs/audits/opportunities.md` — this file.
3. `docs/audits/opportunities-status.json` — all 12 ops, all `"status": "ok"`.
