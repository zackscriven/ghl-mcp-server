# Contacts domain audit — ghl-mcp-server-v2

Domain: `contacts` (override file `src/overrides/contacts.ts`).
Spec files: `contacts.json` (legacy), `v3/contacts-v3.json`, `v3/custom-fields-v3.json`, `v3/objects-v3.json`, `v3/associations-v3.json`.
Total operations audited: **60** (2 legacy + 31 contacts-v3 + 8 custom-fields-v3 + 9 objects-v3 + 10 associations-v3).

All ground truth was read directly from the spec JSON files (not just `operations.json` excerpts), per the brief's "never conclude from a truncated excerpt" rule. `mcp__ghl-docs__ghl_docs_context` was used to cross-check the `/contacts/search` spec gap against the corpus copy of both `contacts.json` and `v3/contacts-v3.json`.

## Mandatory regression checks

### 1. `PUT /contacts/{contactId}` body completeness

**PASS.** Read `UpdateContactDtoV3` directly from `v3/contacts-v3.json` (lines ~4752–4931). All of the previously-missing fields are present in the extracted `operations.json` body schema and therefore in the generated tool:

`assignedTo, customFields, tags, dnd, dndSettings, inboundDndSettings, address1, city, state, postalCode, country, dateOfBirth, source, website, timezone`

No override needed — extraction is faithful. Added a `descriptionNote` on this op stating the regression check passed and flagging that `tags` here is a full-overwrite (not incremental — use `ghl_contact_add_tags`/`ghl_contact_remove_tags` for that).

### 2. `POST/PUT /contacts/{contactId}/tasks[/{taskId}]` — assignedTo + the 422 bug

**PASS — assignedTo present.** Both `CreateTaskParams` and `UpdateTaskBody` (`v3/contacts-v3.json`) include `assignedTo`.

**Root cause of the old connector's create_task 422, now documented:** `CreateTaskParams.required = ["title", "dueDate", "completed"]`. The old connector likely only required `title` (or nothing), so calls omitting `dueDate` or `completed` would get rejected server-side. `dueDate` must be ISO 8601 (spec example: `2020-10-25T11:00:00Z`); `completed` is a required boolean even when creating a brand-new (necessarily incomplete) task — that's what the spec mandates, however counterintuitive. `operations.json` already carries this `required` array correctly, so the generated tool already enforces it — no `forceRequired` override needed, just documentation via `descriptionNote` on both the create and update ops.

Update (`UpdateTaskBody`) has no required fields — fully optional partial update, also documented.

### 3. Pagination

**PASS**, all list/search ops in-domain expose their cursor params per the spec:
- `GET /contacts/` (deprecated list): `limit`, `startAfter`, `startAfterId`, `query`
- `GET /contacts/business/{businessId}`: `limit`, `skip`, `startAfter`, `query`
- `GET /associations/`: `skip`, `limit` (both spec-required)
- `GET /associations/relations/{recordId}`: `skip`, `limit` (both spec-required), plus `associationIds` (array-typed query filter)
- `POST /objects/{schemaKey}/records/search`: body-level `page`, `pageLimit`, `searchAfter` (all spec-required)
- `GET /custom-fields/object-key/{objectKey}`, `GET /objects/`: no pagination params in the spec — these are bounded per-location lists (all custom fields for one object, or all objects for one location), not paginated collections. Confirmed intentional, not a gap.

No `extraQueryParams` overrides were needed anywhere in this domain.

## Name curation

