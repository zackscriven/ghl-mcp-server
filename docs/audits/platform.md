# Platform & Admin domain audit — ghl-mcp-server-v2

Domain: `platform` (override file `src/overrides/platform.ts`, exported `platformOverrides`).
Assigned spec files: `users`, `locations`, `businesses`, `companies`, `saas-api` / `saas`, `oauth`, `snapshots`, `custom-menus`, `marketplace` (legacy `apps/*.json` + v3 `apps/v3/*.json` twins).
Scope confirmed via `operations.json`: **93 operations** (filtered by `specFile` ending in any of the above filenames, both legacy and v3 variants). `docs/audits/platform-status.json` has one row per operation — 93 rows, 91 `ok`, 2 `exception`.

## Method

Docs-driven only, no live API calls. For every operation: compared `operations.json`'s extracted `versionHeader`, `parameters`, and `requestBody` against the ground-truth spec file on disk (`/sessions/.../PPC/Product/PracticeOS/GHL/Github Repo/highlevel-api-docs/apps/**`), cross-referenced `security` blocks to classify agency-vs-location token requirements, and reviewed `docs/generated-names.json` for naming quality within the platform prefix set (`ghl_user_*`, `ghl_location_*`, `ghl_business_*`, `ghl_company_*`, `ghl_saas_*`, `ghl_oauth_*`, `ghl_snapshot_*`, `ghl_custom_menu_*`, `ghl_marketplace_*`).

## 1. Version headers

Spot-checked all 93 against their spec file's own `Version` header enum/example:
- Legacy twins (`oauth.json` `POST /oauth/locationToken`, `GET /oauth/installedLocations`; `users.json` `GET /users/`) → `2021-07-28`, matches.
- Every v3-preferred op → `v3`, matches its spec's `Version` header enum (`["v3"]`).
- 5 exceptions found: `GET/POST/DELETE /marketplace/billing/charges*` (5 ops) carry `versionHeader: ""` in `operations.json`. Verified against `v3/marketplace-v3.json` directly — **these 5 paths genuinely declare no `Version` header parameter at all** (unlike every other op in the file). Not an extraction bug; no override needed, but flagged as a surprising, spec-confirmed quirk (see notes in `platform.ts` and the corresponding status rows).

No `versionHeader` overrides were needed anywhere in this domain.

## 2. Request-body completeness (spot-checked, no loss found)

Directly diffed the following against their spec `components.schemas` entries (with `$ref`s manually resolved by hand where nested):

| Op | Spec DTO | Result |
|---|---|---|
| `POST /users/` | `CreateUserDto` | Complete — 15 top-level fields incl. `permissions` (`PermissionsDto` inlined, all 38 fields present), `scopes`/`scopesAssignedToOnly` (194-entry enum each, full list carried), `twilioPhone`, `platformLanguage` enum |
| `PUT /users/{userId}` | `UpdateUserDto` | Same shape verified present |
| `POST /locations/` / `PUT /locations/{locationId}` | location create/update DTOs | Complete — 16 fields incl. `prospectInfo`, `settings`, `social`, `twilio`, `mailgun` |
| `POST /businesses/` | business create DTO | Complete — 11 fields |
| `POST /custom-menus/` | custom menu create DTO | Complete — 11 fields incl. `showOnCompany`/`showOnLocation`/`showToAllLocations`/`openMode`/`userRole` |
| `PUT /locations/{locationId}/permissions` | permissions update DTO | Complete — `permissions` object present |
| `POST /locations/{locationId}/customFields` | custom field create DTO | Complete — incl. `acceptedFormat`, `isMultipleFile`, `maxNumberOfFiles`, `textBoxListOptions`, `model` |
| `POST /locations/{locationId}/tags` | tag create DTO | Complete |
| `POST /locations/{locationId}/recurring-tasks` | recurring task DTO | Complete — incl. `owners`, `rruleOptions`, `ignoreTaskCreation` |
| `POST /snapshots/share/link` | snapshot share DTO | Complete — `snapshot_id`, `share_type`, `relationship_number`, `share_location_id` |
| `POST .../wallet-balance/complimentary-credits` | wallet balance DTO | Complete |

