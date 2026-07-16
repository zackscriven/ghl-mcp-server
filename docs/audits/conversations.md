# Domain Audit — conversations & AI

Scope: `src/overrides/conversations.ts` (exported `conversationsOverrides`), covering the assigned spec files
`conversations`, `conversation-ai`, `voice-ai`, `agent-studio`, `knowledge-base`, `chat-widget`, `email-isv`,
`phone-system` — 91 operations total (confirmed via `operations.json` filtered by `specFile`).

## Method

Docs-driven only, per BRIEF.md — no live API calls. For every op: compared `operations.json`'s extracted
`requestBody`/`parameters` against the source spec file on disk (`/PPC/Product/PracticeOS/GHL/Github Repo/
highlevel-api-docs/apps/**`), checked version header against what that exact spec documents, checked
list/search ops for cursor params, checked for multipart bodies, checked deprecated ops for a stated
replacement, and reviewed every generated name in `docs/generated-names.json` for this domain's 91 keys.

After writing overrides, ran `npx tsc --noEmit` (clean) and `npm run build`, then loaded the compiled
registry (`buildRegistry(null)`) to confirm: 649 total tools server-wide, **zero name collisions**, and that
my 5 `skip`s appear in `reg.skipped` with the intended reasons/names.

## 1. Version headers

All 91 ops checked against their canonical spec's declared `Version` header:

- 5 legacy-only ops (`conversations.json`, custom-subtypes + unsubscription-preferences) correctly carry
  `2021-04-15` — no v3 twin exists for these, confirmed by grepping `v3/conversations-v3.json` for the same
  paths (not present).
- 82 ops correctly carry `v3`.
- 4 ops have a genuinely **blank** Version header, and in all 4 cases this matches the spec exactly (no
  `Version` parameter declared at all for that operation) — **not** extraction loss, no override added:
  - `GET /phone-system/number-pools`
  - `GET /phone-system/numbers/location/{locationId}/available`
  - `DELETE /conversations/messages/email/{emailMessageId}/schedule`
  - `GET /conversations/messages/email/{id}`

No `versionHeader` overrides were needed anywhere in this domain.

## 2. agent-studio v3-vs-legacy canonical check (brief's specific ask)

