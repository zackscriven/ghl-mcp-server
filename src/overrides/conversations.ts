/** Curated overrides for the conversations domain — populated by the domain audit. */
import type { DomainOverrides } from "../types.js";

export const conversationsOverrides: DomainOverrides = {
  domain: "conversations",
  notes: [
    "Domain audit covers conversations, conversation-ai, voice-ai, agent-studio, knowledge-base, chat-widget, email-isv, phone-system (91 ops).",
    "Body completeness: spot-checked every POST/PUT/PATCH requestBody in-domain against its spec source — all properties extracted verbatim, no unresolved $refs, no dropped fields.",
    "agent-studio: confirmed generation already prefers the v3 tier for every non-deprecated op (legacy agent-studio.json 2021-04-15 contributes 0 standalone rows to operations.json — fully deduped into the v3 twin as designed).",
    "Pagination: all list/search ops in-domain expose their real cursor params (limit/offset, page/pageSize, lastFaqId, lastKnowledgeBaseId, lastMessageId, startAfterDate+id, cursor) — nothing under-documented found; no extraQueryParams needed.",
    "EXTRACTION/SPEC GAP (reported, not fixable via override): GET /conversations/messages/{id} and GET /conversations/messages/email/{id} both declare a `parameters` array in the official spec that omits the `id` path parameter entirely, even though the path template requires it. The override API has no mechanism to inject a missing path parameter (extraQueryParams only adds `in: query`), so these two ops are unusable as generated — every call fails at request time with 'Missing required path parameter(s): id'. Skipped both with a reason pointing back here; recommend a registry.ts-level fix (or an upstream spec fix) to properly re-enable them.",
    "GET /phone-system/number-pools and GET /phone-system/numbers/location/{locationId}/available have a genuinely blank Version header in the spec (no Version parameter declared at all) — left as-is per rule 1, this is not extraction loss, it's what the spec documents.",
    "Multipart: POST /conversations/messages/upload is the only multipart/form-data op in-domain. Its schema (UploadFilesDto) only carries the form fields (conversationId, contactId, locationId, attachmentUrls, chatServiceSid, isGroupSms) — the actual file binary goes in a separate form part keyed `fileAttachment`, per the operation description, which is NOT represented in the schema. Added contentType override + descriptionNote explaining this.",
    "Deprecated-but-usable ops kept registered with descriptionNote naming the documented replacement: the 3 agent-studio /public-api/agents* legacy endpoints each explicitly say 'use GET /agent[/:agentId][/execute] instead' in their spec description.",
    "Skipped as truly unusable (not registry-fixable, spec explicitly disclaims support): POST /conversations/messages/review-reply, POST /conversations/messages/upload/complete, POST /conversations/messages/upload/initiate — all three spec descriptions state verbatim 'This endpoint is internal-only and is not supported for OAuth or public API integrations. It will be removed from the public OpenAPI specification in a future release.' An MCP server calling with an API-key/OAuth token cannot use these; the non-deprecated POST /conversations/messages/upload already covers the functional file-upload need.",
    "Binary/non-JSON responses: GET /conversations/messages/{messageId}/locations/{locationId}/recording returns audio/x-wav (not JSON) and GET /conversations/locations/{locationId}/messages/{messageId}/transcription/download returns text/plain as a file attachment (not JSON) — both spec'd via response `headers` (Content-Type/Content-Disposition) rather than a `content` schema. Added descriptionNote on each. GET .../transcription (no /download) DOES return normal JSON and needed no note.",
    "POST /conversations/messages (send-a-new-message): SUPERSEDED 2026-08-26 — the earlier stance ('spec says [type, subType, contactId, status] required, not overridden') proved untenable: `subType` is emitted as an empty object schema, so passing a string failed client-side validation and passing {} passed validation but the live API 422'd ('subType must be a valid enum value', CONVERSATIONS_VALIDATION_ERROR). Every code path was dead. Now fixed via patchBody override (subType/status optional strings, required [type, contactId]) — the first use of the patchBody mechanism added to types.ts/registry.ts the same day.",
    "Regression scan 2026-08-26 (empty-object-schema-with-scalar-example pattern): within the conversations spec, POST /conversations/messages is the ONLY occurrence — inbound/outbound (add_inbound_message/add_outbound_message) declare no subType field at all. The same upstream pattern DOES exist in other domains' specs (contacts dateOfBirth, associations labels/keys, opportunities.upsert monetaryValue, products review status, social postType/type, phone purchase numberType, social queue status) — candidates for the same patchBody treatment in their own domain audits, not patched from here.",
    "Naming: renamed ~20 awkward/ambiguous/duplicate-looking auto-generated names in this domain (see overrides below) — notably GET /chat-widget/public/config/{id} was generated as the literally broken 'ghl_chat_widget_get_get2', and GET /phone-system/numbers/location/{locationId}/available carried a typo ('acountry').",
    "GET /chat-widget/public/config/{id} has no `security` block in the spec (unlike every sibling chat-widget op) — appears to be the intentionally public/unauthenticated widget-embed config fetch. Noted via descriptionNote; left registered since a valid API key still works against it.",
  ],
  overrides: {
    "GET /conversations/preferences/custom-subtypes": {
      name: "ghl_conversation_list_custom_subtypes",
    },
    "GET /agent-studio/agent": {
      name: "ghl_agent_studio_list",
      descriptionNote: "Lists agents (paginated via limit/offset) — not a get-by-id lookup.",
    },
    "GET /agent-studio/public-api/agents": {
      name: "ghl_agent_studio_list_deprecated",
      descriptionNote: "Deprecated per official spec — use ghl_agent_studio_list (GET /agent-studio/agent) instead.",
    },
    "GET /agent-studio/public-api/agents/{agentId}": {
      name: "ghl_agent_studio_get_by_id_deprecated",
      descriptionNote: "Deprecated per official spec — use ghl_agent_studio_get_by_id (GET /agent-studio/agent/{agentId}) instead.",
    },
    "POST /agent-studio/public-api/agents/{agentId}/execute": {
      name: "ghl_agent_studio_execute_deprecated",
      descriptionNote: "Deprecated per official spec — use ghl_agent_studio_execute (POST /agent-studio/agent/{agentId}/execute) instead.",
    },
    "GET /chat-widget/public/config/{id}": {
      name: "ghl_chat_widget_get_public_config",
      descriptionNote: "Auto-generated name collided with another chat-widget tool (rendered as 'ghl_chat_widget_get_get2') — renamed. This is the public widget-embed config fetch; the spec declares no security/auth requirement for it, unlike other chat-widget ops.",
    },
    "GET /conversations/messages/{id}": {
      name: "ghl_conversation_get_message",
      descriptionNote: "Note: the official spec omits the `id` path-parameter declaration; this server infers it from the URL template (registry.ts fallback added 2026-07-16), so `id` (the message ID) is a required argument here despite the spec gap.",
    },
    "GET /conversations/messages/email/{id}": {
      name: "ghl_conversation_get_email_message",
      descriptionNote: "Note: the official spec omits the `id` path-parameter declaration; this server infers it from the URL template (registry.ts fallback added 2026-07-16), so `id` (the email message ID) is a required argument here despite the spec gap.",
    },
    "POST /conversations/messages": {
      name: "ghl_conversation_send_message",
      descriptionNote:
        "PHI-adjacent: sends a message on a real conversation thread. " +
        "DELIBERATE OVERRIDE of the broken upstream spec (2026-08-26): the official conversations-v3.json declares `subType` as an empty object schema (the live API validates it as a string enum, so `{}` 422s with 'subType must be a valid enum value') and marks [type, subType, contactId, status] as required (forcing subType/status is what makes every call fail — a plain SMS needs only type + contactId + message). " +
        "This tool therefore requires only `type` and `contactId`; `subType` and `status` are optional strings and are OMITTED from the outbound request entirely when not supplied (the API validates the key if present). The spec enumerates no valid subType values — pass one only if you know it from GHL docs. " +
        "Populate type-appropriate fields alongside: message (+ fromNumber/toNumber) for SMS-style channels; html/subject/emailTo/emailCc for Email; attachments as URLs. " +
        "If the spec extractor is re-run, keep this patchBody override — do not let regeneration silently restore the broken schema.",
      patchBody: {
        properties: {
          subType: {
            type: "string",
            description:
              "Message sub-type. OPTIONAL — omit for normal sends. The official spec declares this as an empty object schema and enumerates no valid values (spec gap); the live API validates it as a string enum when the key is present, so only pass a value you know to be valid.",
          },
          status: {
            type: "string",
            enum: ["delivered", "failed", "pending", "read"],
            description:
              "Message status. OPTIONAL — reads like a response/inbound-recording field; do not set on a normal outbound send.",
          },
        },
        required: ["type", "contactId"],
        note:
          "2026-08-26: upstream spec bug — subType emitted as empty object schema (string enum in the live API) and subType/status wrongly required, which 422'd every send (CONVERSATIONS_VALIDATION_ERROR). Made both optional strings, required now [type, contactId]. Omitted-when-absent is free: http.ts serializes args.body verbatim.",
      },
    },
    "POST /conversations/messages/upload": {
      contentType: "multipart/form-data",
      descriptionNote: "multipart/form-data upload. The `body` schema below carries only the declared form fields (conversationId, contactId, locationId, attachmentUrls, chatServiceSid, isGroupSms) from UploadFilesDto — per the endpoint description, each file's binary content must ALSO be attached as a separate multipart part keyed `fileAttachment` (buffer), which is not represented in the JSON schema. Allowed file types per spec: JPG, JPEG, PNG, MP4, MPEG, ZIP, RAR, PDF, DOC, DOCX, TXT, MP3, WAV.",
    },
    "POST /conversations/messages/upload/complete": {
      skip: {
        reason: "Spec description states verbatim: 'This endpoint is internal-only and is not supported for OAuth or public API integrations. It will be removed from the public OpenAPI specification in a future release.' Unusable by an API-key/OAuth-authenticated MCP server. Functional replacement for file uploads: POST /conversations/messages/upload (ghl_conversation_upload_file_attachments), which is not deprecated.",
      },
    },
    "POST /conversations/messages/upload/initiate": {
      skip: {
        reason: "Same internal-only/no-OAuth-support disclaimer as POST /conversations/messages/upload/complete (part of the same 2-step GCS signed-URL flow). Unusable by an API-key/OAuth-authenticated MCP server. Functional replacement: POST /conversations/messages/upload (ghl_conversation_upload_file_attachments).",
      },
    },
    "POST /conversations/messages/review-reply": {
      skip: {
        reason: "Spec description states verbatim: 'This endpoint is internal-only and is not supported for OAuth or public API integrations. It will be removed from the public OpenAPI specification in a future release.' Unusable by an API-key/OAuth-authenticated MCP server; no alternative public endpoint is documented for Google-review replies.",
      },
    },
    "POST /conversations/messages/inbound": {
      name: "ghl_conversation_add_inbound_message",
    },
    "POST /conversations/messages/outbound": {
      name: "ghl_conversation_add_outbound_message",
    },
    "GET /conversations/messages/{messageId}/locations/{locationId}/recording": {
      descriptionNote: "Response is NOT JSON — returns the raw recording as audio/x-wav (Content-Disposition: attachment; filename=audio.wav) per the spec's response headers. Callers must handle a binary/audio body, not a parsed JSON object.",
    },
    "GET /conversations/locations/{locationId}/messages/{messageId}/transcription/download": {
      descriptionNote: "Response is NOT JSON — returns the transcription as a text/plain file download (Content-Disposition: attachment; filename=\"transcription.txt\") per the spec's response headers, distinct from GET .../transcription (no /download) which returns a normal JSON object.",
    },
    "PUT /conversations/messages/{messageId}/attachments": {
      descriptionNote: "Replaces/adds attachments (URLs) on an existing message — separate from POST /conversations/messages/upload, which is the file-binary upload step that produces those URLs.",
    },
    "GET /conversation-ai/generations": {
      name: "ghl_conversation_ai_get_generation",
    },
    "GET /voice-ai/agents": {
      name: "ghl_voice_ai_list_agents",
    },
    "GET /knowledge-bases/": {
      name: "ghl_kb_list",
      descriptionNote: "Lists knowledge bases for a location (paginated via limit/lastKnowledgeBaseId) — distinct from ghl_kb_faq_list, which lists FAQ entries inside one knowledge base.",
    },
    "GET /knowledge-bases/faqs": {
      name: "ghl_kb_faq_list",
    },
    "POST /knowledge-bases/faqs": {
      name: "ghl_kb_faq_create",
    },
    "DELETE /knowledge-bases/faqs/{id}": {
      name: "ghl_kb_faq_delete",
    },
    "PUT /knowledge-bases/faqs/{id}": {
      name: "ghl_kb_faq_update",
    },
    "DELETE /knowledge-bases/crawler": {
      name: "ghl_kb_crawler_delete_urls",
    },
    "GET /knowledge-bases/crawler": {
      name: "ghl_kb_crawler_list_urls",
    },
    "POST /knowledge-bases/crawler": {
      name: "ghl_kb_crawler_discover",
    },
    "GET /knowledge-bases/crawler/status": {
      name: "ghl_kb_crawler_status",
    },
    "POST /knowledge-bases/crawler/train": {
      name: "ghl_kb_crawler_train",
    },
    "POST /email/verify": {
      name: "ghl_email_verify",
    },
    "GET /phone-system/number-pools": {
      name: "ghl_phone_list_number_pools",
      descriptionNote: "Spec declares no Version header for this endpoint (verified against the official spec, not an extraction gap) — the tool omits it accordingly.",
    },
    "GET /phone-system/numbers/location/{locationId}": {
      name: "ghl_phone_list_active_numbers",
    },
    "GET /phone-system/numbers/location/{locationId}/available": {
      name: "ghl_phone_list_available_numbers",
      descriptionNote: "Renamed — the auto-generated name carried a spec typo ('acountry'). Spec also declares no Version header for this endpoint (verified, not an extraction gap).",
    },
    "POST /phone-system/numbers/location/{locationId}/purchase": {
      name: "ghl_phone_purchase_number",
    },
  },
};
