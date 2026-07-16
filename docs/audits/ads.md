# Ads & Affiliates domain audit

Scope: legacy `ad-manager.json` + v3 `ad-publishing-v3.json` (Facebook/Google/LinkedIn ad publishing) + v3 `affiliate-manager-v3.json`. 104 rows in `operations.json` for these three spec files; 99 registered after dedup (matches the brief's "~99 operations" estimate).

## 1. Dedup gap between ad-manager (legacy) and ad-publishing (v3)

The automated METHOD+path dedup missed 5 legacy/v3 pairs because the paths differ cosmetically:

| Legacy (`ad-manager.json`) | v3 twin (`ad-publishing-v3.json`) | operationId |
|---|---|---|
| `PUT /ad-publishing/facebook/ads-v2` | `PUT /ad-publishing/facebook/ads` | `fb-upsert-ad` |
| `POST /ad-publishing/facebook/adsets/{adsetId}/duplicate` | `POST /ad-publishing/facebook/adsets/{adSetId}/duplicate` | `fb-duplicate-adset` |
| `POST /ad-publishing/facebook/adsets/{adsetId}/pause` | `POST /ad-publishing/facebook/adsets/{adSetId}/pause` | `fb-pause-adset` |
| `POST /ad-publishing/facebook/adsets/{adsetId}/resume` | `POST /ad-publishing/facebook/adsets/{adSetId}/resume` | `fb-resume-adset` |
| `DELETE /ad-publishing/facebook/adsets/{adsetId}` | `DELETE /ad-publishing/facebook/adsets/{adSetId}` | `fb-delete-adset` |

Root cause: `ads-v2` vs `ads` (different literal path segment), and `{adsetId}` vs `{adSetId}` (camelCase mismatch on the adset path parameter) — both defeat a literal string-match dedup even though they're the same operationId with an identical/superset request schema in the v3 tier. This is also why the name generator had already produced ugly disambiguated names for the v3 ops (`ghl_ad_fb_duplicate_adset_post2`, `_delete2`, `ghl_ad_fb_upsert_put2`) — it detected the collision with the legacy names and appended a suffix.

**Action taken:** all 5 legacy rows marked `skip` with reason `"v3 twin registered under ad-publishing (<method> <path>, <operationId>)"`. The v3 twins keep their operationId and get clean curated names (no more `_post2`/`_delete2`/`_put2` suffixes) — see the rename table below.

Legacy `affiliate-manager.json` needed no such fix: all of its paths matched their v3 twins exactly, so the existing dedup already fully absorbed it (zero residual rows in `operations.json` for that spec file).

## 2. Version headers

Checked every operation's actual `Version` header enum in the raw spec (not just its tier), because this domain has a subtlety: **being in the v3-tier spec file does not mean the operation's Version header is `"v3"`.** 91 of the 95 `ad-publishing-v3.json` operations document `Version: 2021-07-28` — only `fb-get-campaign-publishing-progress` documents `Version: v3`. All 4 `affiliate-manager-v3.json` operations document `Version: v3`. `operations.json` already captures this correctly per-operation (confirmed via direct diff against the spec's per-op `parameters[].schema.enum`), so **no `versionHeader` overrides were added anywhere in this domain.**

## 3. Request body completeness

Spot-checked resolved (`$ref`-followed) schemas against `operations.json` extraction for the largest/most complex bodies: `fb-upsert-campaign`, `fb-upsert-adset`, `fb-upsert-ad`, `fb-batch-update-audience-members`, `google-upsert-campaign` (`CampaignDTO`, 21 properties incl. `budget`/`audience`/`networkSettings`/`biddingStrategy`/`assets`/`adGroups` nested objects), `li-upsert-campaign-group`. All properties and `required` arrays matched exactly — no extraction loss found.

## 4. Content type

Every POST/PUT/PATCH request body in this domain is `application/json`. No multipart/form-data (no file-upload endpoints in ad-publishing or affiliate-manager). No `contentType` overrides needed.

## 5. Pagination

- **Reporting/insight endpoints** (`fb`/`google`/`li` `reporting`, `reporting/list`, `reporting/campaign/{id}`, `reporting/campaign-group/{id}`) — no `limit`/`offset` in the spec. Confirmed via `mcp__ghl-docs__ghl_docs_context` search ("Facebook ad publishing reporting list pagination limit parameter") that no undocumented pagination param surfaces elsewhere in the docs corpus either. These endpoints are scoped by `locationId` + `startDate`/`endDate` (+ optional `campaignId`/`listType`/`groupBy`) instead of paginated — that's the actual mechanism, not a gap. No `extraQueryParams` added.
- **Account/list endpoints** — `fb-get-ad-accounts` already exposes `limit` + `next` (cursor) + `fetchAll`. Smaller platform-mirrored lists (`fb-get-custom-audiences`, `google-get-audiences`, `google-get-segments`, `li-get-ad-accounts`, `li-get-lead-forms`, etc.) have no pagination params in the spec — these return the full set of platform objects tied to one ad account/integration, which is bounded in practice; no evidence in the docs corpus of an undocumented pagination param for any of them.
- **`affiliate-manager`** — `list-affiliates`, `list-commissions`, `list-payouts` already expose `skip` + `limit` + date-range filters (`fromDate`/`toDate` or `start`/`end`) in the spec. Confirmed complete, no gaps.

No `extraQueryParams` overrides were needed anywhere in this domain.

## 6. Under-marked required params

Two spec oddities found and left as-is (not verified as documentation errors, so no `forceRequired` added per BRIEF guidance):
- `fb-search-targeting` (`GET /ad-publishing/facebook/targeting/search`) documents `locationId` as **not required** — every other ad-publishing op requires it. Extraction is faithful to the spec; flagging here as a surprise, not fixing blind.
- `li-search-targeting` (`GET /ad-publishing/linkedin/targeting/search`) documents both a `query` and a `q` query param, both optional — looks redundant but is exactly what the spec shows.

## 7. Deprecated ops

0 of 104 operations in this domain are marked `deprecated` in the spec. Nothing to annotate.

## 8. Tool names

Renamed the whole domain from the generator's action-first pattern (`ghl_ad_fb_get_account`, `ghl_ad_fb_duplicate_campaign`) to a consistent resource-first pattern (`ghl_ad_fb_account_get`, `ghl_ad_fb_campaign_duplicate`), matching the requested `ghl_ad_campaign_*`/`ghl_ad_adset_*`/`ghl_ad_creative_*` style while keeping the platform (`fb`/`google`/`li`) as a namespace segment — Facebook, Google, and LinkedIn ad resources have materially different schemas and can't safely share one prefix (e.g. "campaign" means a different DTO per platform). 95 renames total (all of `ad-publishing-v3.json` except none omitted, plus 2 of the 4 `affiliate-manager-v3.json` ops); every name verified unique within the domain and ≤ 64 chars.

Notable judgment calls:
- **No distinct "creative" resource exists in this API.** Facebook's individual-ad level (`fb-upsert-ad`, `fb-duplicate-ad`, `fb-pause-ad`, `fb-resume-ad`, `fb-delete-ad`) carries `primaryText`/`headline`/`imageUrl`/`media` directly on the ad object — named `ghl_ad_fb_ad_*`, not `ghl_ad_fb_creative_*`, to match the actual DTO shape rather than invent a resource the API doesn't have.
- **Google's `/ads` and `/ads/{adId}` paths actually model a campaign** (`google-upsert-campaign`, `google-get-campaign-by-id`, `CampaignDTO`) — named `ghl_ad_google_campaign_*` to match the documented resource semantics/operationId rather than the literal path segment, which would be misleading (`ghl_ad_google_ad_upsert` would suggest ad-creative-level control that doesn't exist for Google here).
- **LinkedIn's ad-level endpoints are "campaign group"** in their own operationIds (`li-upsert-campaign-group`, `li-get-campaign-group`, `li-publish-campaign-group`) — kept that resource name (`ghl_ad_li_campaign_group_*`). LinkedIn's actual per-ad on/off toggle is the separate `PATCH /ad-publishing/linkedin/{adId}/status` endpoint, named `ghl_ad_li_ad_status_update`.
- **Affiliate-manager:** `get-affiliate`/`list-affiliates` already had clean names (`ghl_affiliate_get`, `ghl_affiliate_list`) — left untouched. `list-commissions`/`list-payouts` renamed to `ghl_affiliate_commission_list`/`ghl_affiliate_payout_list` for resource-first consistency with the other two and with the requested `ghl_affiliate_*` convention.

## Regression check

`cd ghl-mcp-server-v2 && npx tsc --noEmit` — clean, no errors.

## Summary

- 104 operations audited (5 spec files' worth reduces to 99 curated + 5 skip-exceptions).
- 5 exceptions: legacy ad-manager.json ops superseded by v3 twins (skip, not a data problem).
- 97 renames applied via `name` override; 2 affiliate-manager ops needed no override (already clean); 0 versionHeader/contentType/forceRequired/extraQueryParams overrides needed (all spot-checks confirmed generation already faithful to spec).
- Nothing surprising found beyond the two spec-documented required-param oddities noted in §6, which were deliberately left un-"fixed" since they weren't verified doc errors.