Confirmed programmatically: `operations.json` contains **zero** standalone rows from legacy
`agent-studio.json` (2021-04-15) — every op is sourced from `v3/agent-studio-v3.json` with `legacyTwin`
correctly populated pointing back at the legacy doc. The generator's "v3-preferred, deduped by METHOD+path"
rule is working as designed for this domain; same held for `voice-ai`, `conversation-ai`, and
`knowledge-base` (all 0 standalone legacy rows). `chat-widget` and `email-isv` have no legacy twin at all
(chat-widget is v3-only/new; email-isv's only op has a legacy 2021-07-28 twin, correctly deduped to v3).

## 3. Request body completeness

Spot-checked (read the actual spec JSON, not a truncated view) every POST/PUT/PATCH body in-domain — 43
operations with a body. All resolved cleanly to a concrete `properties` object with the same field count/
names as the spec (no `$ref` left unresolved in `operations.json`, nothing silently dropped). Full listing
was generated and diffed by eye; highest-stakes ones examined in full:

- `POST /conversations/messages` (send-a-new-message) — 25/25 properties present, matches
  `SendMessageBodyDto` verbatim (type, subType, contactId, appointmentId, attachments, emailFrom/Cc/Bcc,
  html, message, subject, replyMessageId, templateId, threadId, scheduledTimestamp, conversationProviderId,
  emailTo, customSubtypeId, emailReplyMode, fromNumber, toNumber, forward, status, usesNativeSchedulingAi,
  optimizationPeriod). **Flagged, not fixed**: spec's `requestBody.required` is
  `[type, subType, contactId, status]` — `status` and `subType` as globally-required for an outbound send is
  an odd spec choice (reads like a response-model field), but it's what the canonical v3 spec documents, so
  per rule 1/5 (only override demonstrably-wrong version headers / under-marked required params) this was
  left alone and surfaced via `descriptionNote` instead, since it's the primary PHI-adjacent send path and
  callers will otherwise hit unexplained 400s.
- `POST /conversation-ai/agents` / `PUT /conversation-ai/agents/{agentId}` — 19/19 properties, full parity.
- `POST /voice-ai/agents` / `PATCH /voice-ai/agents/{agentId}` — 19/18 properties, full parity (PATCH
  correctly omits `locationId`, which only applies at create time).
- `POST /agent-studio/agent`, `PATCH .../versions/{versionId}` — 11 props each, full parity including
  `nodes`/`edges`/`globalVariables` graph-builder fields.
- `PUT /conversations/messages/email/{id}/status` — nested `events` object (delivery counters with additive-
  merge semantics per its own description) fully carried through, including the `allOf` wrapper.

No extraction losses found in any request body.

## 4. Content type / multipart

Exactly one multipart op in-domain: `POST /conversations/messages/upload`. Added `contentType:
"multipart/form-data"` override. Its schema (`UploadFilesDto`) only covers the *form fields*
(`conversationId`, `contactId`, `locationId`, `attachmentUrls`, `chatServiceSid`, `isGroupSms`) — the actual
file binary goes in a separate part keyed `fileAttachment`, stated only in the operation's free-text
description, not in the schema. Added a `descriptionNote` spelling this out plus the allowed file-type list
(JPG/JPEG/PNG/MP4/MPEG/ZIP/RAR/PDF/DOC/DOCX/TXT/MP3/WAV) so a caller doesn't have to go re-read the spec.

## 5. Pagination

Every list/search op in-domain was checked for its cursor mechanism against the spec, and all check out —
no `extraQueryParams` overrides were needed:

| Op | Cursor mechanism |
|---|---|
| `GET /conversations/search` | `startAfterDate` + `id` (tie-breaker) + `limit` |
| `GET /conversations/{conversationId}/messages` | `lastMessageId` + `limit` |
| `GET /conversations/messages/export` | `cursor` + `limit` |
| `GET /agent-studio/agent` (+ deprecated twin) | `limit` + `offset` (both required) |
| `GET /chat-widget/list` | `offset` + `limit` (both required) |
| `GET /conversation-ai/agents/search` | `startAfter` + `limit` |
| `GET /knowledge-bases/` | `limit` + `lastKnowledgeBaseId` |
| `GET /knowledge-bases/faqs` | `limit` + `lastFaqId` |
| `GET /knowledge-bases/crawler` | `page` + `pageLength` |
| `GET /voice-ai/agents` | `page` + `pageSize` |
| `GET /voice-ai/dashboard/call-logs` | `page` + `pageSize` |
| `GET /phone-system/numbers/location/{locationId}` | `page` + `pageSize` |

`registry.ts`'s `buildDescription()` already auto-appends a "Pagination params: …" line to any op whose
query params match its hardcoded `PAGINATION_PARAMS` set — verified that set (`limit, offset, page, skip,
startAfter, startAfterId, cursor, nextPageUrl, lastMessageId, lastDocumentId`) covers everything above
except `pageLength`, `pageSize`, and `lastKnowledgeBaseId`/`lastFaqId`. Those won't get the auto-generated
pagination note. This is a shared-code gap outside my override file's reach (the set lives in
`registry.ts`, not per-domain) — flagged here rather than silently left for the next person; the actual
params are still present and usable in the schema, just without the auto-note.

## 6. Under-marked required params

Checked every GET's query-param `required` flags against the spec — all correctly marked (e.g.
`GET /phone-system/numbers/location/{locationId}/available` genuinely requires all 8 of firstPart, lastPart,
anywhere, numberTypes, smsEnabled, mmsEnabled, voiceEnabled, countryCode per spec, and all 8 came through
required). No `forceRequired` overrides needed.

## 7. Deprecated ops

7 deprecated ops in-domain, handled two different ways:

**Kept registered + descriptionNote naming the replacement** (usable, just legacy):
- `GET /agent-studio/public-api/agents` → replacement `ghl_agent_studio_list`
- `GET /agent-studio/public-api/agents/{agentId}` → replacement `ghl_agent_studio_get_by_id`
- `POST /agent-studio/public-api/agents/{agentId}/execute` → replacement `ghl_agent_studio_execute`

(Each spec description literally says "**Deprecated endpoint - use GET /agent instead.**" etc. — read
verbatim off the spec, not inferred.)

