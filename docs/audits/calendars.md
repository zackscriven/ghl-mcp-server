# Calendars domain audit

Scope: `src/overrides/calendars.ts` (`calendarsOverrides`). 59 operations, all sourced from
`apps/v3/calendars-v3.json` after dedup (calendars, calendar groups, events/appointments,
appointment notes, calendar resources — rooms/equipment, block slots, free slots, user/event
availability schedules, services catalog/locations/bookings).

## Method

- Pulled every operation whose `specFile` contains "calendar" out of `src/generated/operations.json`
  (59 rows, confirmed against `docs/generated-names.json`).
- Compared each row's `versionHeader`, `parameters`, and `requestBody` against the canonical spec
  files directly (`apps/calendars.json` legacy, `apps/v3/calendars-v3.json` v3), never from a
  truncated excerpt.
- Cross-checked ambiguous points (pagination presence, version-header conflicts) against the
  `mcp__ghl-docs__ghl_docs_context` corpus.
- `npx tsc --noEmit` run clean against the finished overrides file.

## Finding 1 (major): Calendar Resources version-header defect

The brief flagged this area for scrutiny, and it turned out to be a real bug in the generated
data. All 5 Calendar Resources operations (list/get/create/update/delete for rooms & equipment,
paths under `/calendars/resources/{resourceType}[/{id}]`) exist in **both** spec files:

- `apps/calendars.json` (legacy): `Version` header enum `["2021-04-15"]`, **not** deprecated,
  description e.g. "Get calendar resource by ID".
- `apps/v3/calendars-v3.json`: `Version` header enum `["v3"]`, **`deprecated: true`**, description
  suffixed "(Services V1)" e.g. "Get calendar resource by ID (Services V1)".