Renamed 12 of 60 ops (listed in full in `contacts.ts`'s `notes` array and per-op `descriptionNote`s). Highlights:

- **`GET /contacts/` → `ghl_contact_list`** and **`GET /contacts/{contactId}` → `ghl_contact_get_by_id`** — the exact ambiguity the brief called out. The auto-generated names were `ghl_contact_get` (for the deprecated list/search-by-query endpoint) and `ghl_contact_get_get2` (an ugly auto-collision-suffix for the single-record lookup). Now unambiguous against each other and against `ghl_contact_search_advanced` (`POST /contacts/search`).
- **`POST /contacts/bulk/tags/update/{type}` → `ghl_contact_bulk_update_tags`** — was auto-named `ghl_contact_create_association`, which is flatly wrong; this operation (bulk add/remove tags across contacts) has nothing to do with the associations domain. Worth flagging as the most misleading auto-derived name found in this audit.
- **Two "remove from every campaign" endpoints** (legacy `DELETE /contacts/{contactId}/campaigns/removeAll` vs v3 `DELETE /contacts/{contactId}/campaigns/remove-all`) are genuinely distinct paths (camelCase vs kebab-case), not deduped, and collided in auto-naming (`ghl_contact_remove_from_every_campaign` vs `..._delete2`). Renamed to `ghl_contact_remove_from_all_campaigns_legacy` and `ghl_contact_remove_from_all_campaigns` respectively, with descriptionNotes cross-referencing each other and recommending the v3 one for new integrations.
- **`GET /objects/` → `ghl_object_list`** (was `ghl_object_get_by_location_id`, ambiguous against `GET /objects/{key}` → `ghl_object_get_schema_by_key`).
- **`PUT /objects/{key}` → `ghl_object_update_schema`**, **`POST /objects/` → `ghl_object_create_custom_object`** (was `ghl_object_update_custom` / `ghl_object_create_custom_schema` — tightened to pair cleanly with `ghl_object_get_schema_by_key`).
- **Associations cleanup:** `ghl_association_find` → `ghl_association_list` (verb consistency); `ghl_association_get_key_by_key_name` → `ghl_association_get_by_key_name` (redundant phrase); `ghl_association_get_by_object_keys` → `ghl_association_get_by_object_key` (singular — the endpoint takes one `objectKey` path param, plural was misleading).
- **`GET /contacts/{contactId}/appointments`**: `ghl_contact_get_appointments_for` → `ghl_contact_get_appointments` (truncated trailing word in the auto-derived name).

Verified none of the new names collide with any of the other 607 ops server-wide (checked against `docs/generated-names.json`).

## Spec gaps found (not extraction bugs — verified against raw OpenAPI)

Three request bodies are genuinely empty (`{"type": "object", "properties": {}}`) in the **official spec itself**, confirmed by reading the raw JSON directly (not operations.json) and cross-checked via `mcp__ghl-docs__ghl_docs_context`:

1. **`POST /contacts/search`** — `SearchBodyV2DTO`. Both the legacy (`contacts.json`) and v3 (`v3/contacts-v3.json`) copies of this endpoint have the identical empty schema; the spec's own `externalDocs` link points to an un-crawled ClickUp page for the real filter/sort/pageLimit/searchAfter shape.
2. **`POST /objects/{schemaKey}/records`** — `CreateCustomObjectRecordDto`.
3. **`PUT /objects/{schemaKey}/records/{id}`** — `UpdateCustomObjectRecordDto`.

There is no `OperationOverride` field for injecting body properties (the API only supports `name`, `descriptionNote`, `skip`, `versionHeader`, `extraQueryParams`, `forceRequired`, `contentType`), so these are flagged via `descriptionNote` only. Functionally this is not a hard blocker: `registry.ts` does not set `additionalProperties: false` inside the body sub-schema (only on the top-level tool input schema), so a caller who knows the real field names from GHL's docs can still pass them through the `body` property — the generated tool just offers no schema-level validation or autocomplete for these three operations. Did not invent a plausible-looking schema to fill the gap; the community-known "properties object keyed by field key" convention for the objects endpoints is mentioned in the descriptionNote but explicitly caveated as unconfirmed by this docs corpus, per the "make no live API calls" / no-fabrication constraint.

## Property-by-property spot-checks (no loss found)

Verified full property parity between `operations.json` and the raw spec component schemas for:
- `UpdateContactDtoV3`, `CreateContactDto`/create+upsert bodies (`v3/contacts-v3.json`)
- `CreateCustomFieldsDTO`, `UpdateCustomFieldsDTO`, `CreateFolder` (`v3/custom-fields-v3.json`)
- `SearchRecordsBody` (`v3/objects-v3.json`)
- Associations create/update/relation bodies (`v3/associations-v3.json`)

All matched exactly — no extraction loss anywhere in this domain outside the three genuine spec gaps above.

## Other findings

- **Version headers:** all correct — legacy ops keep `2021-07-28`, all v3 ops use `v3`. No `versionHeader` overrides needed.
- **Content type:** no multipart/non-JSON request bodies in this domain (checked programmatically across all 60 ops). No `contentType` overrides needed.
- **Deprecated ops:** only `GET /contacts/` is marked `deprecated: true` in the spec, with an explicit replacement noted ("use the Search Contacts endpoint instead") — carried into the `descriptionNote`. Not skipped; kept registered for legacy callers per the brief.
- **`forceRequired` considered and rejected for `GET /associations/objectKey/{objectKey}`:** the spec marks the `objectKey` path param and `locationId` query param as `required: false`, which looks like a spec authoring bug (path params can't functionally be optional). Checked `registry.ts` (`buildInputSchema`, line 74): `if (p.in === "path" || p.required || ...)` — path params are unconditionally forced required by the registry regardless of the spec's flag, so no override was needed here; this is already handled generically for the whole server, not just this domain.
- No operations were skipped in this domain.

## Deliverables

- `src/overrides/contacts.ts` — populated, compiles clean (`npx tsc --noEmit` — no errors).
- `docs/audits/contacts.md` — this file.
- `docs/audits/contacts-status.json` — all 60 operations, all `"status": "ok"` (no exceptions in this domain).