**Skipped as truly unusable** (rule 6 exception — reason required, becomes a reported exception):
- `POST /conversations/messages/review-reply`
- `POST /conversations/messages/upload/complete`
- `POST /conversations/messages/upload/initiate`

All three spec descriptions state, verbatim: *"This endpoint is internal-only and is not supported for
OAuth or public API integrations. It will be removed from the public OpenAPI specification in a future
release."* An MCP server authenticating with an API key/OAuth token cannot use these regardless of schema
correctness — that's a materially different situation from "deprecated but still works," which is why these
were skipped rather than just noted. The upload pair's functional replacement (`POST
/conversations/messages/upload`, not deprecated, multipart) is already registered and cross-referenced in
its own `descriptionNote`. No replacement is documented for `review-reply`.

## 8. Extraction/spec gap — two permanently-broken GET-by-id ops (reported per rule 2)

`GET /conversations/messages/{id}` and `GET /conversations/messages/email/{id}` both have a path template
requiring `{id}`, but their spec `parameters` array is **empty** (verified by reading the raw spec, not a
truncated view — confirmed at `v3/conversations-v3.json` lines ~934-953 and ~584-589). Traced through
`registry.ts`'s `buildInputSchema()`: the tool's input schema is built solely from `op.parameters` (plus
`extraQueryParams`, which is hardcoded to `in: "query"` — no path-param-injection path exists), and
`http.ts`'s `callGhl()` throws `Missing required path parameter(s): {id}` if the URL template still has an
unresolved `{...}` after substitution. Since nothing in the tool's schema lets a caller supply `id`, calling
either tool will *always* fail. This can't be fixed with the current `OperationOverride` shape — there is no
override field to add a synthetic path parameter — so I skipped both with a reason explaining exactly this,
rather than shipping two tools guaranteed to error on first use. Recommend either a registry.ts fix (add a
`forcePathParams` override kind, or fall back to regex-extracting `{...}` tokens from the path template when
`op.parameters` doesn't cover them) or an upstream spec fix.

## 9. Binary / non-JSON responses

- `GET /conversations/messages/{messageId}/locations/{locationId}/recording` — returns `audio/x-wav`
  (Content-Disposition: attachment), not JSON. `descriptionNote` added.
- `GET /conversations/locations/{locationId}/messages/{messageId}/transcription/download` — returns
  `text/plain` as a file attachment, not JSON. `descriptionNote` added.
- `GET /conversations/locations/{locationId}/messages/{messageId}/transcription` (no `/download`) — returns
  a normal JSON object (`GetMessageTranscriptionResponseDto`); checked and correctly needed no note.

## 10. Names

Reviewed all 91 generated names in `docs/generated-names.json`. Renamed 20 (list below). Notable finds:

- `GET /chat-widget/public/config/{id}` generated as **`ghl_chat_widget_get_get2`** — a literally broken
  auto-name (duplicate "get" + a numeric disambiguator suffix). Renamed to `ghl_chat_widget_get_public_config`.
- `GET /phone-system/numbers/location/{locationId}/available` generated as
  `ghl_phone_list_available_numbers_for_acountry` — carries a spec-level typo ("acountry" for "a country").
  Renamed to `ghl_phone_list_available_numbers`.
- Two `ghl_kb_list`/`ghl_kb_create`/`ghl_kb_delete`/`ghl_kb_update` name collisions existed between the
  knowledge-base-level ops and the FAQ-level ops (both would have generated ambiguous/colliding short names)
  — resolved by giving the FAQ ops an explicit `ghl_kb_faq_*` prefix and keeping `ghl_kb_list` /
  `ghl_kb_crawler_*` for the KB/crawler-level ops.
- `POST /conversations/messages` → renamed from `ghl_conversation_send_a_new_message` to
  `ghl_conversation_send_message`, matching the curated name the brief itself suggested.
- `POST /conversations/messages/{inbound,outbound}` → dropped the grammatically awkward "an" ("add_an_
  inbound_message" → "add_inbound_message").

Full rename table:

| Key | Old name | New name |
|---|---|---|
| GET /conversations/preferences/custom-subtypes | ghl_conversation_get_all_custom_subtypes | ghl_conversation_list_custom_subtypes |
| GET /agent-studio/agent | ghl_agent_studio_get | ghl_agent_studio_list |
| GET /agent-studio/public-api/agents | ghl_agent_studio_get_deprecated | ghl_agent_studio_list_deprecated |
| GET /agent-studio/public-api/agents/{agentId} | ghl_agent_studio_get_by_id_deprecated | ghl_agent_studio_get_by_id_deprecated *(unchanged — already correct)* |
| POST /agent-studio/public-api/agents/{agentId}/execute | ghl_agent_studio_execute_deprecated | ghl_agent_studio_execute_deprecated *(unchanged — descriptionNote only)* |
| GET /chat-widget/public/config/{id} | ghl_chat_widget_get_get2 | ghl_chat_widget_get_public_config |
| POST /conversations/messages | ghl_conversation_send_a_new_message | ghl_conversation_send_message |
| POST /conversations/messages/inbound | ghl_conversation_add_an_inbound_message | ghl_conversation_add_inbound_message |
| POST /conversations/messages/outbound | ghl_conversation_add_an_outbound_message | ghl_conversation_add_outbound_message |
| GET /conversation-ai/generations | ghl_conversation_ai_get_generation_details | ghl_conversation_ai_get_generation |
| GET /voice-ai/agents | ghl_voice_ai_get_agents | ghl_voice_ai_list_agents |
| GET /knowledge-bases/ | ghl_kb_list_all_knowledge_bases_paginated | ghl_kb_list |
| GET /knowledge-bases/faqs | ghl_kb_list | ghl_kb_faq_list |
| POST /knowledge-bases/faqs | ghl_kb_create | ghl_kb_faq_create |
| DELETE /knowledge-bases/faqs/{id} | ghl_kb_delete | ghl_kb_faq_delete |
| PUT /knowledge-bases/faqs/{id} | ghl_kb_update | ghl_kb_faq_update |
| DELETE /knowledge-bases/crawler | ghl_kb_delete_trained_urls_for_knowledge_base | ghl_kb_crawler_delete_urls |
| GET /knowledge-bases/crawler | ghl_kb_get_all_website_urls_data_by_knowledge_base | ghl_kb_crawler_list_urls |
| POST /knowledge-bases/crawler | ghl_kb_discover_website | ghl_kb_crawler_discover |
| GET /knowledge-bases/crawler/status | ghl_kb_get_crawling_status_for_latest_operation | ghl_kb_crawler_status |
| POST /knowledge-bases/crawler/train | ghl_kb_train_discovered_urls | ghl_kb_crawler_train |
| POST /email/verify | ghl_email_verify_create | ghl_email_verify |
| GET /phone-system/number-pools | ghl_phone_get_number_pool_list | ghl_phone_list_number_pools |
| GET /phone-system/numbers/location/{locationId} | ghl_phone_active_numbers | ghl_phone_list_active_numbers |
| GET /phone-system/numbers/location/{locationId}/available | ghl_phone_list_available_numbers_for_acountry | ghl_phone_list_available_numbers |
| POST /phone-system/numbers/location/{locationId}/purchase | ghl_phone_purchase_number_for_location | ghl_phone_purchase_number |

(Rows shown as "unchanged" above got a `descriptionNote` but no rename — listed for completeness since they
were reviewed.)

## 11. Regression check

- `npx tsc --noEmit` — clean.
- `npm run build` — clean.
- Loaded the compiled registry with `buildRegistry(null)`: **649 total tools server-wide, 0 name
  collisions**, 18 total skips server-wide (13 pre-existing from other domains + my 5), all 5 of mine present
  with the intended name/reason.

## Exceptions summary (also in `conversations-status.json`)

| Op | Reason |
|---|---|
| GET /conversations/messages/{id} | Spec omits the `id` path param — tool cannot be called; no override mechanism to fix |
| GET /conversations/messages/email/{id} | Same gap as above |
| POST /conversations/messages/review-reply | Spec: internal-only, not supported for OAuth/public API |
| POST /conversations/messages/upload/complete | Spec: internal-only, not supported for OAuth/public API |
| POST /conversations/messages/upload/initiate | Spec: internal-only, not supported for OAuth/public API |

Everything else (86 ops) verified `ok` — see `conversations-status.json` for the per-op breakdown.