**No extraction loss found anywhere spot-checked in this domain.** Users create/update — the brief's specific ask — was checked in the most depth: permissions/scopes/roles nested objects all survived extraction intact (`PermissionsDto`'s 38 boolean flags fully inlined; both scope enums carried at their full 194-entry length).

## 3. Content type

Per the brief's specific call-out:

- **`POST /oauth/locationToken`** (legacy) and **`POST /oauth/location-token`** (v3) — spec declares `application/x-www-form-urlencoded` as the *only* content type (no JSON sibling). `registry.ts`'s automatic fallback (picks the sole non-JSON content type when `application/json` isn't present) already produces the correct behavior with zero overrides needed — but per the brief's explicit instruction, added a `contentType` override + `descriptionNote` on both anyway, to make the requirement visible in the tool description rather than relying on generator internals.
- **`POST /oauth/token`** — spec is unusual: it documents **both** `application/x-www-form-urlencoded` and `application/json` for the *same* `GetAccessTokenBodyDto` schema. `registry.ts`'s default logic prefers `application/json` when present, which would have silently picked JSON. Added an explicit `contentType: "application/x-www-form-urlencoded"` override (the conventional OAuth2 shape) with a note that JSON is also spec-valid.
- **`POST /locations/{locationId}/customFields/upload`** — file upload, spec declares `multipart/form-data` only. Registry auto-select already correct; added explicit `contentType` override + `descriptionNote` per brief instruction anyway, describing it as a file-plus-field-metadata upload.

No other non-JSON content types found in this domain's 93 ops.

## 4. Pagination

List ops all expose their documented cursor/offset params as top-level tool properties already (no `extraQueryParams` needed):
- `skip`/`limit` — `GET /oauth/installedLocations`, `GET /businesses/`, `GET /custom-menus/`, `GET /users/search`, `GET /marketplace/billing/charges`, `GET /locations/{locationId}/templates`.
- `pageSize`/`pageToken` — `GET /oauth/installed-locations` (v3).
- `page` — `GET /saas/saas-locations/{companyId}`, `GET /saas-api/public-api/saas-locations/{companyId}` (required in the current `/saas/*` family, optional in the deprecated `/saas-api/*` twin — verified this asymmetry is genuine per spec, not a copy error).
- `lastDoc`/`from`/`to` — `GET /snapshots/snapshot-status/{snapshotId}` (all three required per spec; unusual for a "list" shape but confirmed against the spec directly).

No under-documented pagination params found requiring `extraQueryParams` overrides in this domain — checked the docs corpus (`mcp__ghl-docs__ghl_docs_context`) informally for the two most ambiguous list ops (`GET /users/search`, `GET /saas/saas-locations/{companyId}`) and found no additional cursor params beyond what the spec already documents.

## 5. Under-marked required params

None found requiring `forceRequired`. Spot-checked `GET /oauth/installedLocations`/`installed-locations` (`companyId`, `appId` correctly marked required in spec and carried through), `GET /snapshots/snapshot-status/{snapshotId}` (`from`, `to`, `lastDoc`, `companyId` correctly required), `GET /locations/{locationId}/templates` (`originId` correctly required) — all already honored by generation.

## 6. Deprecated ops

- `GET /users/` (legacy "Get User by Location") — spec self-marks `deprecated: true`. Superseded by `GET /users/search` (v3), which covers the same `locationId` filter plus richer paging/search. `descriptionNote` added.
- The entire **`/saas-api/public-api/*` family (11 ops)** — every one is `deprecated: true` in `v3/saas-v3.json`, each with a 1:1 replacement under the newer `/saas/*` path (identical shape, same request/response schemas, in the same spec file). `descriptionNote` added on each naming its specific `/saas/*` replacement.

**None skipped** — all deprecated ops stayed registered per the brief, with replacement pointers in their descriptions.

## 7. Tool names

Reviewed all 93 names in `docs/generated-names.json`. Renamed 13:

