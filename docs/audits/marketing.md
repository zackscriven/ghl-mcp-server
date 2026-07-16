# Marketing & Content domain audit — ghl-mcp-server-v2

Domain: **marketing** (`src/overrides/marketing.ts`, `marketingOverrides`).

Spec files audited: `social-media-posting.json` (legacy) + `v3/social-planner-v3.json`, `v3/medias-v3.json`, `v3/blogs-v3.json`, `v3/funnels-v3.json`, `v3/forms-v3.json`, `v3/surveys-v3.json`, `v3/workflows-v3.json`, `v3/campaigns-v3.json`, `emails.json` (legacy) + `v3/emails-v3.json`, `v3/links-v3.json`, `v3/courses-v3.json`, `v3/brand-boards-v3.json`.

**134 operations** total (per `operations.json`, `specFile` filter — brief estimated ~139; the real count from the dedup'd corpus is 134, no ops appear to be missing based on manual review of every spec file's `paths` object). All 134 are covered in `docs/audits/marketing-status.json`, all `"ok"` or `"exception"` (no gaps). Registry build (`npm run build`) succeeds; `npx tsc --noEmit` is clean; loading the full registry produces 649 tools server-wide with **zero duplicate tool names**.

## Mandatory regression checks

### 1. `GET /medias/files` (old connector 422'd — no way to pass required `type`)

**Verified fixed.** `v3/medias-v3.json` marks `type`, `altType`, `altId`, `sortBy`, `sortOrder` as `required: true`, and I read the corresponding generated `Operation.parameters` array directly from `operations.json` — all five carry `required: true` unchanged from the spec. No `forceRequired` override needed (generation already honors the spec). Renamed the tool `ghl_media_list_files` per the brief's exact suggested name (was `ghl_media_fetch_content`), and added a `descriptionNote` documenting that the regression is fixed.

### 2. `POST /social-media-posting/{locationId}/posts` (create post — observed broken live 2026-07-04)

**Schema verified faithful to spec.** Read `CreatePostDTO` directly from `v3/social-planner-v3.json` (components/schemas): top-level `required: ["type", "accountIds", "userId"]`; `media[]` items use `PostMediaSchema` whose `type` field is documented as "MIME type of the media file" with enum `image/jpeg, image/jpg, image/png, image/gif, video/mp4, video/mov, video/webm`. Compared this against `operations.json`'s inlined `requestBody.content["application/json"].schema` — it dereferences the full 29KB schema (all platform-specific `*PostDetails` sub-objects included), no truncation, no loss.