The generator's dedup rule prefers the "v3 tier" row unconditionally on METHOD+path match — it
picked the deprecated v3 variant and discarded the currently-documented legacy variant (though it
did preserve the legacy row's info in `legacyTwin`, which is how this was caught quickly).
Request-body property sets are byte-identical between the two variants (verified for
`PUT /calendars/resources/{resourceType}/{id}`: same 8 fields, same descriptions), so the fix is
purely a header swap plus a caution note — no body remediation needed.

**Fix applied:** `versionHeader: "2021-04-15"` override + `descriptionNote` on all 5 resource ops,
explaining the v3-tagged alternative is deprecated and to avoid `Version: v3` for these paths.
Names: `ghl_calendar_resource_{list,create,get,update,delete}`.

This is exactly the kind of "canonical (v3-preferred) row may carry the wrong header" case the
brief asked domain auditors to watch for — worth flagging to whoever owns the generator/dedup
logic, since the same "v3 tier picked over a non-deprecated legacy twin" pattern could exist in
other domains that also have Services-V1-era legacy/v3 spec pairs.

## Finding 2 (minor): free-slots date format ambiguity

`GET /calendars/{calendarId}/free-slots` has `startDate`/`endDate` query params typed `number` with
epoch-millisecond examples (`1548898600000`), but the spec description only says "Date range cannot
be more than 31 days" — no explicit unit. Contrast with `startTime`/`endTime` on
`/calendars/events`, `/calendars/blocked-slots`, and `/calendars/services/bookings`, which all say
"(in millis)" or "(timestamp in milliseconds as string)" explicitly. Given the param names literally
say "Date" (not "Time"), a caller could reasonably try an ISO date string and get a confusing
failure. Added a `descriptionNote` spelling out epoch-ms-as-number. Also added a lighter note on
`ghl_calendar_list_blocked_slots` and `ghl_calendar_service_booking_list` reiterating the millis
format for consistency, even though their spec text was already fairly clear.

## Finding 3: request-body completeness — clean

Spot-checked the highest-field-count and most-likely-to-truncate bodies field-by-field against the
spec directly:

- `PUT /calendars/{calendarId}` (Update Calendar) — 52/52 properties present, matching order and
  descriptions.
- `POST /calendars/events/appointments` — 17/17 properties, required array
  `[calendarId, locationId, contactId, startTime]` preserved exactly.
- `PUT /calendars/events/appointments/{eventId}` — 16/16 properties.
- `PUT /calendars/resources/{resourceType}/{id}` — 8/8 properties (used to confirm the two Version
  variants share one body shape, see Finding 1).

No extraction loss found anywhere in this domain.

## Finding 4: pagination — no gaps found

List endpoints checked for cursor/offset support:

- `GET /calendars/{calendarId}/notifications` — `limit`, `skip` (optional) — present.
- `GET /calendars/appointments/{appointmentId}/notes` — `limit`, `offset` (both **required** per
  spec) — present, honored as-is.
- `GET /calendars/resources/{resourceType}` — `limit`, `skip` (both required) — present.
- `GET /calendars/schedules/search` — `skip`, `limit` (optional) — present.
- `GET /calendars/services/bookings`, `GET /calendars/services/catalog`,
  `GET /calendars/services/locations` — **no** limit/offset/skip in the spec. Verified against the
  docs corpus (`ghl_docs_context`) rather than assuming: this is intentional design, not an
  extraction gap — bookings are bounded by the required `startTime`/`endTime` range, and
  catalog/location lists are small per-location collections. No `extraQueryParams` added.

## Finding 5: content types — clean

No `multipart/form-data` or other non-JSON request bodies anywhere in this domain; every
`requestBody.content` key is `application/json`. No `contentType` overrides needed.

## Finding 6: under-marked required params — none found

Every query/path param the docs corpus discusses as required was already marked `required: true`
in the extracted spec (e.g. resourceType/locationId/limit/skip on the resources list, the four
required appointment-create fields). No `forceRequired` overrides needed.

## Finding 7: deprecated ops

Only the 5 Calendar Resources ops are marked `deprecated: true` in the row the generator picked —
and that's the artifact described in Finding 1. Per the brief, deprecated ops stay registered; here
the fix (version-header override) makes them not-actually-deprecated anymore since the row now
points at the legacy, non-deprecated variant. No `skip` overrides used anywhere in this domain —
nothing was unusable.

## Renames (curation for name clarity)

Nearly every operation was renamed away from the generator's mechanical
`ghl_calendar_<verb>_<summary-derived-words>` output to a consistent
`ghl_calendar_<subresource>_<action>` scheme, grouped by subresource:

- Core calendar: `ghl_calendar_{list,create,get,update,delete}`
- Free/blocked slots: `ghl_calendar_list_free_slots`, `ghl_calendar_list_blocked_slots`
- Notifications (per-calendar config): `ghl_calendar_notification_{list,create,get,update,delete}`
- Groups: `ghl_calendar_group_{list,create,update,delete,update_status,validate_slug}`
- Events (generic): `ghl_calendar_event_list`, `ghl_calendar_event_delete`
- Appointments: `ghl_calendar_appointment_{create,get,update}`
- Block slots: `ghl_calendar_block_slot_{create,update}`
- Appointment notes: `ghl_calendar_appointment_note_{list,create,update,delete}`
- Resources (rooms/equipment): `ghl_calendar_resource_{list,create,get,update,delete}`
- User availability schedules: `ghl_calendar_schedule_{list,create,get,update,delete,assign,unassign}`
- Event-calendar schedules: `ghl_calendar_event_schedule_{get,create,update}`
- Services catalog: `ghl_calendar_service_{list,create,get,update,delete}`
- Service locations: `ghl_calendar_service_location_{list,create,get,update,delete}`
- Service bookings: `ghl_calendar_service_booking_{list,create,get,update,delete}`

This also eliminates three generator-side numeric disambiguation suffixes that existed because
multiple ops shared a summary/verb combination pre-curation: `ghl_calendar_get_get2` (→
`ghl_calendar_list`, for `GET /calendars/`), `ghl_calendar_update_schedule_put2` (→
`ghl_calendar_event_schedule_update`), and `ghl_calendar_create_schedule_post2` (→
`ghl_calendar_schedule_create`).

Verified no duplicate names within the domain (`grep -o 'name: "..."' | sort | uniq -d` — empty).
All names stay under 64 chars and keep the `ghl_calendar_` prefix, so they're guaranteed unique
server-wide per the brief's rule.

## Regression check

`cd ghl-mcp-server-v2 && npx tsc --noEmit` — clean, no errors, after the overrides file was fully
populated.

## Deliverables

- `src/overrides/calendars.ts` — populated, compiles clean.
- `docs/audits/calendars.md` — this file.
- `docs/audits/calendars-status.json` — all 59 operations; 7 rows marked `"exception"` (the 5
  Calendar Resources ops sharing the version-header-fix reason, plus the free-slots date-format
  note, plus the group-status clarification note); the remaining 52 are `"ok"`.