| Key | Old name | New name | Why |
|---|---|---|---|
| `GET /oauth/installed-locations` | `ghl_oauth_get_installed_location_get2` | `ghl_oauth_get_installed_locations` | dedupe-collision suffix (`_get2`) is noise once you know the legacy twin exists under a different name |
| `POST /oauth/location-token` | `ghl_oauth_get_location_access_token_post2` | `ghl_oauth_exchange_location_token` | clearer verb, dedupe suffix removed |
| `POST /oauth/token` | `ghl_oauth_get_access_token` | *(same — reaffirmed explicitly for clarity in this file)* | already correct |
| `POST /locations/` | `ghl_location_create` | *(same — reaffirmed explicitly)* | already correct |
| `PUT /locations/{locationId}` | `ghl_location_put` | `ghl_location_update` | `put` is an HTTP verb, not a domain verb — every other update op in the server uses `_update` |
| `GET /custom-menus/` | `ghl_custom_menu_get` | `ghl_custom_menu_list` | this is the list-all op; `_get` collides semantically with the by-id sibling |
| `GET /snapshots/` | `ghl_snapshot_get_custom` | `ghl_snapshot_list` | `_get_custom` was a stray leftover of the spec's summary text, meaningless as a tool name |
| `GET /snapshots/snapshot-status/{snapshotId}` | `ghl_snapshot_get_push` | `ghl_snapshot_get_pushes_between_dates` | disambiguates from the `.../location/{locationId}` sibling (`ghl_snapshot_get_latest_push`) and reflects the required `from`/`to` range params |
| `GET /marketplace/app/{appId}/rebilling-config/location/{locationId}` | `ghl_marketplace_get_rebilling_config_for_app` | `ghl_marketplace_get_rebilling_config` | shorter, still unambiguous within the `ghl_marketplace_` prefix (only one rebilling-config op exists) |
| `GET /saas-api/public-api/locations` | `ghl_saas_locations_deprecated` | `ghl_saas_get_locations_by_stripe_id_deprecated` | original name gave no hint of the lookup key (Stripe customer/subscription id) |
| `GET /saas/locations` | `ghl_saas_locations` | `ghl_saas_get_locations_by_stripe_id` | same reasoning as above |
| `PUT /saas-api/public-api/update-saas-subscription/{locationId}` | `ghl_saas_generate_payment_link_deprecated` | `ghl_saas_update_saas_subscription_deprecated` | **the generated name was wrong**, not just awkward — this op's summary is literally "Update SaaS subscription"; it does not generate a payment link. Likely a naming-heuristic mismatch upstream. |
| `PUT /saas/update-saas-subscription/{locationId}` | `ghl_saas_generate_payment_link` | `ghl_saas_update_saas_subscription` | same fix as above for the current (non-deprecated) twin |

