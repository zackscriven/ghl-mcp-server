/** Curated overrides for the marketing domain — populated by the domain audit. */
import type { DomainOverrides } from "../types.js";

export const marketingOverrides: DomainOverrides = {
  domain: "marketing",
  notes: [
    "Domain covers: social-media-posting (legacy) + social-planner-v3 (Social Planner), medias-v3, blogs-v3, funnels-v3, forms-v3, surveys-v3, workflows-v3, campaigns-v3, emails.json (legacy) + emails-v3, links-v3, courses-v3, brand-boards-v3. 134 operations total.",
    "REGRESSION CHECK — GET /medias/files: VERIFIED FIXED. Spec (v3/medias-v3.json) marks type, altType, altId, sortBy, sortOrder as required:true, and operations.json carries that through unchanged (spot-checked the generated Operation.parameters array). No forceRequired override needed. Renamed to ghl_media_list_files per brief.",
    "REGRESSION CHECK — POST /social-media-posting/{locationId}/posts (create-post): schema is faithful to spec. requestBody dereferences CreatePostDTO in full (29KB inlined, no truncation) — top-level required fields are type, accountIds, userId; media[].type carries the MIME type (image/jpeg, image/png, video/mp4, etc. — enum verified against PostMediaSchema). Added a descriptionNote warning about the live 2026-07-04 regression per BRIEF instructions — schema itself is correct, so any live failures are server-side, not a tool/schema defect. Renamed to ghl_social_post_create per brief.",
    "Media upload endpoints are multipart/form-data and the registry auto-detects that from operations.json (registry.ts falls back to the sole non-json content-type key), so tools already send the right Content-Type without an override. Added explicit contentType overrides anyway for self-documentation, plus descriptionNotes because http.ts does NOT construct a multipart body for the caller — it sends whatever the `body` argument is verbatim as BodyInit. An MCP caller cannot practically hand-construct a multipart/form-data payload (with boundary) through a JSON tool-call. Flagged this as a real usability gap in each note, and pointed callers at the hosted-URL escape hatch where the API offers one.",
    "POST /forms/upload-custom-files has NO requestBody schema in the spec at all (`multipart/form-data: {}` — empty object). Because registry.ts's buildInputSchema falls through to `undefined` when no schema exists at the resolved content type AND there's no application/json fallback, the generated tool ends up with NO `body` property in its input schema — there is currently no way to pass file bytes through this tool. This is not something an override can fix (it's a registry.ts code gap, out of scope for this docs-driven audit), so it's called out here explicitly and in the status file as an exception. descriptionNote documents the field-naming convention (`<custom_field_id>_<file_id>`) from the spec prose for whenever the gap is closed.",
    "Social CSV bulk-import (POST /social-media-posting/{locationId}/csv), CSV status/finalize/delete, and set-accounts endpoints: all present and schema-complete. Renamed GET /social-media-posting/{locationId}/csv from ghl_social_get_upload_status to ghl_social_csv_list — the generated name implied a single status check but the op (operationId get-upload-status) actually paginates (skip/limit) over ALL CSV imports for a location; kept a descriptionNote clarifying this.",
    "OAuth/social-account attach flows: split cleanly into two kinds. (1) The 8 '/oauth/.../start' endpoints (7 legacy platform-specific + 1 v3 generic /oauth/{platform}/start) are genuinely browser-only — their spec descriptions say to open the URL in a browser window and listen for a window.postMessage event; there is no server-to-server response to consume. Skipped all 8 with reason, per BRIEF's skip-with-reason guidance. (2) The '.../accounts/{accountId}' GET/POST endpoints (attach step 2/3) and the v3 generic oauth/{locationId}/{platform}/accounts/{accountId} pair are normal callable JSON APIs (no browser-window language in their spec descriptions) — left registered, untouched.",
    "Legacy email-builder API (emails.json: /emails/builder, /emails/builder/data, /emails/builder/{locationId}/{templateId}, /emails/schedule) is a DIFFERENT, older template system from v3's /emails/locations/{locationId}/templates family — they are not the same resource. Both used bare operationIds like 'create-template'/'delete-template'/'update-template', which the generator had already collision-suffixed into ugly names (ghl_email_create_template_post2, ghl_email_update_template_patch2, ghl_email_delete_template_delete2). Renamed the legacy builder ops to a ghl_email_builder_template_* family and the v3 ops to a clean ghl_email_template_* family per the brief's suggested ghl_email_template_* pattern — resolves the collision and removes the auto-suffixes.",
    "Blog post GET /blogs/posts/all (operationId get-blog-post) is actually a paginated LIST of posts for a blogId (limit required in spec), not a single-post fetch — the generated name ghl_blog_get_post was misleading next to the new ghl_blog_post_create. Renamed to ghl_blog_post_list. Similarly renamed several other '_get' names that are actually list endpoints (forms, funnels, links, campaigns, surveys, workflows, blog sites) to '_list' for clarity — see overrides below.",
    "Funnel page ops (GET /funnels/page, GET /funnels/page/count, GET /funnels/funnel/list) genuinely have NO Version header parameter in v3/funnels-v3.json (unlike the /funnels/lookup/redirect/* ops in the same file, which do require Version: v3). operations.json correctly reflects this (versionHeader is empty string for those three, 'v3' for the redirect ones) — verified as a real spec quirk, not an extraction bug. No override applied.",
    "brand-boards-v3.json operations also carry no explicit 'Version' header parameter in the spec (only an 'x-version-added: v3' vendor extension), yet operations.json assigns versionHeader='v3' to all 11 ops — this appears to be a generator default for v3-tier specs rather than a per-operation spec extraction. Not overridden (no evidence it's wrong; sending Version: v3 to a v3-tagged endpoint is very unlikely to be harmful), but flagged here for visibility since it doesn't trace to an explicit spec parameter the way other domains' version headers do.",
    "campaigns-v3.json (GET /campaigns/) and workflows-v3.json (GET /workflows/) genuinely have no pagination parameters in their specs at all (no limit/offset/page) — confirmed by reading both spec files in full; not an extraction gap.",
    "courses-v3.json exposes exactly one operation (POST /courses/courses-exporter/public/import) and campaigns-v3.json exposes exactly one (GET /campaigns/) — this matches the official spec files, not a filtering error; the GHL public API for both is genuinely that thin.",
    "Twitter/X oauth endpoints (GET/POST .../twitter/accounts/{accountId}, GET .../oauth/twitter/start) are marked deprecated in the legacy spec and operations.json correctly carries deprecated:true through; left registered per BRIEF rule 6 (no documented replacement named in the spec, so no descriptionNote redirect was added beyond the automatic deprecation notice registry.ts already appends).",
  ],
  overrides: {
    // ---- Regression-check: Social Planner create-post (BRIEF-mandated warning) ----
    "POST /social-media-posting/{locationId}/posts": {
      name: "ghl_social_post_create",
      descriptionNote:
        "KNOWN LIVE REGRESSION (as of 2026-07-04): this endpoint was observed broken/failing in production even though its documented schema (top-level accountIds/summary/media/status/type/userId, platform-specific *PostDetails objects) is correct and faithfully reproduced here. If a call fails, the schema/tool is not at fault — treat it as a possible server-side GHL issue and check the response body for details before assuming a client-side mistake.",
    },

    // ---- Regression-check: GET /medias/files (verified fixed, renamed per brief) ----
    "GET /medias/files": {
      name: "ghl_media_list_files",
      descriptionNote:
        "Regression check (old connector 422'd here because it had no way to pass the required `type` param): VERIFIED FIXED — type, altType, altId, sortBy, sortOrder are all present and required in this tool's input schema, matching the spec.",
    },

    // ---- Multipart / upload endpoints ----
    "POST /medias/upload-file": {
      name: "ghl_media_upload_file",
      contentType: "multipart/form-data",
      descriptionNote:
        "multipart/form-data upload. `body.file` (binary) is required UNLESS `body.hosted` is true, in which case `body.fileUrl` is required instead — prefer the hosted:true + fileUrl path when the file already has a public URL, since this tool does not construct a multipart payload for you: the `body` you pass is sent to GHL as-is as the request body, so a raw binary `file` upload only works if the caller already has a pre-encoded multipart/form-data payload (including boundary) to hand it. Max 25MB (images/docs) / 500MB (video).",
    },
    "POST /social-media-posting/{locationId}/csv": {
      name: "ghl_social_csv_upload",
      contentType: "multipart/form-data",
      descriptionNote:
        "multipart/form-data upload, `body.file` (binary CSV) required — there is no URL-based alternative for this endpoint (unlike media upload). This tool does not construct the multipart payload for you; the `body` argument is sent to GHL verbatim as the request body, so the caller must already have a valid pre-encoded multipart/form-data payload (with boundary) to pass through.",
    },
    "POST /forms/upload-custom-files": {
      name: "ghl_form_upload_custom_files",
      contentType: "multipart/form-data",
      descriptionNote:
        "EXCEPTION — no callable body schema: the official spec documents this endpoint's multipart/form-data requestBody as a bare empty object (no fields listed), so this tool's generated input schema has NO `body` property at all; there is currently no way to attach file bytes through this tool. Per the spec's prose, fields must be a buffer keyed `<custom_field_id>_<file_id>` (custom field ID + a random file id), max 50MB, one of PDF/DOCX/DOC/JPG/JPEG/PNG/GIF/CSV/XLSX/XLS/MP4/MPEG/ZIP/RAR/TXT/SVG. Fixing this requires a registry.ts change (a hand-written schema override capability that doesn't exist yet), which is out of scope for this docs-only override pass — flagged as an exception in the audit.",
    },

    // ---- Browser-only OAuth start flows: skip with reason ----
    "GET /social-media-posting/oauth/facebook/start": {
      skip: { reason: "Browser-only OAuth initiation flow (spec: 'Open the API in a window ... User is navigated to Facebook login OAuth screen ... listen on window object for message'). Result is delivered via window.postMessage in a browser context, not a server-to-server HTTP response — not callable from an MCP server. Complete the flow in an actual browser, then use ghl_social_get_facebook_page_group / ghl_social_attach_facebook_page_group with the resulting accountId." },
    },
    "GET /social-media-posting/oauth/google/start": {
      skip: { reason: "Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_google_locations / ghl_social_set_google_locations after completing the flow in a browser." },
    },
    "GET /social-media-posting/oauth/instagram/start": {
      skip: { reason: "Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_instagram_page_group / ghl_social_attach_instagram_page_group after completing the flow in a browser." },
    },
    "GET /social-media-posting/oauth/linkedin/start": {
      skip: { reason: "Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_linkedin_page_profile / ghl_social_attach_linkedin_page_profile after completing the flow in a browser." },
    },
    "GET /social-media-posting/oauth/tiktok-business/start": {
      skip: { reason: "Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_tiktok_business_profile after completing the flow in a browser." },
    },
    "GET /social-media-posting/oauth/tiktok/start": {
      skip: { reason: "Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_tiktok_profile / ghl_social_attach_tiktok_profile after completing the flow in a browser." },
    },
    "GET /social-media-posting/oauth/twitter/start": {
      skip: { reason: "Browser-only OAuth initiation flow AND deprecated per the spec (Twitter/X). Not callable server-to-server (window.postMessage response). No documented replacement named in the spec." },
    },
    "GET /social-media-posting/oauth/{platform}/start": {
      skip: { reason: "v3 generic browser-only OAuth initiation flow ('Start OAuth Flow (Step 1 of 3)' — spec explicitly says 'Open this API in a browser window (not via cURL)'; result delivered via window.postMessage). Not callable server-to-server. After completing the flow in a browser, use GET /social-media-posting/{locationId}/{platform}/accounts/{accountId} (ghl_social_get_oauth_accounts) with the resulting accountId, per the spec's own documented 3-step flow." },
    },

    // ---- Legacy email-builder template family (renamed to avoid colliding with v3 templates) ----
    "POST /emails/builder": {
      name: "ghl_email_builder_template_create",
      descriptionNote: "Legacy 'Email Builder' template API (2021-era, distinct from the v3 template family below — different data model, not interchangeable).",
    },
    "GET /emails/builder": {
      name: "ghl_email_builder_template_get",
      descriptionNote: "Legacy 'Email Builder' template API (2021-era, distinct from the v3 template family below — different data model, not interchangeable).",
    },
    "DELETE /emails/builder/{locationId}/{templateId}": {
      name: "ghl_email_builder_template_delete",
      descriptionNote: "Legacy 'Email Builder' template API (2021-era, distinct from the v3 template family below — different data model, not interchangeable).",
    },
    "POST /emails/builder/data": {
      name: "ghl_email_builder_template_update",
      descriptionNote: "Legacy 'Email Builder' template API (2021-era, distinct from the v3 template family below — different data model, not interchangeable).",
    },
    "GET /emails/schedule": {
      name: "ghl_email_legacy_campaign_list",
      descriptionNote: "Legacy schedule/campaign listing (2021-era, distinct from the v3 campaign family at /emails/locations/{locationId}/campaigns/emails). Supports limit/offset pagination plus status and emailStatus filters.",
    },

    // ---- v3 email template family (clean names now that legacy no longer collides) ----
    "DELETE /emails/locations/{locationId}/templates/{templateId}": { name: "ghl_email_template_delete" },
    "GET /emails/locations/{locationId}/templates/{templateId}": { name: "ghl_email_template_get" },
    "PATCH /emails/locations/{locationId}/templates/{templateId}": { name: "ghl_email_template_update" },
    "GET /emails/locations/{locationId}/templates": { name: "ghl_email_template_list" },
    "POST /emails/locations/{locationId}/templates": { name: "ghl_email_template_create" },
    "POST /emails/locations/{locationId}/templates/folders": { name: "ghl_email_template_folder_create" },
    "POST /emails/locations/{locationId}/templates/import": { name: "ghl_email_template_import" },

    // ---- Media file family (consistent "_file(s)" naming, matches ghl_media_list_files) ----
    "DELETE /medias/{id}": { name: "ghl_media_delete_file" },
    "POST /medias/{id}": { name: "ghl_media_update_file" },
    "PUT /medias/delete-files": { name: "ghl_media_bulk_delete_files" },
    "PUT /medias/update-files": { name: "ghl_media_bulk_update_files" },

    // ---- Blog naming (brief-mandated create rename + list clarity) ----
    "POST /blogs/posts": { name: "ghl_blog_post_create" },
    "GET /blogs/posts/all": {
      name: "ghl_blog_post_list",
      descriptionNote: "Lists all posts for a given blogId (operationId get-blog-post) — not a single-post fetch. Requires blogId + limit; paginated.",
    },
    "GET /blogs/site/all": { name: "ghl_blog_site_list" },

    // ---- "_get" → "_list" clarity renames for genuine list endpoints ----
    "GET /forms/": { name: "ghl_form_list" },
    "GET /funnels/funnel/list": { name: "ghl_funnel_list" },
    "GET /links/": { name: "ghl_link_list" },
    "GET /campaigns/": { name: "ghl_campaign_list" },
    "GET /surveys/": { name: "ghl_survey_list" },
    "GET /workflows/": { name: "ghl_workflow_list" },

    // ---- Social Planner CSV / category naming clarity ----
    "GET /social-media-posting/{locationId}/csv": {
      name: "ghl_social_csv_list",
      descriptionNote: "Lists the status of ALL CSV bulk-import batches for the location (operationId get-upload-status — the name is misleading; it's a paginated list, not a single status check). Supports skip/limit; userId query param is required per spec.",
    },
    "PATCH /social-media-posting/{locationId}/csv/{id}": {
      name: "ghl_social_csv_finalize",
      descriptionNote: "Finalizes a previously uploaded CSV import and schedules all its posts for publishing (operationId start-csv-finalize).",
    },
    "GET /social-media-posting/{locationId}/categories/{id}": { name: "ghl_social_category_get" },
    "GET /social-media-posting/{locationId}/categories": { name: "ghl_social_category_list" },
  },
};
