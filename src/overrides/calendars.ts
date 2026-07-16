/** Curated overrides for the calendars domain — populated by the domain audit. */
import type { DomainOverrides } from "../types.js";

export const calendarsOverrides: DomainOverrides = {
  domain: "calendars",
  notes: [
    "Calendar Resources (rooms/equipment): the deduper picked the v3-tier row for all 5 " +
      "GET/POST/PUT/DELETE /calendars/resources/... operations, but v3/calendars-v3.json marks " +
      "that v3-tier variant `deprecated: true` with description suffix '(Services V1)' and a " +
      "Version enum of ['v3']. The non-deprecated, currently-documented variant lives in the " +
      "legacy apps/calendars.json with Version enum ['2021-04-15'] (recorded in each op's " +
      "`legacyTwin`). Request-body field sets are identical between the two variants (verified " +
      "field-by-field), so this is purely a Version-header defect from the dedup rule blindly " +
      "preferring 'v3 tier' without checking the deprecated flag. Overrode versionHeader back to " +
      "2021-04-15 for all 5 ops and added descriptionNote flagging the deprecated v3 alternative.",
    "Free-slots date params (GET /calendars/{calendarId}/free-slots): startDate/endDate are typed " +
      "`number` with epoch-millisecond examples (e.g. 1548898600000) but the spec description only " +
      "says 'Date range cannot be more than 31 days' — no explicit unit callout, unlike the sibling " +
      "startTime/endTime params elsewhere in this domain which say '(in millis)' outright. Added a " +
      "descriptionNote to remove the ambiguity implied by the 'Date' naming.",
    "Request-body completeness spot-checks: PUT /calendars/{calendarId} (52/52 properties), " +
      "POST /calendars/events/appointments and PUT /calendars/events/appointments/{eventId} (17/17 " +
      "and 16/16 properties incl. required arrays), and PUT /calendars/resources/{resourceType}/{id} " +
      "all matched the spec exactly — no extraction loss found anywhere in this domain.",
    "Pagination: services/bookings, services/catalog, and services/locations list endpoints have no " +
      "limit/offset/skip params in the spec. Verified against the docs corpus (ghl_docs_context) — " +
      "this is by design (bookings are bounded by the required startTime/endTime range; catalog and " +
      "location lists are small per-location collections), not an extraction gap. No " +
      "extraQueryParams added.",
    "No multipart/form-data or other non-JSON content types found anywhere in this domain — all " +
      "requestBody content types are application/json.",
    "Renamed most operations from the mechanical `ghl_calendar_<verb>_<summary>` generator output to " +
      "a consistent `ghl_calendar_<subresource>_<action>` scheme so calendars vs groups vs events vs " +
      "appointments vs notes vs resources vs schedules vs services are unambiguous at a glance. This " +
      "also eliminates the generator's numeric disambiguation suffixes (get_get2, update_schedule_put2, " +
      "create_schedule_post2) that appeared where multiple ops shared a summary.",
    "PUT /calendars/groups/{groupId}/status has operationId/summary 'disable-group' but its body " +
      "(GroupStatusUpdateParams) is a required boolean `isActive`, so it toggles both directions. " +
      "Renamed to ghl_calendar_group_update_status and added a descriptionNote clarifying it also " +
      "re-enables a group when isActive=true.",
  ],
  overrides: {
    // ---- Calendars (core CRUD) ----
    "GET /calendars/": { name: "ghl_calendar_list" },
    "POST /calendars/": { name: "ghl_calendar_create" },
    "GET /calendars/{calendarId}": { name: "ghl_calendar_get" },
    "PUT /calendars/{calendarId}": { name: "ghl_calendar_update" },
    "DELETE /calendars/{calendarId}": { name: "ghl_calendar_delete" },

    // ---- Free slots / blocked slots (availability) ----
    "GET /calendars/{calendarId}/free-slots": {
      name: "ghl_calendar_list_free_slots",
      descriptionNote:
        "startDate/endDate are epoch milliseconds (a number, e.g. 1548898600000), NOT an ISO date " +
        "string, despite the parameter name. Date range cannot exceed 31 days.",
    },
    "GET /calendars/blocked-slots": {
      name: "ghl_calendar_list_blocked_slots",
      descriptionNote: "startTime/endTime are epoch milliseconds passed as strings.",
    },

    // ---- Calendar notifications (per-calendar notification config) ----
    "GET /calendars/{calendarId}/notifications": { name: "ghl_calendar_notification_list" },
    "POST /calendars/{calendarId}/notifications": { name: "ghl_calendar_notification_create" },
    "GET /calendars/{calendarId}/notifications/{notificationId}": {
      name: "ghl_calendar_notification_get",
    },
    "PUT /calendars/{calendarId}/notifications/{notificationId}": {
      name: "ghl_calendar_notification_update",
    },
    "DELETE /calendars/{calendarId}/notifications/{notificationId}": {
      name: "ghl_calendar_notification_delete",
    },

    // ---- Calendar groups ----
    "GET /calendars/groups": { name: "ghl_calendar_group_list" },
    "POST /calendars/groups": { name: "ghl_calendar_group_create" },
    "PUT /calendars/groups/{groupId}": { name: "ghl_calendar_group_update" },
    "DELETE /calendars/groups/{groupId}": { name: "ghl_calendar_group_delete" },
    "PUT /calendars/groups/{groupId}/status": {
      name: "ghl_calendar_group_update_status",
      descriptionNote:
        "Despite the underlying 'disable-group' operation name, the required body field isActive " +
        "(boolean) toggles both directions — set isActive:true to re-enable the group.",
    },
    "POST /calendars/groups/validate-slug": { name: "ghl_calendar_group_validate_slug" },

    // ---- Events (calendar events list + generic event delete) ----
    "GET /calendars/events": { name: "ghl_calendar_event_list" },
    "DELETE /calendars/events/{eventId}": {
      name: "ghl_calendar_event_delete",
      descriptionNote:
        "Deletes any calendar event by ID (appointment or block-slot). Use ghl_calendar_appointment_* " +
        "or ghl_calendar_block_slot_* for type-specific create/get/update.",
    },

    // ---- Appointments ----
    "POST /calendars/events/appointments": { name: "ghl_calendar_appointment_create" },
    "GET /calendars/events/appointments/{eventId}": { name: "ghl_calendar_appointment_get" },
    "PUT /calendars/events/appointments/{eventId}": { name: "ghl_calendar_appointment_update" },

    // ---- Block slots ----
    "POST /calendars/events/block-slots": { name: "ghl_calendar_block_slot_create" },
    "PUT /calendars/events/block-slots/{eventId}": { name: "ghl_calendar_block_slot_update" },

    // ---- Appointment notes ----
    "GET /calendars/appointments/{appointmentId}/notes": { name: "ghl_calendar_appointment_note_list" },
    "POST /calendars/appointments/{appointmentId}/notes": { name: "ghl_calendar_appointment_note_create" },
    "PUT /calendars/appointments/{appointmentId}/notes/{noteId}": {
      name: "ghl_calendar_appointment_note_update",
    },
    "DELETE /calendars/appointments/{appointmentId}/notes/{noteId}": {
      name: "ghl_calendar_appointment_note_delete",
    },

    // ---- Calendar resources (rooms & equipment) — version-header fix, see notes[] ----
    "GET /calendars/resources/{resourceType}": {
      name: "ghl_calendar_resource_list",
      versionHeader: "2021-04-15",
      descriptionNote:
        "Uses the currently-documented (non-deprecated) Calendar Resources version, 2021-04-15. " +
        "The v3-tagged variant of this operation in the v3 spec is marked deprecated (Services V1) " +
        "with identical request/response fields — do not use Version: v3 for resource endpoints.",
    },
    "POST /calendars/resources/{resourceType}": {
      name: "ghl_calendar_resource_create",
      versionHeader: "2021-04-15",
      descriptionNote:
        "Uses the currently-documented (non-deprecated) Calendar Resources version, 2021-04-15. " +
        "The v3-tagged variant of this operation in the v3 spec is marked deprecated (Services V1) " +
        "with identical request/response fields — do not use Version: v3 for resource endpoints.",
    },
    "GET /calendars/resources/{resourceType}/{id}": {
      name: "ghl_calendar_resource_get",
      versionHeader: "2021-04-15",
      descriptionNote:
        "Uses the currently-documented (non-deprecated) Calendar Resources version, 2021-04-15. " +
        "The v3-tagged variant of this operation in the v3 spec is marked deprecated (Services V1) " +
        "with identical request/response fields — do not use Version: v3 for resource endpoints.",
    },
    "PUT /calendars/resources/{resourceType}/{id}": {
      name: "ghl_calendar_resource_update",
      versionHeader: "2021-04-15",
      descriptionNote:
        "Uses the currently-documented (non-deprecated) Calendar Resources version, 2021-04-15. " +
        "The v3-tagged variant of this operation in the v3 spec is marked deprecated (Services V1) " +
        "with identical request/response fields — do not use Version: v3 for resource endpoints.",
    },
    "DELETE /calendars/resources/{resourceType}/{id}": {
      name: "ghl_calendar_resource_delete",
      versionHeader: "2021-04-15",
      descriptionNote:
        "Uses the currently-documented (non-deprecated) Calendar Resources version, 2021-04-15. " +
        "The v3-tagged variant of this operation in the v3 spec is marked deprecated (Services V1) " +
        "with identical request/response fields — do not use Version: v3 for resource endpoints.",
    },

    // ---- User availability schedules (not tied to one calendar) ----
    "GET /calendars/schedules/search": { name: "ghl_calendar_schedule_list" },
    "POST /calendars/schedules": { name: "ghl_calendar_schedule_create" },
    "GET /calendars/schedules/{id}": { name: "ghl_calendar_schedule_get" },
    "PUT /calendars/schedules/{id}": { name: "ghl_calendar_schedule_update" },
    "DELETE /calendars/schedules/{id}": { name: "ghl_calendar_schedule_delete" },
    "PUT /calendars/schedules/{id}/associations/{calendarId}": {
      name: "ghl_calendar_schedule_assign",
      descriptionNote: "Applies an existing user availability schedule to the given calendar.",
    },
    "DELETE /calendars/schedules/{id}/associations/{calendarId}": {
      name: "ghl_calendar_schedule_unassign",
      descriptionNote: "Removes a user availability schedule association from the given calendar.",
    },

    // ---- Event-calendar-specific availability schedule ----
    "GET /calendars/schedules/event-calendar/{calendarId}": { name: "ghl_calendar_event_schedule_get" },
    "POST /calendars/schedules/event-calendar/{calendarId}": { name: "ghl_calendar_event_schedule_create" },
    "PUT /calendars/schedules/event-calendar/{calendarId}": { name: "ghl_calendar_event_schedule_update" },

    // ---- Services catalog ----
    "GET /calendars/services/catalog": { name: "ghl_calendar_service_list" },
    "POST /calendars/services/catalog": { name: "ghl_calendar_service_create" },
    "GET /calendars/services/catalog/{serviceId}": { name: "ghl_calendar_service_get" },
    "PUT /calendars/services/catalog/{serviceId}": { name: "ghl_calendar_service_update" },
    "DELETE /calendars/services/catalog/{serviceId}": { name: "ghl_calendar_service_delete" },

    // ---- Service locations ----
    "GET /calendars/services/locations": { name: "ghl_calendar_service_location_list" },
    "POST /calendars/services/locations": { name: "ghl_calendar_service_location_create" },
    "GET /calendars/services/locations/{serviceLocationId}": { name: "ghl_calendar_service_location_get" },
    "PUT /calendars/services/locations/{serviceLocationId}": { name: "ghl_calendar_service_location_update" },
    "DELETE /calendars/services/locations/{serviceLocationId}": {
      name: "ghl_calendar_service_location_delete",
    },

    // ---- Service bookings ----
    "GET /calendars/services/bookings": {
      name: "ghl_calendar_service_booking_list",
      descriptionNote:
        "startTime/endTime are epoch milliseconds passed as strings. No limit/offset — results are " +
        "bounded by the required date range.",
    },
    "POST /calendars/services/bookings": { name: "ghl_calendar_service_booking_create" },
    "GET /calendars/services/bookings/{bookingId}": { name: "ghl_calendar_service_booking_get" },
    "PUT /calendars/services/bookings/{bookingId}": { name: "ghl_calendar_service_booking_update" },
    "DELETE /calendars/services/bookings/{bookingId}": { name: "ghl_calendar_service_booking_delete" },
  },
};
