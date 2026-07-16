/** Curated overrides for the contacts domain — populated by the domain audit. */
import type { DomainOverrides } from "../types.js";

export const contactsOverrides: DomainOverrides = {
  domain: "contacts",
  notes: [
    "Domain covers 4 spec files: contacts.json (legacy, 2 ops), v3/contacts-v3.json (31 ops), v3/custom-fields-v3.json (8 ops), v3/objects-v3.json (9 ops), v3/associations-v3.json (10 ops) — 60 ops total.",
    "REGRESSION CHECK — PUT /contacts/{contactId}: verified against v3/contacts-v3.json's UpdateContactDtoV3 schema directly (not just operations.json). All of assignedTo, customFields, tags, dnd, dndSettings, inboundDndSettings, address1, city, state, postalCode, country, dateOfBirth, source, website, timezone ARE present in the extracted body schema. The old connector's failure to expose these is fixed — extraction is faithful here, no override needed.",
    "REGRESSION CHECK — POST/PUT /contacts/{contactId}/tasks[/{taskId}]: assignedTo IS present in both CreateTaskParams and UpdateTaskBody per v3/contacts-v3.json. The old connector's create_task 422 is explained by the spec's required array for CreateTaskParams: [\"title\", \"dueDate\", \"completed\"] — dueDate must be ISO 8601 (e.g. 2020-10-25T11:00:00Z) and completed is a required boolean even on create. Generation already marks these required (operations.json required[] matches spec) — documented via descriptionNote on both ops rather than forceRequired (nothing under-marked).",
    "REGRESSION CHECK — pagination: GET /contacts/ (deprecated list) exposes limit/startAfter/startAfterId/query; GET /contacts/business/{businessId} exposes limit/skip/startAfter/query; GET /associations/ and GET /associations/relations/{recordId} require skip+limit; GET /custom-fields/object-key/{objectKey} and GET /objects/ have no pagination in the spec (bounded per-location lists) — none needed. All present, no extraQueryParams required.",
    "Two genuinely duplicate-shaped-but-distinct 'remove contact from every campaign' endpoints exist: legacy DELETE /contacts/{contactId}/campaigns/removeAll (camelCase, contacts.json) and v3 DELETE /contacts/{contactId}/campaigns/remove-all (kebab-case, v3/contacts-v3.json). Both are real, separate paths (not deduped) and both survived the auto-naming with a name collision resolved by an ugly '_delete2' suffix on the v3 one. Renamed both explicitly below.",
    "SPEC GAP (not extraction loss, verified against raw spec + ghl_docs_context on both contacts.json and v3/contacts-v3.json): POST /contacts/search's SearchBodyV2DTO is `{type: object, properties: {}}` in the official OpenAPI — genuinely empty, not a $ref-following bug. The spec only points to an external ClickUp doc for the real filter/sort/pageLimit/searchAfter shape, which this corpus does not have crawled. No OperationOverride field exists to inject body properties, so this is flagged via descriptionNote only — body schema in the generated tool will accept arbitrary JSON (registry.ts does not set additionalProperties:false inside the body sub-schema), so callers who know the real fields can still pass them; there's just no validation/autocomplete help from the tool schema.",
    "SPEC GAP (same class, verified against v3/objects-v3.json): CreateCustomObjectRecordDto and UpdateCustomObjectRecordDto (POST /objects/{schemaKey}/records, PUT /objects/{schemaKey}/records/{id}) are also `{type: object, properties: {}}` in the raw spec. Community/GHL convention is a top-level `properties` object keyed by the object's field keys, but this is not in the OpenAPI and not confirmed via docs corpus — flagged via descriptionNote, not asserted as fact.",
    "Custom-fields and associations request bodies were spot-checked property-by-property against v3/custom-fields-v3.json and v3/associations-v3.json component schemas (CreateCustomFieldsDTO, UpdateCustomFieldsDTO, CreateFolder) — all matched operations.json exactly, no extraction loss found.",
    "Renames: fixed one outright-wrong derived name (POST /contacts/bulk/tags/update/{type} was named ghl_contact_create_association — a bulk tag-update op misnamed as an association op), the get/list ambiguity the brief called out explicitly (GET /contacts/ vs GET /contacts/{contactId}), the objects list/schema ambiguity (GET /objects/ vs GET /objects/{key}), an auto-suffixed collision (_delete2), and several redundant/awkward auto-derived names in associations and objects. Full list in docs/audits/contacts.md.",
  ],
  overrides: {
    "GET /contacts/": {
      name: "ghl_contact_list",
      descriptionNote:
        "Deprecated by GoHighLevel — prefer ghl_contact_search_advanced (POST /contacts/search) for new integrations. Kept registered for legacy callers. Returns a simple paginated list filtered by an optional free-text query, not the advanced filter/sort search.",
    },
    "GET /contacts/{contactId}": {
      name: "ghl_contact_get_by_id",
      descriptionNote:
        "Fetches a single contact by ID. Distinct from ghl_contact_list (GET /contacts/, deprecated list) and ghl_contact_search_advanced (POST /contacts/search, filtered search) — renamed from the auto-generated 'ghl_contact_get_get2' (a collision-resolution artifact) for clarity per the audit brief's explicit ambiguity callout.",
    },
    "DELETE /contacts/{contactId}/campaigns/removeAll": {
      name: "ghl_contact_remove_from_all_campaigns_legacy",
      descriptionNote:
        "Legacy path variant (contacts.json, 2021-07-28) of removing a contact from every campaign. Functionally equivalent to ghl_contact_remove_from_all_campaigns (v3, DELETE /contacts/{contactId}/campaigns/remove-all) — prefer the v3 tool for new integrations. Renamed from the auto-generated name to disambiguate the two distinct-but-similar endpoints (was colliding with the v3 op's derived name, which got an ugly auto '_delete2' suffix).",
    },
    "DELETE /contacts/{contactId}/campaigns/remove-all": {
      name: "ghl_contact_remove_from_all_campaigns",
      descriptionNote:
        "v3-preferred variant of removing a contact from every campaign (kebab-case path, v3/contacts-v3.json). Renamed from the auto-generated 'ghl_contact_remove_from_every_campaign_delete2' (an ugly auto-suffix produced because it collided with the legacy op's derived name).",
    },
    "POST /contacts/{contactId}/campaigns/{campaignId}": {
      descriptionNote: "Adds a contact to one specific campaign. Empty request body (path params only).",
    },
    "GET /contacts/{contactId}/appointments": {
      name: "ghl_contact_get_appointments",
      descriptionNote: "Renamed from the auto-generated 'ghl_contact_get_appointments_for' (truncated trailing word).",
    },
    "POST /contacts/bulk/tags/update/{type}": {
      name: "ghl_contact_bulk_update_tags",
      descriptionNote:
        "Bulk add/remove tags across a list of contacts (path param `type` selects add|remove semantics per the API). Renamed from the auto-generated 'ghl_contact_create_association' — that name was simply wrong; this operation has nothing to do with the associations domain (custom relationships between object types). Body requires contacts, tags, locationId; removeAllTags is an optional bulk-remove-all flag.",
    },
    "GET /contacts/search/duplicate": {
      descriptionNote:
        "Neither `number` nor `email` is marked required by the spec, but at least one must be supplied for the lookup to return anything meaningful — this is a business-logic constraint the OpenAPI doesn't encode, not a bug in extraction. Both params must be URL-encoded (see each param's spec description/example).",
    },
    "POST /contacts/search": {
      descriptionNote:
        "SPEC GAP: the official OpenAPI's SearchBodyV2DTO is an empty object schema — GoHighLevel's spec only points to an external ClickUp doc (linked in the op's externalDocs) for the real filter/sort/pageLimit/searchAfter/query body shape, which is not available in this docs corpus. Verified this is a genuine spec gap (not an extraction bug) against both the legacy (contacts.json) and v3 (v3/contacts-v3.json) copies of this endpoint, and via ghl_docs_context — both show the identical empty schema. The generated tool's body property will still accept arbitrary JSON (no additionalProperties:false is applied inside body sub-schemas), so callers who know the real field names from GHL's docs can pass them; there's just no schema-level validation or autocomplete for this one operation.",
    },
    "POST /contacts/upsert": {
      descriptionNote: "Requires locationId. Same field set as ghl_contact_create; use createNewIfDuplicateAllowed to control dedup behavior.",
    },
    "PUT /contacts/{contactId}": {
      descriptionNote:
        "REGRESSION-VERIFIED: body schema (UpdateContactDtoV3, v3/contacts-v3.json) includes assignedTo, customFields, tags, dnd, dndSettings, inboundDndSettings, address1, city, state, postalCode, country, dateOfBirth, source, website, timezone — all confirmed present against the raw spec, matching what the old connector was missing. `tags` on this endpoint overwrites the full tag list; use ghl_contact_add_tags/ghl_contact_remove_tags for incremental changes.",
    },
    "POST /contacts/{contactId}/tasks": {
      descriptionNote:
        "REGRESSION-VERIFIED: assignedTo is present in CreateTaskParams. The old connector's create_task always 422'd — per the spec (v3/contacts-v3.json CreateTaskParams.required), title, dueDate, and completed are ALL required on create (not just title), and dueDate must be ISO 8601 (e.g. 2020-10-25T11:00:00Z). Passing completed:false is required even though it reads oddly for a brand-new task — that's what the spec mandates.",
    },
    "PUT /contacts/{contactId}/tasks/{taskId}": {
      descriptionNote:
        "REGRESSION-VERIFIED: assignedTo is present in UpdateTaskBody. Unlike create, no fields are marked required on update — all of title/body/dueDate/completed/assignedTo are optional partial updates.",
    },
    "PUT /custom-fields/{id}": {
      descriptionNote:
        "Per spec (UpdateCustomFieldsDTO), locationId and showInForms are both required on every update call, even ones that only change name/description/options — this is a genuine spec requirement, not an extraction artifact.",
    },
    "GET /custom-fields/{id}": {
      descriptionNote: "Also returns custom field FOLDERS by the same id (per the spec's own summary: 'Get Custom Field / Folder By Id') — check the response shape to tell which you got.",
    },
    "PUT /objects/{key}": {
      name: "ghl_object_update_schema",
      descriptionNote: "Renamed from the auto-generated 'ghl_object_update_custom' for clarity and to pair with ghl_object_get_schema_by_key.",
    },
    "POST /objects/": {
      name: "ghl_object_create_custom_object",
      descriptionNote:
        "Creates a new custom object SCHEMA (not a record). Renamed from the auto-generated 'ghl_object_create_custom_schema' to match GHL's own terminology ('Create Custom Object') and avoid confusion with ghl_object_update_schema/ghl_object_get_schema_by_key which operate on already-created objects.",
    },
    "GET /objects/": {
      name: "ghl_object_list",
      descriptionNote:
        "Lists all objects (standard: contact/opportunity/business, plus custom) for a location. Renamed from the auto-generated 'ghl_object_get_by_location_id' — that name was ambiguous against ghl_object_get_schema_by_key (GET /objects/{key}, single-object lookup) per the brief's list/get_by_id naming guidance.",
    },
    "PUT /objects/{schemaKey}/records/{id}": {
      descriptionNote:
        "SPEC GAP: UpdateCustomObjectRecordDto is an empty object schema in v3/objects-v3.json — verified against the raw spec, not an extraction bug. The body property will accept arbitrary JSON; GHL's convention (per external docs linked from this op, not confirmed in this corpus) is a `properties` object keyed by the object's field keys.",
    },
    "POST /objects/{schemaKey}/records": {
      descriptionNote:
        "SPEC GAP: CreateCustomObjectRecordDto is an empty object schema in v3/objects-v3.json — verified against the raw spec, not an extraction bug. The body property will accept arbitrary JSON; GHL's convention (per external docs linked from this op, not confirmed in this corpus) is a `properties` object keyed by the object's field keys.",
    },
    "POST /objects/{schemaKey}/records/search": {
      descriptionNote: "Body (SearchRecordsBody) fully specified in the OpenAPI, unlike the sibling create/update record ops — locationId, page, pageLimit, query, and searchAfter are all present and required.",
    },
    "GET /associations/": {
      name: "ghl_association_list",
      descriptionNote: "Renamed from the auto-generated 'ghl_association_find' for consistency with other domain list-operation names.",
    },
    "GET /associations/key/{key_name}": {
      name: "ghl_association_get_by_key_name",
      descriptionNote: "Renamed from the auto-generated 'ghl_association_get_key_by_key_name' (redundant 'key_by_key_name').",
    },
    "GET /associations/objectKey/{objectKey}": {
      name: "ghl_association_get_by_object_key",
      descriptionNote: "Renamed from the auto-generated 'ghl_association_get_by_object_keys' — singular to match the single objectKey path param (plural 'keys' was misleading, it's one key per call).",
    },
  },
};
