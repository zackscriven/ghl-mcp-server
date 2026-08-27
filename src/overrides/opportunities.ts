/** Curated overrides for the opportunities domain — populated by the domain audit. */
import type { DomainOverrides } from "../types.js";

export const opportunitiesOverrides: DomainOverrides = {
  domain: "opportunities",
  notes: [
    "Audited against apps/v3/opportunities-v3.json (v3 tier, preferred) for all 12 ops; the legacy apps/opportunities.json twin (2021-07-28) exists for every op but v3 is what operations.json carries.",
    "REGRESSION CHECK 1 (PUT /opportunities/{id} body): CONFIRMED FIXED. operations.json's requestBody schema for update-opportunity now contains all 9 UpdateOpportunityDtoV3 properties — pipelineId, name, pipelineStageId, status, monetaryValue, forecastExpectedCloseDate, forecastProbability, assignedTo, customFields (with the 3-variant customFields anyOf fully dereferenced). No extraction loss. No override needed.",
    "REGRESSION CHECK 2 (GET /opportunities/search pagination/filter params): CONFIRMED FIXED. operations.json exposes all 19 query params from the v3 spec: q, status, campaignId, id, order, endDate, startAfter, startAfterId, date, country, page, limit, getTasks, getNotes, getCalendarEvents, locationId, pipelineId, pipelineStageId, contactId, assignedTo. No extraQueryParams override needed — the spec is already complete and generation already honors it.",
    "Likely root cause of both old-connector regressions: the legacy spec (apps/opportunities.json, header 2021-07-28) uses snake_case query/body param names (location_id, pipeline_id, pipeline_stage_id, contact_id) while the v3 spec (apps/v3/opportunities-v3.json, header 'v3') renamed the same fields to camelCase (locationId, pipelineId, pipelineStageId, contactId) and added startAfter/startAfterId/page/assignedTo/status/q/date/country that don't exist at all in the legacy body/query shape. The old connector appears to have been built against (or partially against) the legacy shape while calling the v3 endpoint, so any v3-only or renamed field was silently dropped. This audit's ops are all sourced from the v3 spec exclusively, so the fix is structural (right spec, fully extracted), not a patch.",
    "Pagination mechanism for GET /opportunities/search (documented per BRIEF #4): the v3 response (SearchSuccessfulResponseDto) returns opportunities[] plus meta (SearchMetaResponseSchema: total, nextPageUrl, startAfterId, startAfter, currentPage, nextPage, prevPage). Two valid ways to page through the full set: (a) page-based — increment `page` (1-based) using `limit` (default 20, max 100) until `page > meta.nextPage`/results run dry; or (b) cursor-based — read `meta.startAfter` (timestamp) and `meta.startAfterId` (opportunity id) from the prior response and pass them back as the `startAfter`/`startAfterId` query params, which is the pattern GHL recommends for deep pagination past large result sets (this is exactly what the old connector never wired up, capping it at page 1 of 100 on a live 264-opportunity pipeline). Both paths are now fully exposed as plain query params on ghl_opportunity_search — no extraQueryParams override was needed since the spec already documents them completely.",
    "Version header: verified v3 for all 12 ops (matches the 'Version: v3' enum on every operation in apps/v3/opportunities-v3.json). No versionHeader overrides.",
    "Content type: all 12 ops are application/json (including the two ops with both a query param and a JSON body — DELETE .../followers takes isRemoveAllFollowers as a query param AND a FollowersDTO body). No multipart/form-data ops in this domain. No contentType overrides.",
    "Deprecated ops: none. All 12 ops have deprecated:false/undefined in both operations.json and the source spec. No skip entries.",
    "Required params: spot-checked against spec; nothing under-marked. locationId is correctly required on lost-reason/pipelines/search(GET); id is correctly required on the /{id} path ops. No forceRequired overrides.",
    "Renames (2 of 12; brief-cited example ghl_pipeline_list followed intentionally): GET /opportunities/pipelines auto-derived to ghl_opportunity_get_pipelines -> renamed ghl_pipeline_list (pipelines are effectively their own resource nested under the opportunities path; matches the brief's own naming example verbatim). POST /opportunities/search auto-derived to ghl_opportunity_search_opportunities_advanced (redundant 'search_opportunities' stutter since the resource prefix already says opportunity) -> renamed ghl_opportunity_search_advanced. The other 10 generated names were already clear, correctly resource-prefixed, and left as-is.",
  ],
  overrides: {
    "POST /opportunities/upsert": {
      patchBody: {
        properties: {
          monetaryValue: {
            type: "number",
            description:
              "Monetary value of the opportunity, e.g. 220. (Spec bug override 2026-08-27: upstream declares this as an empty object schema with a numeric example, which rejected every numeric value client-side.)",
          },
        },
        note: "2026-08-27: upstream spec bug — monetaryValue emitted as empty object schema (example 220); coerced to number. Note the sibling create/update ops declare it correctly as number — upsert was the odd one out.",
      },
    },
    "GET /opportunities/pipelines": {
      name: "ghl_pipeline_list",
      descriptionNote:
        "Lists pipelines (and their stages) for a location. Named as its own pipeline_* tool per house convention even though it lives under the /opportunities path in the spec.",
    },
    "POST /opportunities/search": {
      name: "ghl_opportunity_search_advanced",
      descriptionNote:
        "Advanced filter-combination search (POST body: locationId, query, limit, page, searchAfter, additionalDetails). Distinct from ghl_opportunity_search (GET /opportunities/search), which covers simple field-filter + cursor/page pagination. See docs/audits/opportunities.md for full pagination guidance (meta.nextPageUrl / startAfter+startAfterId vs page-based).",
    },
    "GET /opportunities/search": {
      descriptionNote:
        "Full pagination/filter surface confirmed present: q, status, campaignId, id, order, endDate, startAfter, startAfterId, date, country, page, limit, getTasks, getNotes, getCalendarEvents, locationId (required), pipelineId, pipelineStageId, contactId, assignedTo. To page past the first result set, either increment `page` with `limit`, or read `startAfter`/`startAfterId` off the previous response's `meta` and pass them back in — required to reach results beyond the first ~100 records on large pipelines.",
    },
    "PUT /opportunities/{id}": {
      descriptionNote:
        "Body accepts pipelineId, name, pipelineStageId, status, monetaryValue, forecastExpectedCloseDate, forecastProbability, assignedTo, and customFields (id-or-key + string/array/object fieldValue variants) — all verified present against UpdateOpportunityDtoV3.",
    },
  },
};