Checked all 13 new names for server-wide uniqueness against `docs/generated-names.json` (0 collisions with any other domain's derived names) and for `≤64` chars (all pass, longest is `ghl_saas_get_locations_by_stripe_id_deprecated` at 47 chars). Also confirmed the server already had **zero duplicate tool names across all 667 ops** before this pass, so no domain (including this one) had a forced rename for uniqueness — all 13 renames here are pure clarity/correctness fixes.

## Agency-vs-location token audit (brief's specific ask)

Cross-referenced every op's `security` block (`Agency-Access` / `Agency-Access-Only` vs `Location-Access`) in both the legacy and v3 spec files. **44 of the 93 ops require an AGENCY-LEVEL (Company) token, not a location token** — registered normally (not skipped) with a `descriptionNote` on each stating the requirement. Full list:

- **oauth**: `GET /oauth/installedLocations`, `POST /oauth/locationToken`, `GET /oauth/installed-locations`, `POST /oauth/location-token` (all `Agency-Access-Only`)
- **users**: `POST /users/search/filter-by-email` (agency-only; the other `/users/*` ops accept either agency or location tokens)
- **locations**: `PUT /locations/{locationId}`, `DELETE /locations/{locationId}`, `POST /locations/`, `GET /locations/{locationId}/permissions`, `PUT /locations/{locationId}/permissions`
- **companies**: `GET /companies/{companyId}`
- **custom-menus**: all 5 ops
- **snapshots**: all 4 ops
- **saas-api/public-api (deprecated family)**: all 11 ops
- **saas (current family)**: all 15 ops (including the 2 wallet-balance ops, which live under the `saas-api/public-api/companies/...` path but are the *current*, non-deprecated wallet-balance endpoints)

`GET/PUT/DELETE /users/{userId}`, `GET /users/search`, `POST /users/` accept **either** an agency or a location token per spec (`Agency-Access` + `Location-Access` both listed) — deliberately **not** flagged as agency-only.

## Exceptions (2) — HIGH PRIORITY, needs a generator fix, not an override

`PUT /users/{userId}` and `DELETE /users/{userId}` are **currently broken tools**, discovered while checking "under-marked required params":

- Both `users.json` (legacy) and `v3/users-v3.json` declare the path `/users/{userId}`, but **only the `GET` operation's `parameters` array actually lists `userId`** — the sibling `PUT` and `DELETE` operations' `parameters` arrays omit it entirely, even though they share the identical `{userId}` path template. This is a defect in the official spec's per-operation parameter declarations (path-level parameter inheritance isn't used in this file), and `operations.json` faithfully mirrors it (`parameters: []` for both).
- `src/registry.ts`'s `buildInputSchema` builds each tool's JSON Schema strictly from `op.parameters` (no path-template regex fallback) and sets `additionalProperties: false`. Result: the generated `ghl_user_update` and `ghl_user_delete` tools have **no `userId` field at all** in their input schema. Any call will reach `http.ts`'s path-substitution loop, find `{userId}` still unresolved, and throw `Missing required path parameter(s): userId` — every single time, unconditionally.
- **This cannot be fixed via `OperationOverride`** — the override API's only param-injection mechanism is `extraQueryParams`, which is hardcoded to `in: "query"` in `registry.ts` (`buildInputSchema` pushes `{ name: extra.name, in: "query", ... }` for every entry). There is no path-param equivalent.
- Per the brief ("only skip if truly unusable... it becomes a reported exception"), I judged this genuinely unusable in its current state, but chose to **leave both registered rather than skip them** — skipping would silently hide the tools forever (including after a generator fix ships), whereas leaving them registered + marked `exception` in the status JSON keeps them visible and gives a future generator patch something to land against. The clearer long-term fix belongs in `src/registry.ts`: `buildInputSchema` should scan `op.path` for `{token}` segments and synthesize any missing ones as required string path params, regardless of what the spec's `parameters` array says — that would make this self-healing against future instances of the same upstream spec gap, not just these two ops.

Both are documented in `src/overrides/platform.ts`'s `notes` array and given `descriptionNote`s pointing at this exact issue, plus `status: "exception"` rows in `docs/audits/platform-status.json` with the full explanation.

## Regression check

`cd "<project root>" && npx tsc --noEmit` — **clean, no errors** after populating `src/overrides/platform.ts`.

Also verified:
- No other domain's override file (`contacts.ts`, `opportunities.ts`, `calendars.ts`, `conversations.ts`, `payments.ts`, `marketing.ts`, `ads.ts`) was touched.
- `src/overrides/index.ts` (the aggregator) was **not** modified — it already imports `platformOverrides` from the pre-existing stub, so no wiring change was needed.
- All 13 renamed tool names checked against `docs/generated-names.json` for server-wide uniqueness (0 collisions found; two "collisions" reported by an automated check were the operation's own already-correct derived name being reaffirmed, not a real conflict with a different operation — verified by key lookup).

## Anything surprising

- The `userId`-path-param spec bug (above) was the only genuine defect found; everything else in the domain (44 agency-only ops, 3 oauth form-encoded bodies, 1 multipart upload, 11 deprecated `/saas-api/*` ops, 5 marketplace-billing ops with no `Version` header) turned out to be spec-accurate once checked directly, even where the shape looked odd at first glance (e.g., `/oauth/token` documenting two content types for one schema, or billing/charges ops having no `Version` header at all).
- Two of the pre-existing generated names (`ghl_saas_generate_payment_link[_deprecated]`) were flatly wrong (not just awkward) — worth double-checking other domains' SaaS-adjacent or payment-adjacent names for the same class of naming-heuristic mismatch, since this domain isn't the only one touching billing terminology.