Renamed to `ghl_social_post_create` (brief's exact suggested name; was `ghl_social_create_post`) and added a `descriptionNote`:

> KNOWN LIVE REGRESSION (as of 2026-07-04): this endpoint was observed broken/failing in production even though its documented schema ... is correct and faithfully reproduced here. If a call fails, the schema/tool is not at fault — treat it as a possible server-side GHL issue...

### 3. Media upload endpoints — multipart/form-data

Two multipart uploads in-domain: `POST /medias/upload-file` and `POST /forms/upload-custom-files`, plus `POST /social-media-posting/{locationId}/csv` (CSV bulk-import, also multipart).

- `registry.ts` already **auto-detects** multipart content type (falls back to the sole non-`application/json` key in `requestBody.content` when present), so these tools already sent the correct `Content-Type` even before my pass. I added explicit `contentType: "multipart/form-data"` overrides anyway for self-documentation/robustness.
- **Real gap found and documented (not fixable via overrides):** `http.ts`'s `callGhl()` does not construct a multipart body from structured fields — for non-JSON content types it sends whatever the `body` argument is, verbatim, as `BodyInit`. An MCP tool caller cannot practically hand-construct a valid multipart/form-data payload (with boundary) through a JSON tool-call. I flagged this in each relevant `descriptionNote` and pointed callers at the `hosted: true` + `fileUrl` escape hatch on `/medias/upload-file` (documented in that endpoint's own spec description) where a URL-based path avoids the problem entirely.
- **`POST /forms/upload-custom-files` is worse: it has no requestBody schema at all.** The spec (`v3/forms-v3.json`) documents `multipart/form-data: {}` — a bare empty object, no `schema` key. `registry.ts`'s `buildInputSchema()` resolves `op.requestBody.content[contentType]?.schema ?? content["application/json"]?.schema`, both of which are `undefined` here, so the generated tool has **no `body` property in its input schema at all** — there is currently no way to attach a file through this tool. This isn't something an `OperationOverride` can fix (there's no override for hand-supplying a body schema); it's a registry.ts capability gap, out of scope for a docs-driven audit pass. Documented as an exception in the status file and in a `descriptionNote` (which at least tells a caller the field-naming convention `<custom_field_id>_<file_id>` from the spec prose, for whenever the gap is closed).

## Social CSV import endpoints

`POST /social-media-posting/{locationId}/csv` (upload), `GET .../csv` (list), `GET .../csv/{id}` (get one), `PATCH .../csv/{id}` (finalize), `DELETE .../csv/{id}` (delete), `DELETE .../csv/{csvId}/post/{postId}` (delete one imported post), `POST .../set-accounts` (assign target accounts). All present, schemas complete, pagination (`skip`/`limit`) present on the list endpoint. Renamed:
- `GET /social-media-posting/{locationId}/csv`: `ghl_social_get_upload_status` → **`ghl_social_csv_list`** — the generated name implied a single status check, but the operationId is `get-upload-status` and it's actually a paginated list of *all* CSV import batches for a location (confirmed `skip`/`limit`/`userId` params in spec).
- `PATCH /social-media-posting/{locationId}/csv/{id}`: `ghl_social_start_csv_finalize` → **`ghl_social_csv_finalize`** (cleaner, same meaning — operationId `start-csv-finalize`, finalizes the import and schedules posts).

## OAuth / social-account attach flows

Split cleanly into two categories after reading each endpoint's spec description directly:

1. **Browser-only initiation ("start") endpoints — skipped, 8 total:**
   `GET /social-media-posting/oauth/{facebook,google,instagram,linkedin,tiktok-business,tiktok,twitter}/start` (legacy, `social-media-posting.json`) and the v3 generic `GET /social-media-posting/oauth/{platform}/start`. Every one of these has a spec description that explicitly instructs opening the URL in a browser window and listening for a `window.postMessage` event — there is no server-to-server HTTP response to consume (the 200 response body is empty/unused). Not callable from an MCP server. Each got `skip: { reason: ... }`, pointing to the correct follow-up "get/attach account" tool.
   - `twitter/start` is *also* marked `deprecated` in the spec (Twitter/X integration deprecated) — skip reason notes both.
2. **Normal callable attach-step endpoints — left registered, untouched:** `GET`/`POST /social-media-posting/oauth/{locationId}/{platform}/accounts/{accountId}` (legacy per-platform + v3 generic). Their spec descriptions have no browser-window language — they're plain JSON APIs that take the `accountId` obtained from step 1 (performed by a human in an actual browser) and complete the connection. No changes made beyond routine review.

## Email builder ops (legacy) vs. v3 email templates

Found a genuine naming collision baked into the pre-audit generated names: the legacy "Email Builder" API (`emails.json`: `/emails/builder`, `/emails/builder/data`, `/emails/builder/{locationId}/{templateId}`, tag `Templates`) and the v3 template API (`v3/emails-v3.json`: `/emails/locations/{locationId}/templates*`) both use bare `operationId`s like `create-template`/`update-template`/`delete-template`. The generator had already collision-suffixed the v3 ones into `ghl_email_create_template_post2`, `ghl_email_update_template_patch2`, `ghl_email_delete_template_delete2` — technically unique but confusing and undiscoverable.

These are **two different systems** (different data models, not interchangeable), so I renamed:
- Legacy builder ops → `ghl_email_builder_template_{create,get,update,delete}` + `ghl_email_legacy_campaign_list` (for `GET /emails/schedule`, the legacy campaign-schedule listing — also distinct from v3 campaigns).
- v3 template ops → clean `ghl_email_template_{create,get,update,delete,list,folder_create,import}` family (per the brief's suggested `ghl_email_template_*` pattern), now collision-free.

## Blog / funnel / forms / links / etc. — general findings

- **`POST /blogs/posts`** renamed to `ghl_blog_post_create` per the brief's exact suggested name (was `ghl_blog_create_post`).
- **`GET /blogs/posts/all`** (operationId `get-blog-post`) is actually a paginated list of all posts for a `blogId` (`limit` required in spec), not a single-post fetch — renamed `ghl_blog_get_post` → `ghl_blog_post_list` to sit cleanly next to `ghl_blog_post_create` and stop implying single-item semantics.
- Renamed several other misleadingly-named "get" endpoints that are genuinely lists (confirmed via their spec pagination params) to a `_list` suffix: `GET /forms/` → `ghl_form_list`, `GET /funnels/funnel/list` → `ghl_funnel_list`, `GET /links/` → `ghl_link_list`, `GET /campaigns/` → `ghl_campaign_list`, `GET /surveys/` → `ghl_survey_list`, `GET /workflows/` → `ghl_workflow_list`, `GET /blogs/site/all` → `ghl_blog_site_list`.
- **Funnel page ops** (`GET /funnels/page`, `GET /funnels/page/count`, `GET /funnels/funnel/list`) genuinely carry **no `Version` header parameter** in `v3/funnels-v3.json` — confirmed by reading the full spec file — unlike `/funnels/lookup/redirect/*` in the same file, which do require `Version: v3`. `operations.json` correctly reflects this split (empty `versionHeader` for the three page/list ops, `"v3"` for the redirect ops). Verified as a real spec quirk, not an extraction bug; no override applied.
- **Media file family** renamed for terminology consistency with the new `ghl_media_list_files`: `DELETE /medias/{id}` → `ghl_media_delete_file`, `POST /medias/{id}` → `ghl_media_update_file`, `PUT /medias/delete-files` → `ghl_media_bulk_delete_files`, `PUT /medias/update-files` → `ghl_media_bulk_update_files`.
- **Social categories**: `GET /social-media-posting/{locationId}/categories/{id}` → `ghl_social_category_get`, `GET .../categories` → `ghl_social_category_list` (cleaner than the generated `ghl_social_get_categories_id` / `ghl_social_get_categories_location_id`).

## Other observations (no override needed)

- `brand-boards-v3.json` operations carry no explicit `Version` header parameter in the spec (only an `x-version-added: v3` vendor extension), yet `operations.json` assigns `versionHeader: "v3"` to all 11 ops — looks like a generator default for v3-tier specs rather than a per-operation spec extraction. No evidence it's wrong (very unlikely `Version: v3` harms a v3-tagged endpoint), so left as-is; flagged here for visibility since it doesn't trace to an explicit spec parameter the way the rest of the domain's version headers do.
- `campaigns-v3.json` (`GET /campaigns/`) and `workflows-v3.json` (`GET /workflows/`) have **no pagination parameters at all** in their specs — confirmed by reading both files in full. Not an extraction gap.
- `courses-v3.json` and `campaigns-v3.json` each expose exactly **one** operation — matches the real spec files; the public GHL API for both is genuinely that thin (not a filtering error on my part).
- Twitter/X legacy oauth endpoints (`GET`/`POST .../twitter/accounts/{accountId}`) are marked `deprecated: true` in the spec and `operations.json` carries that through correctly. Left registered per brief rule 6 (no documented replacement named in the spec to redirect to beyond the automatic `[DEPRECATED ...]` notice `registry.ts` already appends to descriptions).

## Renames summary (name overrides applied)

| Old generated name | New name | Reason |
|---|---|---|
| `ghl_social_create_post` | `ghl_social_post_create` | Brief-mandated exact name |
| `ghl_media_fetch_content` | `ghl_media_list_files` | Brief-mandated exact name |
| `ghl_blog_create_post` | `ghl_blog_post_create` | Brief-mandated exact name |
| `ghl_media_upload_content` | `ghl_media_upload_file` | Consistency with `list_files` |
| `ghl_media_delete_content` | `ghl_media_delete_file` | Consistency |
| `ghl_media_update_object` | `ghl_media_update_file` | Consistency |
| `ghl_media_bulk_delete_objects` | `ghl_media_bulk_delete_files` | Consistency |
| `ghl_media_bulk_update_objects` | `ghl_media_bulk_update_files` | Consistency |
| `ghl_email_create_template_post2` | `ghl_email_template_create` | De-collision + brief's `ghl_email_template_*` pattern |
| `ghl_email_update_template_patch2` | `ghl_email_template_update` | De-collision |
| `ghl_email_delete_template_delete2` | `ghl_email_template_delete` | De-collision |
| `ghl_email_get_template` | `ghl_email_template_get` | Family consistency |
| `ghl_email_list_templates` | `ghl_email_template_list` | Family consistency |
| `ghl_email_create_template_folder` | `ghl_email_template_folder_create` | Family consistency |
| `ghl_email_import_template` | `ghl_email_template_import` | Family consistency |
| `ghl_email_create_template` (legacy) | `ghl_email_builder_template_create` | Free up clean v3 name; clarify legacy system |
| `ghl_email_fetch_template` (legacy) | `ghl_email_builder_template_get` | ditto |
| `ghl_email_delete_template` (legacy) | `ghl_email_builder_template_delete` | ditto |
| `ghl_email_update_template` (legacy) | `ghl_email_builder_template_update` | ditto |
| `ghl_email_fetch_campaigns` | `ghl_email_legacy_campaign_list` | Distinguish from v3 campaign family |
| `ghl_blog_get_post` | `ghl_blog_post_list` | It's a paginated list, not a single fetch |
| `ghl_blog_get` | `ghl_blog_site_list` | Clarity |
| `ghl_form_get` | `ghl_form_list` | It's a list endpoint |
| `ghl_funnel_get` | `ghl_funnel_list` | It's a list endpoint |
| `ghl_link_get` | `ghl_link_list` | It's a list endpoint |
| `ghl_campaign_get` | `ghl_campaign_list` | It's a list endpoint |
| `ghl_survey_get` | `ghl_survey_list` | It's a list endpoint |
| `ghl_workflow_get` | `ghl_workflow_list` | It's a list endpoint |
| `ghl_social_get_upload_status` | `ghl_social_csv_list` | Misleading — it's a paginated list of all imports |
| `ghl_social_start_csv_finalize` | `ghl_social_csv_finalize` | Cleaner |
| `ghl_social_get_categories_id` | `ghl_social_category_get` | Clarity |
| `ghl_social_get_categories_location_id` | `ghl_social_category_list` | Clarity |

## Exceptions (skipped or flagged)

| Operation | Disposition | Reason |
|---|---|---|
| `GET /social-media-posting/oauth/{facebook,google,instagram,linkedin,tiktok-business,tiktok,twitter}/start` (7) | Skipped | Browser-only OAuth initiation, response via `window.postMessage`, not callable server-to-server |
| `GET /social-media-posting/oauth/{platform}/start` (v3) | Skipped | Same — v3 generic version of the above |
| `POST /forms/upload-custom-files` | Registered but flagged exception | Spec has no requestBody schema at all → generated tool has no `body` field, file bytes cannot currently be passed through this tool. Fix requires a registry.ts capability, out of scope here. |

All other 125 operations: verified `ok` — schema complete, correct version header, pagination present where the spec documents it, no extraction loss found.

## Verification steps run

1. `npx tsc --noEmit` — clean.
2. `npm run build` — succeeds.
3. Loaded the built registry (`buildRegistry(null)`) in a scratch script: 649 tools server-wide, **0 duplicate names**, 18 total skips (8 mine + 10 from other domains).
4. Cross-checked every one of my domain's 134 `METHOD /path` keys against the built registry/skip list — 134/134 accounted for, 0 "not found".
5. Spot-read the full spec JSON (not truncated excerpts) for every endpoint discussed above directly from `apps/{,v3/}*.json` before writing any override or claim.
