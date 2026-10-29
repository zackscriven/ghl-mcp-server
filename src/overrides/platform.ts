/** Curated overrides for the platform domain — populated by the domain audit. */
import type { DomainOverrides } from "../types.js";

export const platformOverrides: DomainOverrides = {
  domain: "platform",
  notes: [
    "Domain covers 93 ops across users, locations, businesses, companies, saas-api/saas, oauth, snapshots, custom-menus, marketplace (legacy oauth.json + users.json spec-file variants deduped in favor of v3 where a v3 twin exists).",
    "AGENCY-TOKEN-ONLY ops (verified via `security` blocks requiring Agency-Access / Agency-Access-Only, no Location-Access alternative): GET /oauth/installedLocations, POST /oauth/locationToken, GET /oauth/installed-locations, POST /oauth/location-token, POST /users/search/filter-by-email, PUT /locations/{locationId}, DELETE /locations/{locationId}, POST /locations/, GET /locations/{locationId}/permissions, PUT /locations/{locationId}/permissions, GET /companies/{companyId}, all 26 saas/saas-api ops, all 4 snapshots ops, all 5 custom-menus ops. Each gets a descriptionNote below. Mixed Agency-or-Location ops (GET/PUT/DELETE /users/{userId}, GET /users/search, POST /users/) are NOT flagged agency-only since a location token also works.",
    "BUG (spec-level, not fixable via override — flagged for registry/generator owner): PUT /users/{userId} and DELETE /users/{userId} declare NO `userId` path parameter in their operation-level `parameters` array in both users.json (legacy) and v3/users-v3.json — only the GET sibling declares it, even though all three share the same {userId} path template. operations.json faithfully carries this gap (parameters: []). Because src/registry.ts builds the tool's input schema strictly from op.parameters (buildInputSchema, no path-template fallback) and sets additionalProperties:false, the generated ghl_user_update and ghl_user_delete tools currently have NO way to accept userId as an argument — calling them will always throw 'Missing required path parameter(s): userId' in http.ts. This cannot be fixed with an OperationOverride (extraQueryParams only supports `in: query`, not `in: path`). Recommended fix: registry.ts's buildInputSchema should synthesize any {token} found in op.path as a required string path param whenever the spec's parameters array omits it, regardless of per-operation override support. Left both ops REGISTERED (not skipped) per brief guidance to keep ops registered and report exceptions rather than hide them, but this is effectively broken until the generator fix lands — see status json for both keys.",
    "oauth ops use form-encoded or mixed bodies exactly as the brief flagged: POST /oauth/locationToken (legacy) and POST /oauth/location-token (v3) are application/x-www-form-urlencoded ONLY in the spec (registry.ts's automatic non-JSON contentType fallback already selects this correctly with zero overrides, but an explicit contentType override + note is added anyway for robustness/documentation). POST /oauth/token documents BOTH application/x-www-form-urlencoded and application/json for the same GetAccessTokenBodyDto schema; registry.ts's default logic would silently prefer application/json (since it's present in content), so an explicit override pins it to the conventional OAuth2 form-encoded body with a note that JSON is also accepted per spec.",
    "GET/POST /locations/{locationId}/customFields/upload uses multipart/form-data only in the spec (no application/json sibling) — registry.ts's automatic non-JSON fallback already selects multipart/form-data with zero override needed; added a contentType override + descriptionNote anyway per brief instruction for uploads, to document the expected multipart field shape explicitly for callers.",
    "Request-body completeness spot-checked and verified COMPLETE (no extraction loss) for: POST /users/ + PUT /users/{userId} (CreateUserDto/UpdateUserDto — permissions $ref resolved inline to all 38 PermissionsDto fields, scopes/scopesAssignedToOnly enums carried in full at 194 entries each), POST /locations/ + PUT /locations/{locationId} (16 top-level fields incl. prospectInfo/settings/social/twilio/mailgun), POST /businesses/, POST /custom-menus/, PUT /locations/{locationId}/permissions, POST /locations/{locationId}/customFields, POST /locations/{locationId}/tags, POST /locations/{locationId}/recurring-tasks, POST /snapshots/share/link, POST /saas-api/.../wallet-balance/complimentary-credits.",
    "GET /marketplace/billing/charges* (4 ops) show versionHeader:'' in operations.json — verified this is CORRECT per spec: none of the 5 billing/charges paths declare a `Version` header parameter at all (unusual vs. the rest of the domain, but genuinely undocumented — not an extraction bug). No override added; left as-is with no Version header sent.",
    "Pagination: list ops in this domain expose the spec's documented cursor/offset params as-is (skip/limit on GET /oauth/installedLocations, GET /businesses/, GET /custom-menus/, GET /users/search, GET /marketplace/billing/charges; pageSize/pageToken on GET /oauth/installed-locations (v3); page on GET /saas*/saas-locations/{companyId}). No under-documented pagination params found requiring extraQueryParams.",
    "Deprecated ops: GET /users/ (legacy 'Get User by Location', spec self-marks deprecated) and the entire /saas-api/public-api/* family (9 ops, all deprecated:true in v3/saas-v3.json in favor of the newer /saas/* paths with identical shapes) — descriptionNotes added naming the documented replacement where the spec states one.",
    "No tool-name collisions found (checked docs/generated-names.json server-wide: 0 duplicate names across all domains). Renamed a handful of awkward/ambiguous generated names within the platform prefix set (ghl_oauth_get_installed_location_get2, ghl_oauth_get_location_access_token_post2, ghl_saas_generate_payment_link[_deprecated] which was misnamed for an actual subscription-update op, ghl_snapshot_get_custom, ghl_location_put) — see overrides below.",
    "Legacy vs v3 versionHeader spot-checked across all 93 ops against their specFile's own Version enum (2021-07-28 for oauth.json/users.json legacy twins, 'v3' for every v3/*.json file, empty for the undocumented marketplace billing/charges group) — no mismatches found; no versionHeader overrides needed.",
  ],
  overrides: {
    // --- oauth (agency-only + form-encoded bodies) ---
    "GET /oauth/installedLocations": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only, no Location-Access alternative. Legacy twin of GET /oauth/installed-locations (v3); prefer the v3 op for new integrations.",
    },
    "POST /oauth/locationToken": {
      contentType: "application/x-www-form-urlencoded",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only. Body is application/x-www-form-urlencoded per spec (companyId, locationId as form fields), not JSON. Legacy twin of POST /oauth/location-token (v3); prefer the v3 op for new integrations.",
    },
    "GET /oauth/installed-locations": {
      name: "ghl_oauth_get_installed_locations",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only, no Location-Access alternative.",
    },
    "POST /oauth/location-token": {
      name: "ghl_oauth_exchange_location_token",
      contentType: "application/x-www-form-urlencoded",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only. Body is application/x-www-form-urlencoded per spec (companyId, locationId as form fields), not JSON. This is the standard way to mint a location-scoped token from an agency token.",
    },
    "POST /oauth/token": {
      name: "ghl_oauth_get_access_token",
      contentType: "application/x-www-form-urlencoded",
      descriptionNote: "OAuth2 token exchange (authorization_code / refresh_token grants). Spec documents the SAME GetAccessTokenBodyDto schema under both application/x-www-form-urlencoded and application/json content types — this tool defaults to the conventional form-encoded body; application/json is also accepted per spec if you construct the request outside this tool. No security scheme on this op (client credentials go in the body).",
    },

    // --- users ---
    "GET /users/": {
      descriptionNote: "DEPRECATED per spec — superseded by GET /users/search (v3), which supports the same locationId filter plus richer query/paging options.",
    },
    "PUT /users/{userId}": {
      descriptionNote: "KNOWN ISSUE: the official spec omits `userId` from this operation's path-parameter list (only the GET sibling declares it, despite all three sharing the same {userId} path template), so this tool currently has no input field for userId and calls will fail with a missing-path-parameter error until the generator (src/registry.ts) is patched to infer path params from the URL template. Tracked in this file's `notes`.",
    },
    "DELETE /users/{userId}": {
      descriptionNote: "KNOWN ISSUE: the official spec omits `userId` from this operation's path-parameter list (only the GET sibling declares it, despite all three sharing the same {userId} path template), so this tool currently has no input field for userId and calls will fail with a missing-path-parameter error until the generator (src/registry.ts) is patched to infer path params from the URL template. Tracked in this file's `notes`.",
    },
    "POST /users/search/filter-by-email": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access only (no Location-Access alternative), unlike the other /users/* ops in this file.",
    },

    // --- locations ---
    "POST /locations/": {
      name: "ghl_location_create",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only. Creates a new sub-account (location) under the given companyId.",
    },
    "PUT /locations/{locationId}": {
      name: "ghl_location_update",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "DELETE /locations/{locationId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only. Irreversible: deletes the sub-account; deleteTwilioAccount query param controls whether the attached Twilio sub-account is also torn down.",
    },
    "GET /locations/{locationId}/permissions": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only, despite the `locations/write` scope name.",
    },
    "PUT /locations/{locationId}/permissions": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "POST /locations/{locationId}/customFields/upload": {
      contentType: "multipart/form-data",
      descriptionNote: "File upload — body is multipart/form-data (the file plus its associated customField id/name), not JSON. The spec has no application/json alternative for this op.",
    },

    // --- businesses / companies ---
    "GET /companies/{companyId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },

    // --- custom-menus (agency-only) ---
    "GET /custom-menus/{customMenuId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all custom-menus ops.",
    },
    "DELETE /custom-menus/{customMenuId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all custom-menus ops.",
    },
    "PUT /custom-menus/{customMenuId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all custom-menus ops.",
    },
    "GET /custom-menus/": {
      name: "ghl_custom_menu_list",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all custom-menus ops.",
    },
    "POST /custom-menus/": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all custom-menus ops.",
    },

    // --- snapshots (all agency-only) ---
    "GET /snapshots/": {
      name: "ghl_snapshot_list",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all snapshots ops.",
    },
    "POST /snapshots/share/link": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all snapshots ops.",
    },
    "GET /snapshots/snapshot-status/{snapshotId}/location/{locationId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all snapshots ops.",
    },
    "GET /snapshots/snapshot-status/{snapshotId}": {
      name: "ghl_snapshot_get_pushes_between_dates",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only for all snapshots ops. `from`/`to`/`lastDoc` are required query params per spec despite generic-sounding names.",
    },

    // --- marketplace ---
    "GET /marketplace/app/{appId}/rebilling-config/location/{locationId}": {
      name: "ghl_marketplace_get_rebilling_config",
    },

    // --- saas-api/public-api/* (deprecated legacy family — all agency-only) ---
    "GET /saas-api/public-api/agency-plans/{companyId}": {
      descriptionNote: "DEPRECATED per spec — superseded by GET /saas/agency-plans/{companyId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "POST /saas-api/public-api/bulk-disable-saas/{companyId}": {
      descriptionNote: "DEPRECATED per spec — superseded by POST /saas/bulk-disable-saas/{companyId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "POST /saas-api/public-api/bulk-enable-saas/{companyId}": {
      descriptionNote: "DEPRECATED per spec — superseded by POST /saas/bulk-enable-saas/{companyId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "POST /saas-api/public-api/enable-saas/{locationId}": {
      descriptionNote: "DEPRECATED per spec — superseded by POST /saas/enable-saas/{locationId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "GET /saas-api/public-api/get-saas-subscription/{locationId}": {
      descriptionNote: "DEPRECATED per spec — superseded by GET /saas/get-saas-subscription/{locationId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "GET /saas-api/public-api/locations": {
      name: "ghl_saas_get_locations_by_stripe_id_deprecated",
      descriptionNote: "DEPRECATED per spec — superseded by GET /saas/locations. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "POST /saas-api/public-api/pause/{locationId}": {
      descriptionNote: "DEPRECATED per spec — superseded by POST /saas/pause/{locationId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "GET /saas-api/public-api/saas-locations/{companyId}": {
      descriptionNote: "DEPRECATED per spec — superseded by GET /saas/saas-locations/{companyId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "GET /saas-api/public-api/saas-plan/{planId}": {
      descriptionNote: "DEPRECATED per spec — superseded by GET /saas/saas-plan/{planId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "POST /saas-api/public-api/update-rebilling/{companyId}": {
      descriptionNote: "DEPRECATED per spec — superseded by POST /saas/update-rebilling/{companyId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN.",
    },
    "PUT /saas-api/public-api/update-saas-subscription/{locationId}": {
      name: "ghl_saas_update_saas_subscription_deprecated",
      descriptionNote: "DEPRECATED per spec — superseded by PUT /saas/update-saas-subscription/{locationId}. REQUIRES AN AGENCY-LEVEL (Company) TOKEN. NOTE: the generated name for this op was misleading ('generate_payment_link'); corrected to reflect what the op actually does (updates an existing SaaS subscription plan/pricing), matching its summary 'Update SaaS subscription'.",
    },

    // --- saas/* (current family — all agency-only except wallet-balance ops) ---
    "GET /saas/companies/{companyId}/locations/{locationId}/wallet-balance": {
      name: "ghl_saas_get_location_wallet_balance",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "POST /saas/companies/{companyId}/locations/{locationId}/wallet-balance/complimentary-credits": {
      name: "ghl_saas_update_location_wallet_balance",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only. Adds/adjusts complimentary wallet credits for the given location.",
    },
    "GET /saas/agency-plans/{companyId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "POST /saas/allow-attach-rebilling/{locationId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "POST /saas/bulk-disable-saas/{companyId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "POST /saas/bulk-enable-saas/{companyId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "POST /saas/enable-saas/{locationId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "GET /saas/get-saas-subscription/{locationId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "GET /saas/locations": {
      name: "ghl_saas_get_locations_by_stripe_id",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only. customerId and subscriptionId are both required query params per spec (unlike the deprecated /saas-api twin, where they're optional).",
    },
    "POST /saas/pause/{locationId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "GET /saas/saas-locations/{companyId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only. `page` is a required query param per spec.",
    },
    "GET /saas/saas-plan/{planId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "POST /saas/update-rebilling/{companyId}": {
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only.",
    },
    "PUT /saas/update-saas-subscription/{locationId}": {
      name: "ghl_saas_update_saas_subscription",
      descriptionNote: "REQUIRES AN AGENCY-LEVEL (Company) TOKEN — spec security is Agency-Access-Only. Updates an existing SaaS subscription's plan/pricing for the location. NOTE: the generated name for this op was misleading ('generate_payment_link'); corrected to reflect what the op actually does, matching its summary 'Update SaaS subscription'.",
    },
  },
};
