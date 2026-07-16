# GHL MCP Server v2 — API Coverage Checklist (final)

Generated 2026-07-16T16:21:10.848Z; statuses finalized 2026-07-16 after the 8 domain audits + core fixes.

**667 unique operations** (deduped from 1203 raw across the legacy + v3 spec tiers; v3 spec variant canonical where both exist). 651 tools registered, 16 explicit exceptions (itemized below and inline). Legend: `[x]` implemented · `[E]` exception (not registered, reason given).


## A. Contacts & Object Model (60 operations)

| St | Tool name | Spec file | operationId | Method + path | Version | Note |
|----|-----------|-----------|-------------|---------------|---------|------|
| [x] | `ghl_contact_remove_from_all_campaigns_legacy` | contacts.json | remove-contact-from-every-campaign | `DELETE /contacts/{contactId}/campaigns/removeAll` | 2021-07-28 |  |
| [x] | `ghl_contact_list` | contacts.json | get-contacts | `GET /contacts/` | 2021-07-28 | DEPRECATED (registered, flagged) |
| [x] | `ghl_association_delete` | v3/associations-v3.json | delete-association | `DELETE /associations/{associationId}` | v3 |  |
| [x] | `ghl_association_get_by_id` | v3/associations-v3.json | get-association-by-ID | `GET /associations/{associationId}` | v3 |  |
| [x] | `ghl_association_update` | v3/associations-v3.json | update-association | `PUT /associations/{associationId}` | v3 |  |
| [x] | `ghl_association_list` | v3/associations-v3.json | find-associations | `GET /associations/` | v3 |  |
| [x] | `ghl_association_get_by_key_name` | v3/associations-v3.json | get-association-key-by-key-name | `GET /associations/key/{key_name}` | v3 |  |
| [x] | `ghl_association_get_by_object_key` | v3/associations-v3.json | get-association-by-object-keys | `GET /associations/objectKey/{objectKey}` | v3 |  |
| [x] | `ghl_association_create` | v3/associations-v3.json | create-association | `POST /associations/` | v3 |  |
| [x] | `ghl_association_get_relations_by_record_id` | v3/associations-v3.json | get-relations-by-record-id | `GET /associations/relations/{recordId}` | v3 |  |
| [x] | `ghl_association_delete_relation` | v3/associations-v3.json | delete-relation | `DELETE /associations/relations/{relationId}` | v3 |  |
| [x] | `ghl_association_create_relation` | v3/associations-v3.json | create-relation | `POST /associations/relations` | v3 |  |
| [x] | `ghl_contact_get_appointments` | v3/contacts-v3.json | get-appointments-for-contact | `GET /contacts/{contactId}/appointments` | v3 |  |
| [x] | `ghl_contact_remove_from_campaign` | v3/contacts-v3.json | remove-contact-from-campaign | `DELETE /contacts/{contactId}/campaigns/{campaignId}` | v3 |  |
| [x] | `ghl_contact_add_to_campaign` | v3/contacts-v3.json | add-contact-to-campaign | `POST /contacts/{contactId}/campaigns/{campaignId}` | v3 |  |
| [x] | `ghl_contact_remove_from_all_campaigns` | v3/contacts-v3.json | remove-contact-from-every-campaign | `DELETE /contacts/{contactId}/campaigns/remove-all` | v3 |  |
| [x] | `ghl_contact_remove_followers` | v3/contacts-v3.json | remove-followers-contact | `DELETE /contacts/{contactId}/followers` | v3 |  |
| [x] | `ghl_contact_add_followers` | v3/contacts-v3.json | add-followers-contact | `POST /contacts/{contactId}/followers` | v3 |  |
| [x] | `ghl_contact_delete_note` | v3/contacts-v3.json | delete-note | `DELETE /contacts/{contactId}/notes/{id}` | v3 |  |
| [x] | `ghl_contact_get_note` | v3/contacts-v3.json | get-note | `GET /contacts/{contactId}/notes/{id}` | v3 |  |
| [x] | `ghl_contact_update_note` | v3/contacts-v3.json | update-note | `PUT /contacts/{contactId}/notes/{id}` | v3 |  |
| [x] | `ghl_contact_get_all_notes` | v3/contacts-v3.json | get-all-notes | `GET /contacts/{contactId}/notes` | v3 |  |
| [x] | `ghl_contact_create_note` | v3/contacts-v3.json | create-note | `POST /contacts/{contactId}/notes` | v3 |  |
| [x] | `ghl_contact_remove_tags` | v3/contacts-v3.json | remove-tags | `DELETE /contacts/{contactId}/tags` | v3 |  |
| [x] | `ghl_contact_add_tags` | v3/contacts-v3.json | add-tags | `POST /contacts/{contactId}/tags` | v3 |  |
| [x] | `ghl_contact_update_task_completed` | v3/contacts-v3.json | update-task-completed | `PUT /contacts/{contactId}/tasks/{taskId}/completed` | v3 |  |
| [x] | `ghl_contact_delete_task` | v3/contacts-v3.json | delete-task | `DELETE /contacts/{contactId}/tasks/{taskId}` | v3 |  |
| [x] | `ghl_contact_get_task` | v3/contacts-v3.json | get-task | `GET /contacts/{contactId}/tasks/{taskId}` | v3 |  |
| [x] | `ghl_contact_update_task` | v3/contacts-v3.json | update-task | `PUT /contacts/{contactId}/tasks/{taskId}` | v3 |  |
| [x] | `ghl_contact_get_all_tasks` | v3/contacts-v3.json | get-all-tasks | `GET /contacts/{contactId}/tasks` | v3 |  |
| [x] | `ghl_contact_create_task` | v3/contacts-v3.json | create-task | `POST /contacts/{contactId}/tasks` | v3 |  |
| [x] | `ghl_contact_delete_from_workflow` | v3/contacts-v3.json | delete-contact-from-workflow | `DELETE /contacts/{contactId}/workflow/{workflowId}` | v3 |  |
| [x] | `ghl_contact_add_to_workflow` | v3/contacts-v3.json | add-contact-to-workflow | `POST /contacts/{contactId}/workflow/{workflowId}` | v3 |  |
| [x] | `ghl_contact_delete` | v3/contacts-v3.json | delete-contact | `DELETE /contacts/{contactId}` | v3 |  |
| [x] | `ghl_contact_get_by_id` | v3/contacts-v3.json | get-contact | `GET /contacts/{contactId}` | v3 |  |
| [x] | `ghl_contact_update` | v3/contacts-v3.json | update-contact | `PUT /contacts/{contactId}` | v3 |  |
| [x] | `ghl_contact_add_remove_from_business` | v3/contacts-v3.json | add-remove-contact-from-business | `POST /contacts/bulk/business` | v3 |  |
| [x] | `ghl_contact_bulk_update_tags` | v3/contacts-v3.json | create-association | `POST /contacts/bulk/tags/update/{type}` | v3 |  |
| [x] | `ghl_contact_get_by_business_id` | v3/contacts-v3.json | get-contacts-by-businessId | `GET /contacts/business/{businessId}` | v3 |  |
| [x] | `ghl_contact_create` | v3/contacts-v3.json | create-contact | `POST /contacts/` | v3 |  |
| [x] | `ghl_contact_get_duplicate` | v3/contacts-v3.json | get-duplicate-contact | `GET /contacts/search/duplicate` | v3 |  |
| [x] | `ghl_contact_search_advanced` | v3/contacts-v3.json | search-contacts-advanced | `POST /contacts/search` | v3 |  |
| [x] | `ghl_contact_upsert` | v3/contacts-v3.json | upsert-contact | `POST /contacts/upsert` | v3 |  |
| [x] | `ghl_custom_field_delete` | v3/custom-fields-v3.json | delete-custom-field | `DELETE /custom-fields/{id}` | v3 |  |
| [x] | `ghl_custom_field_get_by_id` | v3/custom-fields-v3.json | get-custom-field-by-id | `GET /custom-fields/{id}` | v3 |  |
| [x] | `ghl_custom_field_update` | v3/custom-fields-v3.json | update-custom-field | `PUT /custom-fields/{id}` | v3 |  |
| [x] | `ghl_custom_field_delete_folder` | v3/custom-fields-v3.json | delete-custom-field-folder | `DELETE /custom-fields/folder/{id}` | v3 |  |
| [x] | `ghl_custom_field_update_folder` | v3/custom-fields-v3.json | update-custom-field-folder | `PUT /custom-fields/folder/{id}` | v3 |  |
| [x] | `ghl_custom_field_create_folder` | v3/custom-fields-v3.json | create-custom-field-folder | `POST /custom-fields/folder` | v3 |  |
| [x] | `ghl_custom_field_get_by_object_key` | v3/custom-fields-v3.json | get-custom-fields-by-object-key | `GET /custom-fields/object-key/{objectKey}` | v3 |  |
| [x] | `ghl_custom_field_create` | v3/custom-fields-v3.json | create-custom-field | `POST /custom-fields/` | v3 |  |
| [x] | `ghl_object_get_schema_by_key` | v3/objects-v3.json | get-object-schema-by-key | `GET /objects/{key}` | v3 |  |
| [x] | `ghl_object_update_schema` | v3/objects-v3.json | update-custom-object | `PUT /objects/{key}` | v3 |  |
| [x] | `ghl_object_delete_record` | v3/objects-v3.json | delete-object-record | `DELETE /objects/{schemaKey}/records/{id}` | v3 |  |
| [x] | `ghl_object_get_record_by_id` | v3/objects-v3.json | get-record-by-id | `GET /objects/{schemaKey}/records/{id}` | v3 |  |
| [x] | `ghl_object_update_record` | v3/objects-v3.json | update-object-record | `PUT /objects/{schemaKey}/records/{id}` | v3 |  |
| [x] | `ghl_object_search_records` | v3/objects-v3.json | search-object-records | `POST /objects/{schemaKey}/records/search` | v3 |  |
| [x] | `ghl_object_create_record` | v3/objects-v3.json | create-object-record | `POST /objects/{schemaKey}/records` | v3 |  |
| [x] | `ghl_object_list` | v3/objects-v3.json | get-object-by-location-id | `GET /objects/` | v3 |  |
| [x] | `ghl_object_create_custom_object` | v3/objects-v3.json | create-custom-object-schema | `POST /objects/` | v3 |  |

## B. Opportunities & Pipelines (12 operations)

| St | Tool name | Spec file | operationId | Method + path | Version | Note |
|----|-----------|-----------|-------------|---------------|---------|------|
| [x] | `ghl_opportunity_remove_followers` | v3/opportunities-v3.json | remove-followers-opportunity | `DELETE /opportunities/{id}/followers` | v3 |  |
| [x] | `ghl_opportunity_add_followers` | v3/opportunities-v3.json | add-followers-opportunity | `POST /opportunities/{id}/followers` | v3 |  |
| [x] | `ghl_opportunity_update_status` | v3/opportunities-v3.json | update-opportunity-status | `PUT /opportunities/{id}/status` | v3 |  |
| [x] | `ghl_opportunity_delete` | v3/opportunities-v3.json | delete-opportunity | `DELETE /opportunities/{id}` | v3 |  |
| [x] | `ghl_opportunity_get` | v3/opportunities-v3.json | get-opportunity | `GET /opportunities/{id}` | v3 |  |
| [x] | `ghl_opportunity_update` | v3/opportunities-v3.json | update-opportunity | `PUT /opportunities/{id}` | v3 |  |
| [x] | `ghl_opportunity_get_lost_reason` | v3/opportunities-v3.json | get-lost-reason | `GET /opportunities/lost-reason` | v3 |  |
| [x] | `ghl_pipeline_list` | v3/opportunities-v3.json | get-pipelines | `GET /opportunities/pipelines` | v3 |  |
| [x] | `ghl_opportunity_create` | v3/opportunities-v3.json | create-opportunity | `POST /opportunities/` | v3 |  |
| [x] | `ghl_opportunity_search` | v3/opportunities-v3.json | search-opportunity | `GET /opportunities/search` | v3 |  |
| [x] | `ghl_opportunity_search_advanced` | v3/opportunities-v3.json | search-opportunities-advanced | `POST /opportunities/search` | v3 |  |
| [x] | `ghl_opportunity_upsert` | v3/opportunities-v3.json | Upsert-opportunity | `POST /opportunities/upsert` | v3 |  |

## C. Calendars & Scheduling (59 operations)

| St | Tool name | Spec file | operationId | Method + path | Version | Note |
|----|-----------|-----------|-------------|---------------|---------|------|
| [x] | `ghl_calendar_list_free_slots` | v3/calendars-v3.json | get-slots | `GET /calendars/{calendarId}/free-slots` | v3 | descriptionNote added: startDate/endDate are epoch-ms numbers, not ISO dates, despite the param name. |
| [x] | `ghl_calendar_notification_delete` | v3/calendars-v3.json | delete-event-notification | `DELETE /calendars/{calendarId}/notifications/{notificationId}` | v3 |  |
| [x] | `ghl_calendar_notification_get` | v3/calendars-v3.json | find-event-notification | `GET /calendars/{calendarId}/notifications/{notificationId}` | v3 |  |
| [x] | `ghl_calendar_notification_update` | v3/calendars-v3.json | update-event-notification | `PUT /calendars/{calendarId}/notifications/{notificationId}` | v3 |  |
| [x] | `ghl_calendar_notification_list` | v3/calendars-v3.json | get-event-notification | `GET /calendars/{calendarId}/notifications` | v3 |  |
| [x] | `ghl_calendar_notification_create` | v3/calendars-v3.json | create-event-notification | `POST /calendars/{calendarId}/notifications` | v3 |  |
| [x] | `ghl_calendar_delete` | v3/calendars-v3.json | delete-calendar | `DELETE /calendars/{calendarId}` | v3 |  |
| [x] | `ghl_calendar_get` | v3/calendars-v3.json | get-calendar | `GET /calendars/{calendarId}` | v3 |  |
| [x] | `ghl_calendar_update` | v3/calendars-v3.json | update-calendar | `PUT /calendars/{calendarId}` | v3 |  |
| [x] | `ghl_calendar_appointment_note_delete` | v3/calendars-v3.json | delete-appointment-note | `DELETE /calendars/appointments/{appointmentId}/notes/{noteId}` | v3 |  |
| [x] | `ghl_calendar_appointment_note_update` | v3/calendars-v3.json | update-appointment-note | `PUT /calendars/appointments/{appointmentId}/notes/{noteId}` | v3 |  |
| [x] | `ghl_calendar_appointment_note_list` | v3/calendars-v3.json | get-appointment-notes | `GET /calendars/appointments/{appointmentId}/notes` | v3 |  |
| [x] | `ghl_calendar_appointment_note_create` | v3/calendars-v3.json | create-appointment-note | `POST /calendars/appointments/{appointmentId}/notes` | v3 |  |
| [x] | `ghl_calendar_list_blocked_slots` | v3/calendars-v3.json | get-blocked-slots | `GET /calendars/blocked-slots` | v3 |  |
| [x] | `ghl_calendar_event_delete` | v3/calendars-v3.json | delete-event | `DELETE /calendars/events/{eventId}` | v3 |  |
| [x] | `ghl_calendar_appointment_get` | v3/calendars-v3.json | get-appointment | `GET /calendars/events/appointments/{eventId}` | v3 |  |
| [x] | `ghl_calendar_appointment_update` | v3/calendars-v3.json | edit-appointment | `PUT /calendars/events/appointments/{eventId}` | v3 |  |
| [x] | `ghl_calendar_appointment_create` | v3/calendars-v3.json | create-appointment | `POST /calendars/events/appointments` | v3 |  |
| [x] | `ghl_calendar_block_slot_update` | v3/calendars-v3.json | edit-block-slot | `PUT /calendars/events/block-slots/{eventId}` | v3 |  |
| [x] | `ghl_calendar_block_slot_create` | v3/calendars-v3.json | create-block-slot | `POST /calendars/events/block-slots` | v3 |  |
| [x] | `ghl_calendar_event_list` | v3/calendars-v3.json | get-calendar-events | `GET /calendars/events` | v3 |  |
| [x] | `ghl_calendar_list` | v3/calendars-v3.json | get-calendars | `GET /calendars/` | v3 |  |
| [x] | `ghl_calendar_group_update_status` | v3/calendars-v3.json | disable-group | `PUT /calendars/groups/{groupId}/status` | v3 | descriptionNote added: operationId says disable-group but isActive body field toggles both directions. |
| [x] | `ghl_calendar_group_delete` | v3/calendars-v3.json | delete-group | `DELETE /calendars/groups/{groupId}` | v3 |  |
| [x] | `ghl_calendar_group_update` | v3/calendars-v3.json | edit-group | `PUT /calendars/groups/{groupId}` | v3 |  |
| [x] | `ghl_calendar_group_validate_slug` | v3/calendars-v3.json | validate-groups-slug | `POST /calendars/groups/validate-slug` | v3 |  |
| [x] | `ghl_calendar_group_list` | v3/calendars-v3.json | get-groups | `GET /calendars/groups` | v3 |  |
| [x] | `ghl_calendar_group_create` | v3/calendars-v3.json | create-calendar-group | `POST /calendars/groups` | v3 |  |
| [x] | `ghl_calendar_create` | v3/calendars-v3.json | create-calendar | `POST /calendars/` | v3 |  |
| [x] | `ghl_calendar_resource_delete` | v3/calendars-v3.json | delete-calendar-resource | `DELETE /calendars/resources/{resourceType}/{id}` | 2021-04-15 | DEPRECATED (registered, flagged) — versionHeader overridden v3->2021-04-15: v3-tier row was deprecated (Services V1); legacy 2021-04-15 is the current documented version. See overrides notes[]. |
| [x] | `ghl_calendar_resource_get` | v3/calendars-v3.json | get-calendar-resource | `GET /calendars/resources/{resourceType}/{id}` | 2021-04-15 | DEPRECATED (registered, flagged) — versionHeader overridden v3->2021-04-15: v3-tier row was deprecated (Services V1); legacy 2021-04-15 is the current documented version. See overrides notes[]. |
| [x] | `ghl_calendar_resource_update` | v3/calendars-v3.json | update-calendar-resource | `PUT /calendars/resources/{resourceType}/{id}` | 2021-04-15 | DEPRECATED (registered, flagged) — versionHeader overridden v3->2021-04-15: v3-tier row was deprecated (Services V1); legacy 2021-04-15 is the current documented version. See overrides notes[]. |
| [x] | `ghl_calendar_resource_list` | v3/calendars-v3.json | fetch-calendar-resources | `GET /calendars/resources/{resourceType}` | 2021-04-15 | DEPRECATED (registered, flagged) — versionHeader overridden v3->2021-04-15: v3-tier row was deprecated (Services V1); legacy 2021-04-15 is the current documented version. See overrides notes[]. |
| [x] | `ghl_calendar_resource_create` | v3/calendars-v3.json | create-calendar-resource | `POST /calendars/resources/{resourceType}` | 2021-04-15 | DEPRECATED (registered, flagged) — versionHeader overridden v3->2021-04-15: v3-tier row was deprecated (Services V1); legacy 2021-04-15 is the current documented version. See overrides notes[]. |
| [x] | `ghl_calendar_schedule_unassign` | v3/calendars-v3.json | remove-calendar-from-schedule | `DELETE /calendars/schedules/{id}/associations/{calendarId}` | v3 |  |
| [x] | `ghl_calendar_schedule_assign` | v3/calendars-v3.json | add-calendar-to-schedule | `PUT /calendars/schedules/{id}/associations/{calendarId}` | v3 |  |
| [x] | `ghl_calendar_schedule_delete` | v3/calendars-v3.json | deleteSchedule | `DELETE /calendars/schedules/{id}` | v3 |  |
| [x] | `ghl_calendar_schedule_get` | v3/calendars-v3.json | getScheduleById | `GET /calendars/schedules/{id}` | v3 |  |
| [x] | `ghl_calendar_schedule_update` | v3/calendars-v3.json | updateSchedule | `PUT /calendars/schedules/{id}` | v3 |  |
| [x] | `ghl_calendar_event_schedule_get` | v3/calendars-v3.json | getCalendarSchedule | `GET /calendars/schedules/event-calendar/{calendarId}` | v3 |  |
| [x] | `ghl_calendar_event_schedule_create` | v3/calendars-v3.json | createCalendarSchedule | `POST /calendars/schedules/event-calendar/{calendarId}` | v3 |  |
| [x] | `ghl_calendar_event_schedule_update` | v3/calendars-v3.json | updateCalendarSchedule | `PUT /calendars/schedules/event-calendar/{calendarId}` | v3 |  |
| [x] | `ghl_calendar_schedule_list` | v3/calendars-v3.json | getAllSchedules | `GET /calendars/schedules/search` | v3 |  |
| [x] | `ghl_calendar_schedule_create` | v3/calendars-v3.json | createSchedule | `POST /calendars/schedules` | v3 |  |
| [x] | `ghl_calendar_service_booking_delete` | v3/calendars-v3.json | delete-service-booking | `DELETE /calendars/services/bookings/{bookingId}` | v3 |  |
| [x] | `ghl_calendar_service_booking_get` | v3/calendars-v3.json | get-service-booking-by-id | `GET /calendars/services/bookings/{bookingId}` | v3 |  |
| [x] | `ghl_calendar_service_booking_update` | v3/calendars-v3.json | update-service-booking | `PUT /calendars/services/bookings/{bookingId}` | v3 |  |
| [x] | `ghl_calendar_service_booking_list` | v3/calendars-v3.json | get-service-bookings | `GET /calendars/services/bookings` | v3 |  |
| [x] | `ghl_calendar_service_booking_create` | v3/calendars-v3.json | create-service-booking | `POST /calendars/services/bookings` | v3 |  |
| [x] | `ghl_calendar_service_delete` | v3/calendars-v3.json | delete-service-catalog | `DELETE /calendars/services/catalog/{serviceId}` | v3 |  |
| [x] | `ghl_calendar_service_get` | v3/calendars-v3.json | get-service-catalog-by-id | `GET /calendars/services/catalog/{serviceId}` | v3 |  |
| [x] | `ghl_calendar_service_update` | v3/calendars-v3.json | update-service-catalog | `PUT /calendars/services/catalog/{serviceId}` | v3 |  |
| [x] | `ghl_calendar_service_list` | v3/calendars-v3.json | get-services-catalog | `GET /calendars/services/catalog` | v3 |  |
| [x] | `ghl_calendar_service_create` | v3/calendars-v3.json | create-service-catalog | `POST /calendars/services/catalog` | v3 |  |
| [x] | `ghl_calendar_service_location_delete` | v3/calendars-v3.json | delete-service-location | `DELETE /calendars/services/locations/{serviceLocationId}` | v3 |  |
| [x] | `ghl_calendar_service_location_get` | v3/calendars-v3.json | get-service-location-by-id | `GET /calendars/services/locations/{serviceLocationId}` | v3 |  |
| [x] | `ghl_calendar_service_location_update` | v3/calendars-v3.json | update-service-location | `PUT /calendars/services/locations/{serviceLocationId}` | v3 |  |
| [x] | `ghl_calendar_service_location_list` | v3/calendars-v3.json | get-service-locations | `GET /calendars/services/locations` | v3 |  |
| [x] | `ghl_calendar_service_location_create` | v3/calendars-v3.json | create-service-location | `POST /calendars/services/locations` | v3 |  |

## D. Conversations & AI (91 operations)

| St | Tool name | Spec file | operationId | Method + path | Version | Note |
|----|-----------|-----------|-------------|---------------|---------|------|
| [x] | `ghl_conversation_update_custom_subtype` | conversations.json | update-custom-subtype | `PUT /conversations/preferences/custom-subtypes/{id}` | 2021-04-15 |  |
| [x] | `ghl_conversation_list_custom_subtypes` | conversations.json | get-all-custom-subtypes | `GET /conversations/preferences/custom-subtypes` | 2021-04-15 |  |
| [x] | `ghl_conversation_create_custom_subtype` | conversations.json | create-custom-subtype | `POST /conversations/preferences/custom-subtypes` | 2021-04-15 |  |
| [x] | `ghl_conversation_get_contact_unsubscription_status` | conversations.json | get-contact-unsubscription-status | `GET /conversations/preferences/unsubscriptions/status` | 2021-04-15 |  |
| [x] | `ghl_conversation_user_subscription_change` | conversations.json | user-subscription-change | `POST /conversations/preferences/unsubscriptions/user-change` | 2021-04-15 |  |
| [x] | `ghl_agent_studio_execute` | v3/agent-studio-v3.json | executeAgent | `POST /agent-studio/agent/{agentId}/execute` | v3 |  |
| [x] | `ghl_agent_studio_delete` | v3/agent-studio-v3.json | deleteAgent | `DELETE /agent-studio/agent/{agentId}` | v3 |  |
| [x] | `ghl_agent_studio_get_by_id` | v3/agent-studio-v3.json | getAgentById | `GET /agent-studio/agent/{agentId}` | v3 |  |
| [x] | `ghl_agent_studio_update_metadata` | v3/agent-studio-v3.json | updateAgentMetadata | `PATCH /agent-studio/agent/{agentId}` | v3 |  |
| [x] | `ghl_agent_studio_promote_and_publish` | v3/agent-studio-v3.json | promoteAndPublish | `POST /agent-studio/agent/versions/{versionId}/publish` | v3 |  |
| [x] | `ghl_agent_studio_update_version` | v3/agent-studio-v3.json | updateAgentVersion | `PATCH /agent-studio/agent/versions/{versionId}` | v3 |  |
| [x] | `ghl_agent_studio_list` | v3/agent-studio-v3.json | getAgents | `GET /agent-studio/agent` | v3 |  |
| [x] | `ghl_agent_studio_create` | v3/agent-studio-v3.json | createAgent | `POST /agent-studio/agent` | v3 |  |
| [x] | `ghl_agent_studio_execute_deprecated` | v3/agent-studio-v3.json | executeAgent-deprecated | `POST /agent-studio/public-api/agents/{agentId}/execute` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_agent_studio_get_by_id_deprecated` | v3/agent-studio-v3.json | getAgentById-deprecated | `GET /agent-studio/public-api/agents/{agentId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_agent_studio_list_deprecated` | v3/agent-studio-v3.json | getAgents-deprecated | `GET /agent-studio/public-api/agents` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_chat_widget_delete` | v3/chat-widget-v3.json | delete | `DELETE /chat-widget/{locationId}/{id}` | v3 |  |
| [x] | `ghl_chat_widget_clone` | v3/chat-widget-v3.json | cloneChatWidget | `POST /chat-widget/clone` | v3 |  |
| [x] | `ghl_chat_widget_get` | v3/chat-widget-v3.json | getChatWidget | `GET /chat-widget/data/{locationId}/{id}` | v3 |  |
| [x] | `ghl_chat_widget_patch` | v3/chat-widget-v3.json | patchChatWidget | `PATCH /chat-widget/data/{locationId}/{id}` | v3 |  |
| [x] | `ghl_chat_widget_update` | v3/chat-widget-v3.json | updateChatWidget | `PUT /chat-widget/data/{locationId}/{id}` | v3 |  |
| [x] | `ghl_chat_widget_list` | v3/chat-widget-v3.json | listChatWidget | `GET /chat-widget/list` | v3 |  |
| [x] | `ghl_chat_widget_create` | v3/chat-widget-v3.json | createChatWidget | `POST /chat-widget/` | v3 |  |
| [x] | `ghl_chat_widget_get_public_config` | v3/chat-widget-v3.json | getWidget | `GET /chat-widget/public/config/{id}` | v3 |  |
| [x] | `ghl_conversation_ai_delete_action` | v3/conversation-ai-v3.json | delete-action | `DELETE /conversation-ai/agents/{agentId}/actions/{actionId}` | v3 |  |
| [x] | `ghl_conversation_ai_get_action_by_id` | v3/conversation-ai-v3.json | get-action-by-id | `GET /conversation-ai/agents/{agentId}/actions/{actionId}` | v3 |  |
| [x] | `ghl_conversation_ai_update_action` | v3/conversation-ai-v3.json | update-action | `PUT /conversation-ai/agents/{agentId}/actions/{actionId}` | v3 |  |
| [x] | `ghl_conversation_ai_list_actions` | v3/conversation-ai-v3.json | list-actions | `GET /conversation-ai/agents/{agentId}/actions/list` | v3 |  |
| [x] | `ghl_conversation_ai_create_action` | v3/conversation-ai-v3.json | create-action | `POST /conversation-ai/agents/{agentId}/actions` | v3 |  |
| [x] | `ghl_conversation_ai_update_followup_settings` | v3/conversation-ai-v3.json | update-followup-settings | `PATCH /conversation-ai/agents/{agentId}/followup-settings` | v3 |  |
| [x] | `ghl_conversation_ai_delete_agent` | v3/conversation-ai-v3.json | delete-agent | `DELETE /conversation-ai/agents/{agentId}` | v3 |  |
| [x] | `ghl_conversation_ai_get_agent` | v3/conversation-ai-v3.json | get-agent | `GET /conversation-ai/agents/{agentId}` | v3 |  |
| [x] | `ghl_conversation_ai_update_agent` | v3/conversation-ai-v3.json | update-agent | `PUT /conversation-ai/agents/{agentId}` | v3 |  |
| [x] | `ghl_conversation_ai_search_agent` | v3/conversation-ai-v3.json | search-agent | `GET /conversation-ai/agents/search` | v3 |  |
| [x] | `ghl_conversation_ai_create_agent` | v3/conversation-ai-v3.json | create-agent | `POST /conversation-ai/agents` | v3 |  |
| [x] | `ghl_conversation_ai_get_generation` | v3/conversation-ai-v3.json | get-generation-details | `GET /conversation-ai/generations` | v3 |  |
| [x] | `ghl_conversation_get_messages` | v3/conversations-v3.json | get-messages | `GET /conversations/{conversationId}/messages` | v3 |  |
| [x] | `ghl_conversation_delete` | v3/conversations-v3.json | delete-conversation | `DELETE /conversations/{conversationId}` | v3 |  |
| [x] | `ghl_conversation_get` | v3/conversations-v3.json | get-conversation | `GET /conversations/{conversationId}` | v3 |  |
| [x] | `ghl_conversation_update` | v3/conversations-v3.json | update-conversation | `PUT /conversations/{conversationId}` | v3 |  |
| [x] | `ghl_conversation_download_message_transcription` | v3/conversations-v3.json | download-message-transcription | `GET /conversations/locations/{locationId}/messages/{messageId}/transcription/download` | v3 |  |
| [x] | `ghl_conversation_get_message_transcription` | v3/conversations-v3.json | get-message-transcription | `GET /conversations/locations/{locationId}/messages/{messageId}/transcription` | v3 |  |
| [x] | `ghl_conversation_get_message` | v3/conversations-v3.json | get-message | `GET /conversations/messages/{id}` | v3 | Spec extraction gap: the official spec's `parameters` array for this operation is missing the `id` path parameter (path template is /conversations/messages/{id} but zero params are declared). The gene |
| [x] | `ghl_conversation_add_message_attachments` | v3/conversations-v3.json | add-message-attachments | `PUT /conversations/messages/{messageId}/attachments` | v3 |  |
| [x] | `ghl_conversation_get_message_recording` | v3/conversations-v3.json | get-message-recording | `GET /conversations/messages/{messageId}/locations/{locationId}/recording` | v3 |  |
| [x] | `ghl_conversation_cancel_scheduled_message` | v3/conversations-v3.json | cancel-scheduled-message | `DELETE /conversations/messages/{messageId}/schedule` | v3 |  |
| [x] | `ghl_conversation_update_message_status` | v3/conversations-v3.json | update-message-status | `PUT /conversations/messages/{messageId}/status` | v3 |  |
| [x] | `ghl_conversation_cancel_scheduled_email_message` | v3/conversations-v3.json | cancel-scheduled-email-message | `DELETE /conversations/messages/email/{emailMessageId}/schedule` | (none) |  |
| [x] | `ghl_conversation_update_email_message_status` | v3/conversations-v3.json | update-email-message-status | `PUT /conversations/messages/email/{id}/status` | v3 |  |
| [x] | `ghl_conversation_get_email_message` | v3/conversations-v3.json | get-email-by-id | `GET /conversations/messages/email/{id}` | (none) | Same spec extraction gap as GET /conversations/messages/{id}: `parameters` is empty despite the path requiring {id}. Tool cannot be called successfully as generated. Needs a registry.ts fix or an upst |
| [x] | `ghl_conversation_export_messages_by_location` | v3/conversations-v3.json | export-messages-by-location | `GET /conversations/messages/export` | v3 |  |
| [x] | `ghl_conversation_add_inbound_message` | v3/conversations-v3.json | add-an-inbound-message | `POST /conversations/messages/inbound` | v3 |  |
| [x] | `ghl_conversation_add_outbound_message` | v3/conversations-v3.json | add-an-outbound-message | `POST /conversations/messages/outbound` | v3 |  |
| [E] | — | v3/conversations-v3.json | send-review-reply | `POST /conversations/messages/review-reply` | v3 | DEPRECATED (registered, flagged) — Spec description states verbatim: 'This endpoint is internal-only and is not supported for OAuth or public API integrations. It will be removed from the public OpenA |
| [E] | — | v3/conversations-v3.json | complete-file-upload | `POST /conversations/messages/upload/complete` | v3 | DEPRECATED (registered, flagged) — Spec description states verbatim: 'This endpoint is internal-only and is not supported for OAuth or public API integrations. It will be removed from the public OpenA |
| [E] | — | v3/conversations-v3.json | initiate-file-upload | `POST /conversations/messages/upload/initiate` | v3 | DEPRECATED (registered, flagged) — Same internal-only/no-OAuth-support disclaimer as POST /conversations/messages/upload/complete (part of the same 2-step GCS signed-URL flow). Unusable by an API-key/ |
| [x] | `ghl_conversation_upload_file_attachments` | v3/conversations-v3.json | upload-file-attachments | `POST /conversations/messages/upload` | v3 |  |
| [x] | `ghl_conversation_send_message` | v3/conversations-v3.json | send-a-new-message | `POST /conversations/messages` | v3 |  |
| [x] | `ghl_conversation_create` | v3/conversations-v3.json | create-conversation | `POST /conversations/` | v3 |  |
| [x] | `ghl_conversation_live_chat_agent_typing` | v3/conversations-v3.json | live-chat-agent-typing | `POST /conversations/providers/live-chat/typing` | v3 |  |
| [x] | `ghl_conversation_search` | v3/conversations-v3.json | search-conversation | `GET /conversations/search` | v3 |  |
| [x] | `ghl_email_verify` | v3/email-isv-v3.json | verify-email | `POST /email/verify` | v3 |  |
| [x] | `ghl_kb_update_knowledge_base` | v3/knowledge-base-v3.json | updateKnowledgeBase | `PUT /knowledge-bases/{id}` | v3 |  |
| [x] | `ghl_kb_delete_knowledge_base` | v3/knowledge-base-v3.json | deleteKnowledgeBase | `DELETE /knowledge-bases/{knowledgeBaseId}` | v3 |  |
| [x] | `ghl_kb_get_knowledge_base_by_id` | v3/knowledge-base-v3.json | getKnowledgeBaseById | `GET /knowledge-bases/{knowledgeBaseId}` | v3 |  |
| [x] | `ghl_kb_crawler_status` | v3/knowledge-base-v3.json | getCrawlingStatusForLatestOperation | `GET /knowledge-bases/crawler/status` | v3 |  |
| [x] | `ghl_kb_crawler_train` | v3/knowledge-base-v3.json | trainDiscoveredUrls | `POST /knowledge-bases/crawler/train` | v3 |  |
| [x] | `ghl_kb_crawler_delete_urls` | v3/knowledge-base-v3.json | deleteTrainedUrlsForKnowledgeBase | `DELETE /knowledge-bases/crawler` | v3 |  |
| [x] | `ghl_kb_crawler_list_urls` | v3/knowledge-base-v3.json | getAllWebsiteUrlsDataByKnowledgeBase | `GET /knowledge-bases/crawler` | v3 |  |
| [x] | `ghl_kb_crawler_discover` | v3/knowledge-base-v3.json | discoverWebsite | `POST /knowledge-bases/crawler` | v3 |  |
| [x] | `ghl_kb_faq_delete` | v3/knowledge-base-v3.json | delete | `DELETE /knowledge-bases/faqs/{id}` | v3 |  |
| [x] | `ghl_kb_faq_update` | v3/knowledge-base-v3.json | update | `PUT /knowledge-bases/faqs/{id}` | v3 |  |
| [x] | `ghl_kb_faq_list` | v3/knowledge-base-v3.json | list | `GET /knowledge-bases/faqs` | v3 |  |
| [x] | `ghl_kb_faq_create` | v3/knowledge-base-v3.json | create | `POST /knowledge-bases/faqs` | v3 |  |
| [x] | `ghl_kb_list` | v3/knowledge-base-v3.json | listAllKnowledgeBasesPaginated | `GET /knowledge-bases/` | v3 |  |
| [x] | `ghl_kb_create_knowledge_base` | v3/knowledge-base-v3.json | createKnowledgeBase | `POST /knowledge-bases/` | v3 |  |
| [x] | `ghl_phone_list_number_pools` | v3/phone-system-v3.json | getNumberPoolList | `GET /phone-system/number-pools` | (none) |  |
| [x] | `ghl_phone_list_available_numbers` | v3/phone-system-v3.json | listAvailableNumbersForACountry | `GET /phone-system/numbers/location/{locationId}/available` | (none) |  |
| [x] | `ghl_phone_purchase_number` | v3/phone-system-v3.json | purchase-number-for-location | `POST /phone-system/numbers/location/{locationId}/purchase` | v3 |  |
| [x] | `ghl_phone_list_active_numbers` | v3/phone-system-v3.json | active-numbers | `GET /phone-system/numbers/location/{locationId}` | v3 |  |
| [x] | `ghl_voice_ai_delete_action` | v3/voice-ai-v3.json | delete-action | `DELETE /voice-ai/actions/{actionId}` | v3 |  |
| [x] | `ghl_voice_ai_get_action` | v3/voice-ai-v3.json | get-action | `GET /voice-ai/actions/{actionId}` | v3 |  |
| [x] | `ghl_voice_ai_update_action` | v3/voice-ai-v3.json | update-action | `PUT /voice-ai/actions/{actionId}` | v3 |  |
| [x] | `ghl_voice_ai_create_action` | v3/voice-ai-v3.json | create-action | `POST /voice-ai/actions` | v3 |  |
| [x] | `ghl_voice_ai_delete_agent` | v3/voice-ai-v3.json | delete-agent | `DELETE /voice-ai/agents/{agentId}` | v3 |  |
| [x] | `ghl_voice_ai_get_agent` | v3/voice-ai-v3.json | get-agent | `GET /voice-ai/agents/{agentId}` | v3 |  |
| [x] | `ghl_voice_ai_patch_agent` | v3/voice-ai-v3.json | patch-agent | `PATCH /voice-ai/agents/{agentId}` | v3 |  |
| [x] | `ghl_voice_ai_list_agents` | v3/voice-ai-v3.json | get-agents | `GET /voice-ai/agents` | v3 |  |
| [x] | `ghl_voice_ai_create_agent` | v3/voice-ai-v3.json | create-agent | `POST /voice-ai/agents` | v3 |  |
| [x] | `ghl_voice_ai_get_call_log` | v3/voice-ai-v3.json | getCallLog | `GET /voice-ai/dashboard/call-logs/{callId}` | v3 |  |
| [x] | `ghl_voice_ai_get_call_logs` | v3/voice-ai-v3.json | get-call-logs | `GET /voice-ai/dashboard/call-logs` | v3 |  |

## E. Payments & Commerce (114 operations)

| St | Tool name | Spec file | operationId | Method + path | Version | Note |
|----|-----------|-----------|-------------|---------------|---------|------|
| [x] | `ghl_invoice_update_late_fees_configuration` | v3/invoices-v3.json | update-invoice-late-fees-configuration | `PATCH /invoices/{invoiceId}/late-fees-configuration` | v3 |  |
| [x] | `ghl_invoice_record_payment` | v3/invoices-v3.json | record-invoice | `POST /invoices/{invoiceId}/record-payment` | v3 |  |
| [x] | `ghl_invoice_send` | v3/invoices-v3.json | send-invoice | `POST /invoices/{invoiceId}/send` | v3 |  |
| [x] | `ghl_invoice_void` | v3/invoices-v3.json | void-invoice | `POST /invoices/{invoiceId}/void` | v3 |  |
| [x] | `ghl_invoice_delete` | v3/invoices-v3.json | delete-invoice | `DELETE /invoices/{invoiceId}` | v3 |  |
| [x] | `ghl_invoice_get` | v3/invoices-v3.json | get-invoice | `GET /invoices/{invoiceId}` | v3 |  |
| [x] | `ghl_invoice_update` | v3/invoices-v3.json | update-invoice | `PUT /invoices/{invoiceId}` | v3 |  |
| [x] | `ghl_estimate_convert_to_invoice` | v3/invoices-v3.json | create-invoice-from-estimate | `POST /invoices/estimate/{estimateId}/invoice` | v3 |  |
| [x] | `ghl_estimate_send` | v3/invoices-v3.json | send-estimate | `POST /invoices/estimate/{estimateId}/send` | v3 |  |
| [x] | `ghl_estimate_delete` | v3/invoices-v3.json | delete-estimate | `DELETE /invoices/estimate/{estimateId}` | v3 |  |
| [x] | `ghl_estimate_update` | v3/invoices-v3.json | update-estimate | `PUT /invoices/estimate/{estimateId}` | v3 |  |
| [x] | `ghl_estimate_list` | v3/invoices-v3.json | list-estimates | `GET /invoices/estimate/list` | v3 |  |
| [x] | `ghl_estimate_generate_number` | v3/invoices-v3.json | generate-estimate-number | `GET /invoices/estimate/number/generate` | v3 |  |
| [x] | `ghl_estimate_update_last_visited_at` | v3/invoices-v3.json | update-estimate-last-visited-at | `PATCH /invoices/estimate/stats/last-visited-at` | v3 |  |
| [x] | `ghl_estimate_template_delete` | v3/invoices-v3.json | delete-estimate-template | `DELETE /invoices/estimate/template/{templateId}` | v3 |  |
| [x] | `ghl_estimate_template_update` | v3/invoices-v3.json | update-estimate-template | `PUT /invoices/estimate/template/{templateId}` | v3 |  |
| [x] | `ghl_estimate_template_preview` | v3/invoices-v3.json | preview-estimate-template | `GET /invoices/estimate/template/preview` | v3 |  |
| [x] | `ghl_estimate_template_list` | v3/invoices-v3.json | list-estimate-templates | `GET /invoices/estimate/template` | v3 |  |
| [x] | `ghl_estimate_template_create` | v3/invoices-v3.json | create-estimate-template | `POST /invoices/estimate/template` | v3 |  |
| [x] | `ghl_estimate_create` | v3/invoices-v3.json | create-new-estimate | `POST /invoices/estimate` | v3 |  |
| [x] | `ghl_invoice_generate_number` | v3/invoices-v3.json | generate-invoice-number | `GET /invoices/generate-invoice-number` | v3 |  |
| [x] | `ghl_invoice_list` | v3/invoices-v3.json | list-invoices | `GET /invoices/` | v3 |  |
| [x] | `ghl_invoice_create` | v3/invoices-v3.json | create-invoice | `POST /invoices/` | v3 |  |
| [x] | `ghl_invoice_schedule_set_auto_payment` | v3/invoices-v3.json | auto-payment-invoice-schedule | `POST /invoices/schedule/{scheduleId}/auto-payment` | v3 |  |
| [x] | `ghl_invoice_schedule_cancel` | v3/invoices-v3.json | cancel-invoice-schedule | `POST /invoices/schedule/{scheduleId}/cancel` | v3 |  |
| [x] | `ghl_invoice_schedule_activate` | v3/invoices-v3.json | schedule-invoice-schedule | `POST /invoices/schedule/{scheduleId}/schedule` | v3 |  |
| [x] | `ghl_invoice_schedule_update_and_activate` | v3/invoices-v3.json | update-and-schedule-invoice-schedule | `POST /invoices/schedule/{scheduleId}/updateAndSchedule` | v3 |  |
| [x] | `ghl_invoice_schedule_delete` | v3/invoices-v3.json | delete-invoice-schedule | `DELETE /invoices/schedule/{scheduleId}` | v3 |  |
| [x] | `ghl_invoice_schedule_get` | v3/invoices-v3.json | get-invoice-schedule | `GET /invoices/schedule/{scheduleId}` | v3 |  |
| [x] | `ghl_invoice_schedule_update` | v3/invoices-v3.json | update-invoice-schedule | `PUT /invoices/schedule/{scheduleId}` | v3 |  |
| [x] | `ghl_invoice_schedule_list` | v3/invoices-v3.json | list-invoice-schedules | `GET /invoices/schedule` | v3 |  |
| [x] | `ghl_invoice_schedule_create` | v3/invoices-v3.json | create-invoice-schedule | `POST /invoices/schedule` | v3 |  |
| [x] | `ghl_invoice_get_settings` | v3/invoices-v3.json | get-invoice-settings | `GET /invoices/settings` | v3 |  |
| [x] | `ghl_invoice_update_last_visited_at` | v3/invoices-v3.json | update-invoice-last-visited-at | `PATCH /invoices/stats/last-visited-at` | v3 |  |
| [x] | `ghl_invoice_template_update_late_fees_configuration` | v3/invoices-v3.json | update-invoice-template-late-fees-configuration | `PATCH /invoices/template/{templateId}/late-fees-configuration` | v3 |  |
| [x] | `ghl_invoice_template_update_payment_methods_configuration` | v3/invoices-v3.json | update-invoice-payment-methods-configuration | `PATCH /invoices/template/{templateId}/payment-methods-configuration` | v3 |  |
| [x] | `ghl_invoice_template_delete` | v3/invoices-v3.json | delete-invoice-template | `DELETE /invoices/template/{templateId}` | v3 |  |
| [x] | `ghl_invoice_template_get` | v3/invoices-v3.json | get-invoice-template | `GET /invoices/template/{templateId}` | v3 |  |
| [x] | `ghl_invoice_template_update` | v3/invoices-v3.json | update-invoice-template | `PUT /invoices/template/{templateId}` | v3 |  |
| [x] | `ghl_invoice_template_list` | v3/invoices-v3.json | list-invoice-templates | `GET /invoices/template` | v3 |  |
| [x] | `ghl_invoice_template_create` | v3/invoices-v3.json | create-invoice-template | `POST /invoices/template` | v3 |  |
| [x] | `ghl_invoice_text2pay` | v3/invoices-v3.json | text2pay-invoice | `POST /invoices/text2pay` | v3 |  |
| [x] | `ghl_payment_coupon_list` | v3/payments-v3.json | list-coupons | `GET /payments/coupon/list` | v3 |  |
| [x] | `ghl_payment_coupon_delete` | v3/payments-v3.json | delete-coupon | `DELETE /payments/coupon` | v3 |  |
| [x] | `ghl_payment_coupon_get` | v3/payments-v3.json | get-coupon | `GET /payments/coupon` | v3 |  |
| [x] | `ghl_payment_coupon_create` | v3/payments-v3.json | create-coupon | `POST /payments/coupon` | v3 |  |
| [x] | `ghl_payment_coupon_update` | v3/payments-v3.json | update-coupon | `PUT /payments/coupon` | v3 |  |
| [x] | `ghl_payment_custom_provider_update_capabilities` | v3/payments-v3.json | custom-provider-marketplace-app-update-capabilities | `PUT /payments/custom-provider/capabilities` | v3 |  |
| [x] | `ghl_payment_custom_provider_get_config` | v3/payments-v3.json | fetch-config | `GET /payments/custom-provider/connect` | v3 |  |
| [x] | `ghl_payment_custom_provider_create_config` | v3/payments-v3.json | create-config | `POST /payments/custom-provider/connect` | v3 |  |
| [x] | `ghl_payment_custom_provider_disconnect_config` | v3/payments-v3.json | disconnect-config | `POST /payments/custom-provider/disconnect` | v3 |  |
| [x] | `ghl_payment_custom_provider_delete` | v3/payments-v3.json | delete-integration | `DELETE /payments/custom-provider/provider` | v3 |  |
| [x] | `ghl_payment_custom_provider_create` | v3/payments-v3.json | create-integration | `POST /payments/custom-provider/provider` | v3 |  |
| [x] | `ghl_payment_integration_provider_list` | v3/payments-v3.json | list-integration-providers | `GET /payments/integrations/provider/whitelabel` | v3 |  |
| [x] | `ghl_payment_integration_provider_create` | v3/payments-v3.json | create-integration provider | `POST /payments/integrations/provider/whitelabel` | v3 |  |
| [x] | `ghl_payment_order_list_fulfillments` | v3/payments-v3.json | list-order-fulfillment | `GET /payments/orders/{orderId}/fulfillments` | v3 |  |
| [x] | `ghl_payment_order_create_fulfillment` | v3/payments-v3.json | create-order-fulfillment | `POST /payments/orders/{orderId}/fulfillments` | v3 |  |
| [x] | `ghl_payment_order_list_notes` | v3/payments-v3.json | list-order-notes | `GET /payments/orders/{orderId}/notes` | v3 |  |
| [x] | `ghl_payment_order_record_payment` | v3/payments-v3.json | record-order-payment | `POST /payments/orders/{orderId}/record-payment` | v3 |  |
| [x] | `ghl_payment_order_get` | v3/payments-v3.json | get-order-by-id | `GET /payments/orders/{orderId}` | v3 |  |
| [x] | `ghl_payment_order_list` | v3/payments-v3.json | list-orders | `GET /payments/orders` | v3 |  |
| [x] | `ghl_payment_subscription_get` | v3/payments-v3.json | get-subscription-by-id | `GET /payments/subscriptions/{subscriptionId}` | v3 |  |
| [x] | `ghl_payment_subscription_list` | v3/payments-v3.json | list-subscriptions | `GET /payments/subscriptions` | v3 |  |
| [x] | `ghl_payment_transaction_get` | v3/payments-v3.json | get-transaction-by-id | `GET /payments/transactions/{transactionId}` | v3 |  |
| [x] | `ghl_payment_transaction_list` | v3/payments-v3.json | list-transactions | `GET /payments/transactions` | v3 |  |
| [x] | `ghl_product_price_delete` | v3/products-v3.json | delete-price-by-id-for-product | `DELETE /products/{productId}/price/{priceId}` | v3 |  |
| [x] | `ghl_product_price_get` | v3/products-v3.json | get-price-by-id-for-product | `GET /products/{productId}/price/{priceId}` | v3 |  |
| [x] | `ghl_product_price_update` | v3/products-v3.json | update-price-by-id-for-product | `PUT /products/{productId}/price/{priceId}` | v3 |  |
| [x] | `ghl_product_price_list` | v3/products-v3.json | list-prices-for-product | `GET /products/{productId}/price` | v3 |  |
| [x] | `ghl_product_price_create` | v3/products-v3.json | create-price-for-product | `POST /products/{productId}/price` | v3 |  |
| [x] | `ghl_product_delete` | v3/products-v3.json | delete-product-by-id | `DELETE /products/{productId}` | v3 |  |
| [x] | `ghl_product_get` | v3/products-v3.json | get-product-by-id | `GET /products/{productId}` | v3 |  |
| [x] | `ghl_product_update` | v3/products-v3.json | update-product-by-id | `PUT /products/{productId}` | v3 |  |
| [x] | `ghl_product_bulk_edit` | v3/products-v3.json | bulkEdit | `POST /products/bulk-update/edit` | v3 |  |
| [x] | `ghl_product_bulk_update` | v3/products-v3.json | bulkUpdate | `POST /products/bulk-update` | v3 |  |
| [x] | `ghl_product_collection_delete` | v3/products-v3.json | delete-product-collection | `DELETE /products/collections/{collectionId}` | v3 |  |
| [x] | `ghl_product_collection_get` | v3/products-v3.json | get-product-collection-id | `GET /products/collections/{collectionId}` | v3 |  |
| [x] | `ghl_product_collection_update` | v3/products-v3.json | update-product-collection | `PUT /products/collections/{collectionId}` | v3 |  |
| [x] | `ghl_product_collection_list` | v3/products-v3.json | get-product-collection | `GET /products/collections` | v3 |  |
| [x] | `ghl_product_collection_create` | v3/products-v3.json | create-product-collection | `POST /products/collections` | v3 |  |
| [x] | `ghl_product_list` | v3/products-v3.json | list-invoices | `GET /products/` | v3 |  |
| [x] | `ghl_product_inventory_list` | v3/products-v3.json | get-list-inventory | `GET /products/inventory` | v3 |  |
| [x] | `ghl_product_inventory_update` | v3/products-v3.json | update-inventory | `POST /products/inventory` | v3 |  |
| [x] | `ghl_product_create` | v3/products-v3.json | create-product | `POST /products/` | v3 |  |
| [x] | `ghl_product_review_delete` | v3/products-v3.json | delete-product-review | `DELETE /products/reviews/{reviewId}` | v3 |  |
| [x] | `ghl_product_review_update` | v3/products-v3.json | update-product-review | `PUT /products/reviews/{reviewId}` | v3 |  |
| [x] | `ghl_product_review_bulk_update` | v3/products-v3.json | bulk-update-product-review | `POST /products/reviews/bulk-update` | v3 |  |
| [x] | `ghl_product_review_count` | v3/products-v3.json | get-reviews-count | `GET /products/reviews/count` | v3 |  |
| [x] | `ghl_product_review_list` | v3/products-v3.json | get-product-reviews | `GET /products/reviews` | v3 |  |
| [x] | `ghl_product_store_set_priority` | v3/products-v3.json | update-display-priority | `POST /products/store/{storeId}/priority` | v3 |  |
| [x] | `ghl_product_store_get_stats` | v3/products-v3.json | get-product-store-stats | `GET /products/store/{storeId}/stats` | v3 |  |
| [x] | `ghl_product_store_set_inclusion` | v3/products-v3.json | update-store-status | `POST /products/store/{storeId}` | v3 |  |
| [x] | `ghl_proposal_send_document` | v3/proposals-v3.json | send-documents-contracts | `POST /proposals/document/send` | v3 |  |
| [x] | `ghl_proposal_list_documents` | v3/proposals-v3.json | list-documents-contracts | `GET /proposals/document` | v3 |  |
| [x] | `ghl_proposal_send_template` | v3/proposals-v3.json | send-documents-contracts-template | `POST /proposals/templates/send` | v3 |  |
| [x] | `ghl_proposal_list_templates` | v3/proposals-v3.json | list-documents-contracts-templates | `GET /proposals/templates` | v3 |  |
| [x] | `ghl_store_delete_shipping_carrier` | v3/store-v3.json | delete-shipping-carrier | `DELETE /store/shipping-carrier/{shippingCarrierId}` | (none) |  |
| [x] | `ghl_store_get_shipping_carrier` | v3/store-v3.json | get-shipping-carriers | `GET /store/shipping-carrier/{shippingCarrierId}` | (none) |  |
| [x] | `ghl_store_update_shipping_carrier` | v3/store-v3.json | update-shipping-carrier | `PUT /store/shipping-carrier/{shippingCarrierId}` | (none) |  |
| [x] | `ghl_store_list_shipping_carriers` | v3/store-v3.json | list-shipping-carriers | `GET /store/shipping-carrier` | (none) |  |
| [x] | `ghl_store_create_shipping_carrier` | v3/store-v3.json | create-shipping-carrier | `POST /store/shipping-carrier` | (none) |  |
| [x] | `ghl_store_delete_shipping_rate` | v3/store-v3.json | delete-shipping-rate | `DELETE /store/shipping-zone/{shippingZoneId}/shipping-rate/{shippingRateId}` | (none) |  |
| [x] | `ghl_store_get_shipping_rate` | v3/store-v3.json | get-shipping-rates | `GET /store/shipping-zone/{shippingZoneId}/shipping-rate/{shippingRateId}` | (none) |  |
| [x] | `ghl_store_update_shipping_rate` | v3/store-v3.json | update-shipping-rate | `PUT /store/shipping-zone/{shippingZoneId}/shipping-rate/{shippingRateId}` | (none) |  |
| [x] | `ghl_store_list_shipping_rates` | v3/store-v3.json | list-shipping-rates | `GET /store/shipping-zone/{shippingZoneId}/shipping-rate` | (none) |  |
| [x] | `ghl_store_create_shipping_rate` | v3/store-v3.json | create-shipping-rate | `POST /store/shipping-zone/{shippingZoneId}/shipping-rate` | (none) |  |
| [x] | `ghl_store_delete_shipping_zone` | v3/store-v3.json | delete-shipping-zone | `DELETE /store/shipping-zone/{shippingZoneId}` | (none) |  |
| [x] | `ghl_store_get_shipping_zone` | v3/store-v3.json | get-shipping-zones | `GET /store/shipping-zone/{shippingZoneId}` | (none) |  |
| [x] | `ghl_store_update_shipping_zone` | v3/store-v3.json | update-shipping-zone | `PUT /store/shipping-zone/{shippingZoneId}` | (none) |  |
| [x] | `ghl_store_get_available_shipping_rates` | v3/store-v3.json | get-available-shipping-zones | `POST /store/shipping-zone/shipping-rates` | (none) |  |
| [x] | `ghl_store_list_shipping_zones` | v3/store-v3.json | list-shipping-zones | `GET /store/shipping-zone` | (none) |  |
| [x] | `ghl_store_create_shipping_zone` | v3/store-v3.json | create-shipping-zone | `POST /store/shipping-zone` | (none) |  |
| [x] | `ghl_store_get_settings` | v3/store-v3.json | get-store-settings | `GET /store/store-setting` | (none) |  |
| [x] | `ghl_store_upsert_settings` | v3/store-v3.json | create-store-setting | `POST /store/store-setting` | (none) |  |

## F. Marketing & Content (134 operations)

| St | Tool name | Spec file | operationId | Method + path | Version | Note |
|----|-----------|-----------|-------------|---------------|---------|------|
| [x] | `ghl_email_builder_template_delete` | emails.json | delete-template | `DELETE /emails/builder/{locationId}/{templateId}` | 2021-07-28 |  |
| [x] | `ghl_email_builder_template_update` | emails.json | update-template | `POST /emails/builder/data` | 2021-07-28 |  |
| [x] | `ghl_email_builder_template_get` | emails.json | fetch-template | `GET /emails/builder` | 2021-07-28 |  |
| [x] | `ghl_email_builder_template_create` | emails.json | create-template | `POST /emails/builder` | 2021-07-28 |  |
| [x] | `ghl_email_legacy_campaign_list` | emails.json | fetch-campaigns | `GET /emails/schedule` | 2021-07-28 |  |
| [x] | `ghl_social_get_facebook_page_group` | social-media-posting.json | get-facebook-page-group | `GET /social-media-posting/oauth/{locationId}/facebook/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_attach_facebook_page_group` | social-media-posting.json | attach-facebook-page-group | `POST /social-media-posting/oauth/{locationId}/facebook/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_get_google_locations` | social-media-posting.json | get-google-locations | `GET /social-media-posting/oauth/{locationId}/google/locations/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_set_google_locations` | social-media-posting.json | set-google-locations | `POST /social-media-posting/oauth/{locationId}/google/locations/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_get_instagram_page_group` | social-media-posting.json | get-instagram-page-group | `GET /social-media-posting/oauth/{locationId}/instagram/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_attach_instagram_page_group` | social-media-posting.json | attach-instagram-page-group | `POST /social-media-posting/oauth/{locationId}/instagram/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_get_linkedin_page_profile` | social-media-posting.json | get-linkedin-page-profile | `GET /social-media-posting/oauth/{locationId}/linkedin/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_attach_linkedin_page_profile` | social-media-posting.json | attach-linkedin-page-profile | `POST /social-media-posting/oauth/{locationId}/linkedin/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_get_tiktok_business_profile` | social-media-posting.json | get-tiktok-business-profile | `GET /social-media-posting/oauth/{locationId}/tiktok-business/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_get_tiktok_profile` | social-media-posting.json | get-tiktok-profile | `GET /social-media-posting/oauth/{locationId}/tiktok/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_attach_tiktok_profile` | social-media-posting.json | attach-tiktok-profile | `POST /social-media-posting/oauth/{locationId}/tiktok/accounts/{accountId}` | 2021-07-28 |  |
| [x] | `ghl_social_get_twitter_profile` | social-media-posting.json | get-twitter-profile | `GET /social-media-posting/oauth/{locationId}/twitter/accounts/{accountId}` | 2021-07-28 | DEPRECATED (registered, flagged) |
| [x] | `ghl_social_attach_twitter_profile` | social-media-posting.json | attach-twitter-profile | `POST /social-media-posting/oauth/{locationId}/twitter/accounts/{accountId}` | 2021-07-28 | DEPRECATED (registered, flagged) |
| [E] | — | social-media-posting.json | start-facebook-oauth | `GET /social-media-posting/oauth/facebook/start` | 2021-07-28 | Browser-only OAuth initiation flow (spec: 'Open the API in a window ... User is navigated to Facebook login OAuth screen ... listen on window object for message'). Result is delivered via window.postM |
| [E] | — | social-media-posting.json | start-google-oauth | `GET /social-media-posting/oauth/google/start` | 2021-07-28 | Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_google_loca |
| [E] | — | social-media-posting.json | start-instagram-oauth | `GET /social-media-posting/oauth/instagram/start` | 2021-07-28 | Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_instagram_p |
| [E] | — | social-media-posting.json | start-linkedin-oauth | `GET /social-media-posting/oauth/linkedin/start` | 2021-07-28 | Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_linkedin_pa |
| [E] | — | social-media-posting.json | start-tiktok-business-oauth | `GET /social-media-posting/oauth/tiktok-business/start` | 2021-07-28 | Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_tiktok_busi |
| [E] | — | social-media-posting.json | start-tiktok-oauth | `GET /social-media-posting/oauth/tiktok/start` | 2021-07-28 | Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_tiktok_prof |
| [E] | — | social-media-posting.json | start-twitter-oauth | `GET /social-media-posting/oauth/twitter/start` | 2021-07-28 | DEPRECATED (registered, flagged) — Browser-only OAuth initiation flow AND deprecated per the spec (Twitter/X). Not callable server-to-server (window.postMessage response). No documented replacement na |
| [x] | `ghl_blog_get_all_authors_by_location` | v3/blogs-v3.json | get-all-blog-authors-by-location | `GET /blogs/authors` | v3 |  |
| [x] | `ghl_blog_get_all_categories_by_location` | v3/blogs-v3.json | get-all-categories-by-location | `GET /blogs/categories` | v3 |  |
| [x] | `ghl_blog_update_post` | v3/blogs-v3.json | update-blog-post | `PUT /blogs/posts/{postId}` | v3 |  |
| [x] | `ghl_blog_post_list` | v3/blogs-v3.json | get-blog-post | `GET /blogs/posts/all` | v3 |  |
| [x] | `ghl_blog_check_url_slug_exists` | v3/blogs-v3.json | check-url-slug-exists | `GET /blogs/posts/url-slug-exists` | v3 |  |
| [x] | `ghl_blog_post_create` | v3/blogs-v3.json | create-blog-post | `POST /blogs/posts` | v3 |  |
| [x] | `ghl_blog_site_list` | v3/blogs-v3.json | get-blogs | `GET /blogs/site/all` | v3 |  |
| [x] | `ghl_brand_board_delete` | v3/brand-boards-v3.json | deleteBrandBoard | `DELETE /brand-boards/{locationId}/{id}` | v3 |  |
| [x] | `ghl_brand_board_get_by_id` | v3/brand-boards-v3.json | getBrandBoardById | `GET /brand-boards/{locationId}/{id}` | v3 |  |
| [x] | `ghl_brand_board_update` | v3/brand-boards-v3.json | updateBrandBoard | `PATCH /brand-boards/{locationId}/{id}` | v3 |  |
| [x] | `ghl_brand_board_get_by_location` | v3/brand-boards-v3.json | getBrandBoardsByLocation | `GET /brand-boards/{locationId}` | v3 |  |
| [x] | `ghl_brand_board_set_default_voice` | v3/brand-boards-v3.json | set-default-brand-voice | `POST /brand-boards/locations/{locationId}/brand-voices/{brandVoiceId}/default` | v3 |  |
| [x] | `ghl_brand_board_delete_voice` | v3/brand-boards-v3.json | delete-brand-voice | `DELETE /brand-boards/locations/{locationId}/brand-voices/{brandVoiceId}` | v3 |  |
| [x] | `ghl_brand_board_get_voice` | v3/brand-boards-v3.json | get-brand-voice | `GET /brand-boards/locations/{locationId}/brand-voices/{brandVoiceId}` | v3 |  |
| [x] | `ghl_brand_board_update_voice` | v3/brand-boards-v3.json | update-brand-voice | `PATCH /brand-boards/locations/{locationId}/brand-voices/{brandVoiceId}` | v3 |  |
| [x] | `ghl_brand_board_list_voices` | v3/brand-boards-v3.json | list-brand-voices | `GET /brand-boards/locations/{locationId}/brand-voices` | v3 |  |
| [x] | `ghl_brand_board_create_voice` | v3/brand-boards-v3.json | create-brand-voice | `POST /brand-boards/locations/{locationId}/brand-voices` | v3 |  |
| [x] | `ghl_brand_board_create` | v3/brand-boards-v3.json | createBrandBoard | `POST /brand-boards/` | v3 |  |
| [x] | `ghl_campaign_list` | v3/campaigns-v3.json | get-campaigns | `GET /campaigns/` | v3 |  |
| [x] | `ghl_course_import` | v3/courses-v3.json | import-courses | `POST /courses/courses-exporter/public/import` | v3 |  |
| [x] | `ghl_email_get_bulk_action_campaign` | v3/emails-v3.json | get-bulk-action-campaign | `GET /emails/locations/{locationId}/campaigns/bulk-actions/{campaignId}` | v3 |  |
| [x] | `ghl_email_list_bulk_action_campaigns` | v3/emails-v3.json | list-bulk-action-campaigns | `GET /emails/locations/{locationId}/campaigns/bulk-actions` | v3 |  |
| [x] | `ghl_email_schedule_campaign` | v3/emails-v3.json | schedule-campaign | `POST /emails/locations/{locationId}/campaigns/emails/{campaignId}/schedule` | v3 |  |
| [x] | `ghl_email_delete_campaign` | v3/emails-v3.json | delete-campaign | `DELETE /emails/locations/{locationId}/campaigns/emails/{campaignId}` | v3 |  |
| [x] | `ghl_email_get_campaign` | v3/emails-v3.json | get-email-campaign | `GET /emails/locations/{locationId}/campaigns/emails/{campaignId}` | v3 |  |
| [x] | `ghl_email_update_campaign` | v3/emails-v3.json | update-email-campaign | `PATCH /emails/locations/{locationId}/campaigns/emails/{campaignId}` | v3 |  |
| [x] | `ghl_email_list_campaigns` | v3/emails-v3.json | list-email-campaigns | `GET /emails/locations/{locationId}/campaigns/emails` | v3 |  |
| [x] | `ghl_email_create_campaign` | v3/emails-v3.json | create-email-campaign | `POST /emails/locations/{locationId}/campaigns/emails` | v3 |  |
| [x] | `ghl_email_get_campaign_stats` | v3/emails-v3.json | get-campaign-stats | `GET /emails/locations/{locationId}/campaigns/stats/{source}/{sourceId}` | v3 |  |
| [x] | `ghl_email_get_workflow_campaign` | v3/emails-v3.json | get-workflow-campaign | `GET /emails/locations/{locationId}/campaigns/workflows/{campaignId}` | v3 |  |
| [x] | `ghl_email_list_workflow_campaigns` | v3/emails-v3.json | list-workflow-campaigns | `GET /emails/locations/{locationId}/campaigns/workflows` | v3 |  |
| [x] | `ghl_email_template_delete` | v3/emails-v3.json | delete-email-template | `DELETE /emails/locations/{locationId}/templates/{templateId}` | v3 |  |
| [x] | `ghl_email_template_get` | v3/emails-v3.json | get-email-template | `GET /emails/locations/{locationId}/templates/{templateId}` | v3 |  |
| [x] | `ghl_email_template_update` | v3/emails-v3.json | update-email-template | `PATCH /emails/locations/{locationId}/templates/{templateId}` | v3 |  |
| [x] | `ghl_email_template_folder_create` | v3/emails-v3.json | create-template-folder | `POST /emails/locations/{locationId}/templates/folders` | v3 |  |
| [x] | `ghl_email_template_import` | v3/emails-v3.json | import-email-template | `POST /emails/locations/{locationId}/templates/import` | v3 |  |
| [x] | `ghl_email_template_list` | v3/emails-v3.json | list-email-templates | `GET /emails/locations/{locationId}/templates` | v3 |  |
| [x] | `ghl_email_template_create` | v3/emails-v3.json | create-email-template | `POST /emails/locations/{locationId}/templates` | v3 |  |
| [x] | `ghl_form_list` | v3/forms-v3.json | get-forms | `GET /forms/` | v3 |  |
| [x] | `ghl_form_get_submissions` | v3/forms-v3.json | get-forms-submissions | `GET /forms/submissions` | v3 |  |
| [x] | `ghl_form_upload_custom_files` | v3/forms-v3.json | upload-to-custom-fields | `POST /forms/upload-custom-files` | v3 |  |
| [x] | `ghl_funnel_list` | v3/funnels-v3.json | getFunnels | `GET /funnels/funnel/list` | (none) |  |
| [x] | `ghl_funnel_delete_redirect_by_id` | v3/funnels-v3.json | delete-redirect-by-id | `DELETE /funnels/lookup/redirect/{id}` | v3 |  |
| [x] | `ghl_funnel_update_redirect_by_id` | v3/funnels-v3.json | update-redirect-by-id | `PATCH /funnels/lookup/redirect/{id}` | v3 |  |
| [x] | `ghl_funnel_fetch_redirects_list` | v3/funnels-v3.json | fetch-redirects-list | `GET /funnels/lookup/redirect/list` | v3 |  |
| [x] | `ghl_funnel_create_redirect` | v3/funnels-v3.json | create-redirect | `POST /funnels/lookup/redirect` | v3 |  |
| [x] | `ghl_funnel_get_pages_count_by_id` | v3/funnels-v3.json | getPagesCountByFunnelId | `GET /funnels/page/count` | (none) |  |
| [x] | `ghl_funnel_get_pages_by_id` | v3/funnels-v3.json | getPagesByFunnelId | `GET /funnels/page` | (none) |  |
| [x] | `ghl_link_delete` | v3/links-v3.json | delete-link | `DELETE /links/{linkId}` | v3 |  |
| [x] | `ghl_link_update` | v3/links-v3.json | update-link | `PUT /links/{linkId}` | v3 |  |
| [x] | `ghl_link_list` | v3/links-v3.json | get-links | `GET /links/` | v3 |  |
| [x] | `ghl_link_get_by_id` | v3/links-v3.json | get-link-by-id | `GET /links/id/{linkId}` | v3 |  |
| [x] | `ghl_link_create` | v3/links-v3.json | create-link | `POST /links/` | v3 |  |
| [x] | `ghl_link_search_trigger` | v3/links-v3.json | search-trigger-links | `GET /links/search` | v3 |  |
| [x] | `ghl_media_delete_file` | v3/medias-v3.json | delete-media-content | `DELETE /medias/{id}` | v3 |  |
| [x] | `ghl_media_update_file` | v3/medias-v3.json | update-media-object | `POST /medias/{id}` | v3 |  |
| [x] | `ghl_media_bulk_delete_files` | v3/medias-v3.json | bulk-delete-media-objects | `PUT /medias/delete-files` | v3 |  |
| [x] | `ghl_media_list_files` | v3/medias-v3.json | fetch-media-content | `GET /medias/files` | v3 |  |
| [x] | `ghl_media_create_folder` | v3/medias-v3.json | create-media-folder | `POST /medias/folder` | v3 |  |
| [x] | `ghl_media_bulk_update_files` | v3/medias-v3.json | bulk-update-media-objects | `PUT /medias/update-files` | v3 |  |
| [x] | `ghl_media_upload_file` | v3/medias-v3.json | upload-media-content | `POST /medias/upload-file` | v3 |  |
| [x] | `ghl_social_delete_account` | v3/social-planner-v3.json | delete-account | `DELETE /social-media-posting/{locationId}/accounts/{id}` | v3 |  |
| [x] | `ghl_social_get_account` | v3/social-planner-v3.json | get-account | `GET /social-media-posting/{locationId}/accounts` | v3 |  |
| [x] | `ghl_social_category_get` | v3/social-planner-v3.json | get-categories-id | `GET /social-media-posting/{locationId}/categories/{id}` | v3 |  |
| [x] | `ghl_social_category_list` | v3/social-planner-v3.json | get-categories-location-id | `GET /social-media-posting/{locationId}/categories` | v3 |  |
| [x] | `ghl_social_delete_csv_post` | v3/social-planner-v3.json | delete-csv-post | `DELETE /social-media-posting/{locationId}/csv/{csvId}/post/{postId}` | v3 |  |
| [x] | `ghl_social_delete_csv` | v3/social-planner-v3.json | delete-csv | `DELETE /social-media-posting/{locationId}/csv/{id}` | v3 |  |
| [x] | `ghl_social_get_csv_post` | v3/social-planner-v3.json | get-csv-post | `GET /social-media-posting/{locationId}/csv/{id}` | v3 |  |
| [x] | `ghl_social_csv_finalize` | v3/social-planner-v3.json | start-csv-finalize | `PATCH /social-media-posting/{locationId}/csv/{id}` | v3 |  |
| [x] | `ghl_social_csv_list` | v3/social-planner-v3.json | get-upload-status | `GET /social-media-posting/{locationId}/csv` | v3 |  |
| [x] | `ghl_social_csv_upload` | v3/social-planner-v3.json | upload-csv | `POST /social-media-posting/{locationId}/csv` | v3 |  |
| [x] | `ghl_social_delete_post` | v3/social-planner-v3.json | delete-post | `DELETE /social-media-posting/{locationId}/posts/{id}` | v3 |  |
| [x] | `ghl_social_get_post` | v3/social-planner-v3.json | get-post | `GET /social-media-posting/{locationId}/posts/{id}` | v3 |  |
| [x] | `ghl_social_edit_post` | v3/social-planner-v3.json | edit-post | `PUT /social-media-posting/{locationId}/posts/{id}` | v3 |  |
| [x] | `ghl_social_bulk_delete_planner_posts` | v3/social-planner-v3.json | bulk-delete-social-planner-posts | `POST /social-media-posting/{locationId}/posts/bulk-delete` | v3 |  |
| [x] | `ghl_social_get_posts` | v3/social-planner-v3.json | get-posts | `POST /social-media-posting/{locationId}/posts/list` | v3 |  |
| [x] | `ghl_social_post_create` | v3/social-planner-v3.json | create-post | `POST /social-media-posting/{locationId}/posts` | v3 |  |
| [x] | `ghl_social_set_accounts` | v3/social-planner-v3.json | set-accounts | `POST /social-media-posting/{locationId}/set-accounts` | v3 |  |
| [x] | `ghl_social_get_tags_by_ids` | v3/social-planner-v3.json | get-tags-by-ids | `POST /social-media-posting/{locationId}/tags/details` | v3 |  |
| [x] | `ghl_social_get_tags_location_id` | v3/social-planner-v3.json | get-tags-location-id | `GET /social-media-posting/{locationId}/tags` | v3 |  |
| [x] | `ghl_social_delete_current_active_post_and_schedule_next` | v3/social-planner-v3.json | deleteCurrentActivePostAndScheduleNext | `DELETE /social-media-posting/category/queues/{postId}/active-post` | v3 |  |
| [x] | `ghl_social_create_queue_item` | v3/social-planner-v3.json | createQueueItem | `POST /social-media-posting/category/queues/{queueId}/create/item` | v3 |  |
| [x] | `ghl_social_fetch_edit_session_calendar` | v3/social-planner-v3.json | fetchEditSessionCalendar | `POST /social-media-posting/category/queues/{queueId}/edit/calendar` | v3 |  |
| [x] | `ghl_social_discard_edit_session` | v3/social-planner-v3.json | discardEditSession | `POST /social-media-posting/category/queues/{queueId}/edit/discard` | v3 |  |
| [x] | `ghl_social_save_edit_session` | v3/social-planner-v3.json | saveEditSession | `POST /social-media-posting/category/queues/{queueId}/edit/save` | v3 |  |
| [x] | `ghl_social_start_edit_session` | v3/social-planner-v3.json | startEditSession | `POST /social-media-posting/category/queues/{queueId}/edit/start` | v3 |  |
| [x] | `ghl_social_clone_queue_item` | v3/social-planner-v3.json | cloneQueueItem | `POST /social-media-posting/category/queues/{queueId}/items/{itemId}/clone` | v3 |  |
| [x] | `ghl_social_reset_queue_item` | v3/social-planner-v3.json | resetQueueItem | `PUT /social-media-posting/category/queues/{queueId}/items/{itemId}/reset` | v3 |  |
| [x] | `ghl_social_delete_queue_item` | v3/social-planner-v3.json | deleteQueueItem | `DELETE /social-media-posting/category/queues/{queueId}/items/{itemId}` | v3 |  |
| [x] | `ghl_social_update_queue_item` | v3/social-planner-v3.json | updateQueueItem | `PUT /social-media-posting/category/queues/{queueId}/items/{itemId}` | v3 |  |
| [x] | `ghl_social_fetch_queue_items` | v3/social-planner-v3.json | fetchQueueItems | `POST /social-media-posting/category/queues/{queueId}/items` | v3 |  |
| [x] | `ghl_social_fetch_slots` | v3/social-planner-v3.json | fetchSlots | `POST /social-media-posting/category/queues/{queueId}/slots` | v3 |  |
| [x] | `ghl_social_fetch_queue_by_id` | v3/social-planner-v3.json | fetchQueueById | `GET /social-media-posting/category/queues/{queueId}` | v3 |  |
| [x] | `ghl_social_update_queue` | v3/social-planner-v3.json | updateQueue | `PUT /social-media-posting/category/queues/{queueId}` | v3 |  |
| [x] | `ghl_social_fetch_available_categories` | v3/social-planner-v3.json | fetchAvailableCategories | `GET /social-media-posting/category/queues/available-categories` | v3 |  |
| [x] | `ghl_social_fetch_calendar_list` | v3/social-planner-v3.json | fetchCalendarList | `POST /social-media-posting/category/queues/list/calendar` | v3 |  |
| [x] | `ghl_social_fetch_queues` | v3/social-planner-v3.json | fetchQueues | `POST /social-media-posting/category/queues/list` | v3 |  |
| [x] | `ghl_social_create_queue` | v3/social-planner-v3.json | createQueue | `POST /social-media-posting/category/queues` | v3 |  |
| [x] | `ghl_social_delete_like` | v3/social-planner-v3.json | delete-like | `DELETE /social-media-posting/comments/{platform}/{id}/like` | v3 |  |
| [x] | `ghl_social_create_like` | v3/social-planner-v3.json | create-like | `POST /social-media-posting/comments/{platform}/{id}/like` | v3 |  |
| [x] | `ghl_social_get_comment_list` | v3/social-planner-v3.json | get-comment-list | `POST /social-media-posting/comments/{platform}/list` | v3 |  |
| [x] | `ghl_social_create_comment` | v3/social-planner-v3.json | create-comment | `POST /social-media-posting/comments/{platform}` | v3 |  |
| [x] | `ghl_social_get_oauth_accounts` | v3/social-planner-v3.json | get-oauth-accounts | `GET /social-media-posting/oauth/{locationId}/{platform}/accounts/{accountId}` | v3 |  |
| [x] | `ghl_social_attach_oauth_accounts` | v3/social-planner-v3.json | attach-oauth-accounts | `POST /social-media-posting/oauth/{locationId}/{platform}/accounts/{accountId}` | v3 |  |
| [E] | — | v3/social-planner-v3.json | start-oauth | `GET /social-media-posting/oauth/{platform}/start` | v3 | v3 generic browser-only OAuth initiation flow ('Start OAuth Flow (Step 1 of 3)' — spec explicitly says 'Open this API in a browser window (not via cURL)'; result delivered via window.postMessage). Not |
| [x] | `ghl_social_get_statistics` | v3/social-planner-v3.json | get-statistics | `POST /social-media-posting/statistics` | v3 |  |
| [x] | `ghl_survey_list` | v3/surveys-v3.json | get-surveys | `GET /surveys/` | v3 |  |
| [x] | `ghl_survey_get_submissions` | v3/surveys-v3.json | get-surveys-submissions | `GET /surveys/submissions` | v3 |  |
| [x] | `ghl_workflow_list` | v3/workflows-v3.json | get-workflow | `GET /workflows/` | v3 |  |

## F2. Ads & Affiliates (104 operations)

| St | Tool name | Spec file | operationId | Method + path | Version | Note |
|----|-----------|-----------|-------------|---------------|---------|------|
| [E] | — | ad-manager.json | fb-upsert-ad | `PUT /ad-publishing/facebook/ads-v2` | 2021-07-28 | v3 twin registered under ad-publishing (PUT /ad-publishing/facebook/ads, fb-upsert-ad) |
| [E] | — | ad-manager.json | fb-duplicate-adset | `POST /ad-publishing/facebook/adsets/{adsetId}/duplicate` | 2021-07-28 | v3 twin registered under ad-publishing (POST /ad-publishing/facebook/adsets/{adSetId}/duplicate, fb-duplicate-adset) |
| [E] | — | ad-manager.json | fb-pause-adset | `POST /ad-publishing/facebook/adsets/{adsetId}/pause` | 2021-07-28 | v3 twin registered under ad-publishing (POST /ad-publishing/facebook/adsets/{adSetId}/pause, fb-pause-adset) |
| [E] | — | ad-manager.json | fb-resume-adset | `POST /ad-publishing/facebook/adsets/{adsetId}/resume` | 2021-07-28 | v3 twin registered under ad-publishing (POST /ad-publishing/facebook/adsets/{adSetId}/resume, fb-resume-adset) |
| [E] | — | ad-manager.json | fb-delete-adset | `DELETE /ad-publishing/facebook/adsets/{adsetId}` | 2021-07-28 | v3 twin registered under ad-publishing (DELETE /ad-publishing/facebook/adsets/{adSetId}, fb-delete-adset) |
| [x] | `ghl_ad_fb_account_delete` | v3/ad-publishing-v3.json | fb-delete-ad-account | `DELETE /ad-publishing/facebook/ad-accounts/{adAccountId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_account_get` | v3/ad-publishing-v3.json | fb-get-ad-account | `GET /ad-publishing/facebook/ad-accounts/{adAccountId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_account_list` | v3/ad-publishing-v3.json | fb-get-ad-accounts | `GET /ad-publishing/facebook/ad-accounts` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_ad_duplicate` | v3/ad-publishing-v3.json | fb-duplicate-ad | `POST /ad-publishing/facebook/ads/{adId}/duplicate` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_ad_pause` | v3/ad-publishing-v3.json | fb-pause-ad | `POST /ad-publishing/facebook/ads/{adId}/pause` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_ad_resume` | v3/ad-publishing-v3.json | fb-resume-ad | `POST /ad-publishing/facebook/ads/{adId}/resume` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_ad_delete` | v3/ad-publishing-v3.json | fb-delete-ad | `DELETE /ad-publishing/facebook/ads/{adId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_adset_duplicate` | v3/ad-publishing-v3.json | fb-duplicate-adset | `POST /ad-publishing/facebook/adsets/{adSetId}/duplicate` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_adset_pause` | v3/ad-publishing-v3.json | fb-pause-adset | `POST /ad-publishing/facebook/adsets/{adSetId}/pause` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_adset_resume` | v3/ad-publishing-v3.json | fb-resume-adset | `POST /ad-publishing/facebook/adsets/{adSetId}/resume` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_adset_delete` | v3/ad-publishing-v3.json | fb-delete-adset | `DELETE /ad-publishing/facebook/adsets/{adSetId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_adset_upsert` | v3/ad-publishing-v3.json | fb-upsert-adset | `PUT /ad-publishing/facebook/adsets` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_ad_upsert` | v3/ad-publishing-v3.json | fb-upsert-ad | `PUT /ad-publishing/facebook/ads` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_campaign_get` | v3/ad-publishing-v3.json | fb-get-campaign | `GET /ad-publishing/facebook/campaign/{campaignId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_campaign_duplicate` | v3/ad-publishing-v3.json | fb-duplicate-campaign | `POST /ad-publishing/facebook/campaigns/{campaignId}/duplicate` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_campaign_pause` | v3/ad-publishing-v3.json | fb-pause-campaign | `POST /ad-publishing/facebook/campaigns/{campaignId}/pause` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_campaign_publishing_progress_get` | v3/ad-publishing-v3.json | fb-get-campaign-publishing-progress | `GET /ad-publishing/facebook/campaigns/{campaignId}/publishing-progress` | v3 |  |
| [x] | `ghl_ad_fb_campaign_publish` | v3/ad-publishing-v3.json | fb-publish-campaign | `POST /ad-publishing/facebook/campaigns/{campaignId}/publish` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_campaign_resume` | v3/ad-publishing-v3.json | fb-resume-campaign | `POST /ad-publishing/facebook/campaigns/{campaignId}/resume` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_campaign_delete` | v3/ad-publishing-v3.json | fb-delete-campaign | `DELETE /ad-publishing/facebook/campaigns/{campaignId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_campaign_upsert` | v3/ad-publishing-v3.json | fb-upsert-campaign | `PUT /ad-publishing/facebook/campaigns` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_conversation_form_list` | v3/ad-publishing-v3.json | fb-get-conversation-forms | `GET /ad-publishing/facebook/conversation-forms` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_conversation_form_create` | v3/ad-publishing-v3.json | fb-create-conversation-form | `POST /ad-publishing/facebook/conversation-forms` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_audience_member_batch_update` | v3/ad-publishing-v3.json | fb-batch-update-audience-members | `PUT /ad-publishing/facebook/custom-audience/{audienceId}/member/batch` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_audience_member_remove` | v3/ad-publishing-v3.json | fb-remove-custom-audience-member | `DELETE /ad-publishing/facebook/custom-audience/{audienceId}/member` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_audience_member_add` | v3/ad-publishing-v3.json | fb-add-custom-audience-member | `PUT /ad-publishing/facebook/custom-audience/{audienceId}/member` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_audience_delete` | v3/ad-publishing-v3.json | fb-delete-custom-audience | `DELETE /ad-publishing/facebook/custom-audience/{audienceId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_audience_get` | v3/ad-publishing-v3.json | fb-get-custom-audience-by-id | `GET /ad-publishing/facebook/custom-audience/{audienceId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_audience_update` | v3/ad-publishing-v3.json | fb-update-custom-audience | `PUT /ad-publishing/facebook/custom-audience/{audienceId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_audience_list` | v3/ad-publishing-v3.json | fb-get-custom-audiences | `GET /ad-publishing/facebook/custom-audience` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_entity_get` | v3/ad-publishing-v3.json | fb-get-entity | `GET /ad-publishing/facebook/entity` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_integration_delete` | v3/ad-publishing-v3.json | fb-delete-integration | `DELETE /ad-publishing/facebook/integration` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_integration_get` | v3/ad-publishing-v3.json | fb-get-integration | `GET /ad-publishing/facebook/integration` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_integration_create` | v3/ad-publishing-v3.json | fb-create-integration | `POST /ad-publishing/facebook/integration` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_lead_form_get` | v3/ad-publishing-v3.json | fb-get-lead-form | `GET /ad-publishing/facebook/lead-form/{leadFormId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_current_user_get` | v3/ad-publishing-v3.json | fb-get-current-user | `GET /ad-publishing/facebook/me` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_page_lead_form_list` | v3/ad-publishing-v3.json | fb-get-page-lead-forms | `GET /ad-publishing/facebook/page/{pageId}/forms` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_page_lead_form_create` | v3/ad-publishing-v3.json | fb-create-page-lead-form | `POST /ad-publishing/facebook/page/{pageId}/forms` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_page_instagram_account_list` | v3/ad-publishing-v3.json | fb-get-instagram-accounts | `GET /ad-publishing/facebook/page/{pageId}/instagram` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_page_set_default` | v3/ad-publishing-v3.json | fb-set-default-page | `PUT /ad-publishing/facebook/page/default` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_page_delete` | v3/ad-publishing-v3.json | fb-delete-page | `DELETE /ad-publishing/facebook/page` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_page_list` | v3/ad-publishing-v3.json | fb-get-pages | `GET /ad-publishing/facebook/pages` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_pixel_list` | v3/ad-publishing-v3.json | fb-get-pixels | `GET /ad-publishing/facebook/pixels` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_pixel_upsert` | v3/ad-publishing-v3.json | fb-upsert-pixel | `PUT /ad-publishing/facebook/pixels` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_campaign_reporting_get` | v3/ad-publishing-v3.json | fb-get-campaign-reporting | `GET /ad-publishing/facebook/reporting/campaign/{campaignId}` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_reporting_list` | v3/ad-publishing-v3.json | fb-get-reporting-list | `GET /ad-publishing/facebook/reporting/list` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_reporting_get` | v3/ad-publishing-v3.json | fb-get-reporting | `GET /ad-publishing/facebook/reporting` | 2021-07-28 |  |
| [x] | `ghl_ad_fb_targeting_search` | v3/ad-publishing-v3.json | fb-search-targeting | `GET /ad-publishing/facebook/targeting/search` | 2021-07-28 |  |
| [x] | `ghl_ad_google_account_delete` | v3/ad-publishing-v3.json | google-delete-ad-account | `DELETE /ad-publishing/google/ad-accounts/{adAccountId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_account_get` | v3/ad-publishing-v3.json | google-get-ad-account-details | `GET /ad-publishing/google/ad-accounts/{adAccountId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_account_list` | v3/ad-publishing-v3.json | google-get-ad-accounts | `GET /ad-publishing/google/ad-accounts` | 2021-07-28 |  |
| [x] | `ghl_ad_google_campaign_publish` | v3/ad-publishing-v3.json | google-publish-ad | `POST /ad-publishing/google/ads/{adId}/publish` | 2021-07-28 |  |
| [x] | `ghl_ad_google_campaign_get` | v3/ad-publishing-v3.json | google-get-campaign-by-id | `GET /ad-publishing/google/ads/{adId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_campaign_upsert` | v3/ad-publishing-v3.json | google-upsert-campaign | `PUT /ad-publishing/google/ads` | 2021-07-28 |  |
| [x] | `ghl_ad_google_asset_list` | v3/ad-publishing-v3.json | google-get-assets | `GET /ad-publishing/google/assets` | 2021-07-28 |  |
| [x] | `ghl_ad_google_asset_upsert` | v3/ad-publishing-v3.json | google-upsert-assets | `POST /ad-publishing/google/assets` | 2021-07-28 |  |
| [x] | `ghl_ad_google_audience_get` | v3/ad-publishing-v3.json | google-get-audience-by-id | `GET /ad-publishing/google/audiences/{audienceId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_audience_list` | v3/ad-publishing-v3.json | google-get-audiences | `GET /ad-publishing/google/audiences` | 2021-07-28 |  |
| [x] | `ghl_ad_google_audience_upsert` | v3/ad-publishing-v3.json | google-upsert-audience | `PUT /ad-publishing/google/audiences` | 2021-07-28 |  |
| [x] | `ghl_ad_google_conversion_goal_list` | v3/ad-publishing-v3.json | google-get-conversion-goals | `GET /ad-publishing/google/conversion-goals` | 2021-07-28 |  |
| [x] | `ghl_ad_google_conversion_delete` | v3/ad-publishing-v3.json | google-delete-conversion | `DELETE /ad-publishing/google/conversions/{conversionId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_conversion_get` | v3/ad-publishing-v3.json | google-get-conversion-by-id | `GET /ad-publishing/google/conversions/{conversionId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_conversion_list` | v3/ad-publishing-v3.json | google-get-conversions | `GET /ad-publishing/google/conversions` | 2021-07-28 |  |
| [x] | `ghl_ad_google_conversion_upsert` | v3/ad-publishing-v3.json | google-upsert-conversion | `PUT /ad-publishing/google/conversions` | 2021-07-28 |  |
| [x] | `ghl_ad_google_entity_get` | v3/ad-publishing-v3.json | google-get-entity | `GET /ad-publishing/google/entity` | 2021-07-28 |  |
| [x] | `ghl_ad_google_integration_get` | v3/ad-publishing-v3.json | google-get-integration | `GET /ad-publishing/google/integration` | 2021-07-28 |  |
| [x] | `ghl_ad_google_integration_create` | v3/ad-publishing-v3.json | google-create-integration | `POST /ad-publishing/google/integration` | 2021-07-28 |  |
| [x] | `ghl_ad_google_keyword_ideas_get` | v3/ad-publishing-v3.json | google-get-keyword-ideas | `POST /ad-publishing/google/keyword-ideas` | 2021-07-28 |  |
| [x] | `ghl_ad_google_current_user_get` | v3/ad-publishing-v3.json | google-get-current-user | `GET /ad-publishing/google/me` | 2021-07-28 |  |
| [x] | `ghl_ad_google_campaign_reporting_get` | v3/ad-publishing-v3.json | google-get-campaign-reporting | `GET /ad-publishing/google/reporting/campaign/{campaignId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_reporting_list` | v3/ad-publishing-v3.json | google-get-reporting-list | `GET /ad-publishing/google/reporting/list` | 2021-07-28 |  |
| [x] | `ghl_ad_google_reporting_get` | v3/ad-publishing-v3.json | google-get-reporting | `GET /ad-publishing/google/reporting` | 2021-07-28 |  |
| [x] | `ghl_ad_google_segment_delete` | v3/ad-publishing-v3.json | google-delete-segment | `DELETE /ad-publishing/google/segments/{segmentId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_segment_get` | v3/ad-publishing-v3.json | google-get-segment-by-id | `GET /ad-publishing/google/segments/{segmentId}` | 2021-07-28 |  |
| [x] | `ghl_ad_google_segment_offline_job_create` | v3/ad-publishing-v3.json | google-create-offline-user-list-job | `POST /ad-publishing/google/segments/offline-user-list-job` | 2021-07-28 |  |
| [x] | `ghl_ad_google_segment_list` | v3/ad-publishing-v3.json | google-get-segments | `GET /ad-publishing/google/segments` | 2021-07-28 |  |
| [x] | `ghl_ad_google_segment_upsert` | v3/ad-publishing-v3.json | google-upsert-segment | `PUT /ad-publishing/google/segments` | 2021-07-28 |  |
| [x] | `ghl_ad_google_target_interest_list` | v3/ad-publishing-v3.json | google-get-target-interests | `GET /ad-publishing/google/target-interests` | 2021-07-28 |  |
| [x] | `ghl_ad_google_targeting_search` | v3/ad-publishing-v3.json | google-search-targeting | `GET /ad-publishing/google/targeting/search` | 2021-07-28 |  |
| [x] | `ghl_ad_li_lead_form_create` | v3/ad-publishing-v3.json | li-create-lead-form | `POST /ad-publishing/linkedin/{accountId}/form` | 2021-07-28 |  |
| [x] | `ghl_ad_li_lead_form_list` | v3/ad-publishing-v3.json | li-get-lead-forms | `GET /ad-publishing/linkedin/{accountId}/forms` | 2021-07-28 |  |
| [x] | `ghl_ad_li_ad_status_update` | v3/ad-publishing-v3.json | li-update-ad-status | `PATCH /ad-publishing/linkedin/{adId}/status` | 2021-07-28 |  |
| [x] | `ghl_ad_li_account_delete` | v3/ad-publishing-v3.json | li-delete-ad-account | `DELETE /ad-publishing/linkedin/ad-account` | 2021-07-28 |  |
| [x] | `ghl_ad_li_account_get` | v3/ad-publishing-v3.json | li-get-ad-account-details | `GET /ad-publishing/linkedin/ad-account` | 2021-07-28 |  |
| [x] | `ghl_ad_li_account_list` | v3/ad-publishing-v3.json | li-get-ad-accounts | `GET /ad-publishing/linkedin/ad-accounts` | 2021-07-28 |  |
| [x] | `ghl_ad_li_campaign_group_publish` | v3/ad-publishing-v3.json | li-publish-campaign-group | `POST /ad-publishing/linkedin/ads/{adId}/publish` | 2021-07-28 |  |
| [x] | `ghl_ad_li_campaign_group_get` | v3/ad-publishing-v3.json | li-get-campaign-group | `GET /ad-publishing/linkedin/ads/{adId}` | 2021-07-28 |  |
| [x] | `ghl_ad_li_campaign_group_upsert` | v3/ad-publishing-v3.json | li-upsert-campaign-group | `PUT /ad-publishing/linkedin/ads` | 2021-07-28 |  |
| [x] | `ghl_ad_li_integration_get` | v3/ad-publishing-v3.json | li-get-integration | `GET /ad-publishing/linkedin/integration` | 2021-07-28 |  |
| [x] | `ghl_ad_li_integration_create` | v3/ad-publishing-v3.json | li-create-integration | `POST /ad-publishing/linkedin/integration` | 2021-07-28 |  |
| [x] | `ghl_ad_li_current_user_get` | v3/ad-publishing-v3.json | li-get-current-user | `GET /ad-publishing/linkedin/me` | 2021-07-28 |  |
| [x] | `ghl_ad_li_campaign_group_reporting_get` | v3/ad-publishing-v3.json | li-get-campaign-group-reporting | `GET /ad-publishing/linkedin/reporting/campaign-group/{campaignGroupId}` | 2021-07-28 |  |
| [x] | `ghl_ad_li_reporting_list` | v3/ad-publishing-v3.json | li-get-reporting-list | `GET /ad-publishing/linkedin/reporting/list` | 2021-07-28 |  |
| [x] | `ghl_ad_li_reporting_get` | v3/ad-publishing-v3.json | li-get-ad-analytics | `GET /ad-publishing/linkedin/reporting` | 2021-07-28 |  |
| [x] | `ghl_ad_li_targeting_search` | v3/ad-publishing-v3.json | li-search-targeting | `GET /ad-publishing/linkedin/targeting/search` | 2021-07-28 |  |
| [x] | `ghl_affiliate_get` | v3/affiliate-manager-v3.json | get-affiliate | `GET /affiliate-manager/{locationId}/affiliates/{affiliateId}` | v3 |  |
| [x] | `ghl_affiliate_list` | v3/affiliate-manager-v3.json | list-affiliates | `GET /affiliate-manager/{locationId}/affiliates` | v3 |  |
| [x] | `ghl_affiliate_commission_list` | v3/affiliate-manager-v3.json | list-commissions | `GET /affiliate-manager/{locationId}/commissions` | v3 |  |
| [x] | `ghl_affiliate_payout_list` | v3/affiliate-manager-v3.json | list-payouts | `GET /affiliate-manager/{locationId}/payouts` | v3 |  |

## G. Platform & Admin (93 operations)

| St | Tool name | Spec file | operationId | Method + path | Version | Note |
|----|-----------|-----------|-------------|---------------|---------|------|
| [x] | `ghl_oauth_get_installed_location` | oauth.json | get-installed-location | `GET /oauth/installedLocations` | 2021-07-28 |  |
| [x] | `ghl_oauth_get_location_access_token` | oauth.json | get-location-access-token | `POST /oauth/locationToken` | 2021-07-28 |  |
| [x] | `ghl_user_get_by_location` | users.json | get-user-by-location | `GET /users/` | 2021-07-28 | DEPRECATED (registered, flagged) |
| [x] | `ghl_business_delete` | v3/businesses-v3.json | delete-Business | `DELETE /businesses/{businessId}` | v3 |  |
| [x] | `ghl_business_get` | v3/businesses-v3.json | get-business | `GET /businesses/{businessId}` | v3 |  |
| [x] | `ghl_business_update` | v3/businesses-v3.json | update-business | `PUT /businesses/{businessId}` | v3 |  |
| [x] | `ghl_business_get_businesses_by_location` | v3/businesses-v3.json | get-businesses-by-location | `GET /businesses/` | v3 |  |
| [x] | `ghl_business_create` | v3/businesses-v3.json | create-business | `POST /businesses/` | v3 |  |
| [x] | `ghl_company_get` | v3/companies-v3.json | get-company | `GET /companies/{companyId}` | v3 |  |
| [x] | `ghl_custom_menu_delete` | v3/custom-menus-v3.json | delete-custom-menu | `DELETE /custom-menus/{customMenuId}` | v3 |  |
| [x] | `ghl_custom_menu_get_by_id` | v3/custom-menus-v3.json | get-custom-menu-by-id | `GET /custom-menus/{customMenuId}` | v3 |  |
| [x] | `ghl_custom_menu_update` | v3/custom-menus-v3.json | update-custom-menu | `PUT /custom-menus/{customMenuId}` | v3 |  |
| [x] | `ghl_custom_menu_list` | v3/custom-menus-v3.json | get-custom-menus | `GET /custom-menus/` | v3 |  |
| [x] | `ghl_custom_menu_create` | v3/custom-menus-v3.json | create-custom-menu | `POST /custom-menus/` | v3 |  |
| [x] | `ghl_location_get_conversation_channel` | v3/locations-v3.json | get-conversation-channel | `GET /locations/{locationId}/conversationChannels/{type}` | v3 |  |
| [x] | `ghl_location_delete_custom_field` | v3/locations-v3.json | delete-custom-field | `DELETE /locations/{locationId}/customFields/{id}` | v3 |  |
| [x] | `ghl_location_get_custom_field` | v3/locations-v3.json | get-custom-field | `GET /locations/{locationId}/customFields/{id}` | v3 |  |
| [x] | `ghl_location_update_custom_field` | v3/locations-v3.json | update-custom-field | `PUT /locations/{locationId}/customFields/{id}` | v3 |  |
| [x] | `ghl_location_upload_file_custom_fields` | v3/locations-v3.json | upload-file-customFields | `POST /locations/{locationId}/customFields/upload` | v3 |  |
| [x] | `ghl_location_get_custom_fields` | v3/locations-v3.json | get-custom-fields | `GET /locations/{locationId}/customFields` | v3 |  |
| [x] | `ghl_location_create_custom_field` | v3/locations-v3.json | create-custom-field | `POST /locations/{locationId}/customFields` | v3 |  |
| [x] | `ghl_location_delete_custom_value` | v3/locations-v3.json | delete-custom-value | `DELETE /locations/{locationId}/customValues/{id}` | v3 |  |
| [x] | `ghl_location_get_custom_value` | v3/locations-v3.json | get-custom-value | `GET /locations/{locationId}/customValues/{id}` | v3 |  |
| [x] | `ghl_location_update_custom_value` | v3/locations-v3.json | update-custom-value | `PUT /locations/{locationId}/customValues/{id}` | v3 |  |
| [x] | `ghl_location_get_custom_values` | v3/locations-v3.json | get-custom-values | `GET /locations/{locationId}/customValues` | v3 |  |
| [x] | `ghl_location_create_custom_value` | v3/locations-v3.json | create-custom-value | `POST /locations/{locationId}/customValues` | v3 |  |
| [x] | `ghl_location_get_permissions` | v3/locations-v3.json | get-location-permissions | `GET /locations/{locationId}/permissions` | v3 |  |
| [x] | `ghl_location_update_permissions` | v3/locations-v3.json | update-location-permissions | `PUT /locations/{locationId}/permissions` | v3 |  |
| [x] | `ghl_location_delete_recurring_task` | v3/locations-v3.json | delete-recurring-task | `DELETE /locations/{locationId}/recurring-tasks/{id}` | v3 |  |
| [x] | `ghl_location_get_recurring_task_by_id` | v3/locations-v3.json | get-recurring-task-by-id | `GET /locations/{locationId}/recurring-tasks/{id}` | v3 |  |
| [x] | `ghl_location_update_recurring_task` | v3/locations-v3.json | update-recurring-task | `PUT /locations/{locationId}/recurring-tasks/{id}` | v3 |  |
| [x] | `ghl_location_create_recurring_task` | v3/locations-v3.json | create-recurring-task | `POST /locations/{locationId}/recurring-tasks` | v3 |  |
| [x] | `ghl_location_delete_tag` | v3/locations-v3.json | delete-tag | `DELETE /locations/{locationId}/tags/{tagId}` | v3 |  |
| [x] | `ghl_location_get_tag_by_id` | v3/locations-v3.json | get-tag-by-id | `GET /locations/{locationId}/tags/{tagId}` | v3 |  |
| [x] | `ghl_location_update_tag` | v3/locations-v3.json | update-tag | `PUT /locations/{locationId}/tags/{tagId}` | v3 |  |
| [x] | `ghl_location_get_tags` | v3/locations-v3.json | get-location-tags | `GET /locations/{locationId}/tags` | v3 |  |
| [x] | `ghl_location_create_tag` | v3/locations-v3.json | create-tag | `POST /locations/{locationId}/tags` | v3 |  |
| [x] | `ghl_location_task_search` | v3/locations-v3.json | task-search | `POST /locations/{locationId}/tasks/search` | v3 |  |
| [x] | `ghl_location_delete_an_email_sms_template` | v3/locations-v3.json | DELETE-an-email-sms-template | `DELETE /locations/{locationId}/templates/{id}` | v3 |  |
| [x] | `ghl_location_get_all_or_email_sms_templates` | v3/locations-v3.json | GET-all-or-email-sms-templates | `GET /locations/{locationId}/templates` | v3 |  |
| [x] | `ghl_location_get_timezones` | v3/locations-v3.json | get-timezones | `GET /locations/{locationId}/timezones` | v3 |  |
| [x] | `ghl_location_delete` | v3/locations-v3.json | delete-location | `DELETE /locations/{locationId}` | v3 |  |
| [x] | `ghl_location_get` | v3/locations-v3.json | get-location | `GET /locations/{locationId}` | v3 |  |
| [x] | `ghl_location_update` | v3/locations-v3.json | put-location | `PUT /locations/{locationId}` | v3 |  |
| [x] | `ghl_location_create` | v3/locations-v3.json | create-location | `POST /locations/` | v3 |  |
| [x] | `ghl_location_search` | v3/locations-v3.json | search-locations | `GET /locations/search` | v3 |  |
| [x] | `ghl_marketplace_uninstall_application` | v3/marketplace-v3.json | uninstall-application | `DELETE /marketplace/app/{appId}/installations` | v3 |  |
| [x] | `ghl_marketplace_get_installer_details` | v3/marketplace-v3.json | get-installer-details | `GET /marketplace/app/{appId}/installations` | v3 |  |
| [x] | `ghl_marketplace_get_rebilling_config` | v3/marketplace-v3.json | get-rebilling-config-for-app | `GET /marketplace/app/{appId}/rebilling-config/location/{locationId}` | v3 |  |
| [x] | `ghl_marketplace_delete_charge` | v3/marketplace-v3.json | deleteCharge | `DELETE /marketplace/billing/charges/{chargeId}` | (none) |  |
| [x] | `ghl_marketplace_get_specific_charge` | v3/marketplace-v3.json | getSpecificCharge | `GET /marketplace/billing/charges/{chargeId}` | (none) |  |
| [x] | `ghl_marketplace_has_funds` | v3/marketplace-v3.json | hasFunds | `GET /marketplace/billing/charges/has-funds` | (none) |  |
| [x] | `ghl_marketplace_get_charges` | v3/marketplace-v3.json | getCharges | `GET /marketplace/billing/charges` | (none) |  |
| [x] | `ghl_marketplace_charge` | v3/marketplace-v3.json | charge | `POST /marketplace/billing/charges` | (none) |  |
| [x] | `ghl_marketplace_migrate_connection` | v3/marketplace-v3.json | migrateConnection | `POST /marketplace/external-auth/migration` | v3 |  |
| [x] | `ghl_oauth_get_installed_locations` | v3/oauth-v3.json | get-installed-location | `GET /oauth/installed-locations` | v3 |  |
| [x] | `ghl_oauth_exchange_location_token` | v3/oauth-v3.json | get-location-access-token | `POST /oauth/location-token` | v3 |  |
| [x] | `ghl_oauth_get_access_token` | v3/oauth-v3.json | get-access-token | `POST /oauth/token` | v3 |  |
| [x] | `ghl_saas_get_agency_plans_deprecated` | v3/saas-v3.json | get-agency-plans-deprecated | `GET /saas-api/public-api/agency-plans/{companyId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_bulk_disable_deprecated` | v3/saas-v3.json | bulk-disable-saas-deprecated | `POST /saas-api/public-api/bulk-disable-saas/{companyId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_bulk_enable_deprecated` | v3/saas-v3.json | bulk-enable-saas-deprecated | `POST /saas-api/public-api/bulk-enable-saas/{companyId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_update_location_wallet_balance` | v3/saas-v3.json | updateLocationWalletBalance | `POST /saas-api/public-api/companies/{companyId}/locations/{locationId}/wallet-balance/complimentary-credits` | v3 |  |
| [x] | `ghl_saas_get_location_wallet_balance` | v3/saas-v3.json | getLocationWalletBalance | `GET /saas-api/public-api/companies/{companyId}/locations/{locationId}/wallet-balance` | v3 |  |
| [x] | `ghl_saas_enable_location_deprecated` | v3/saas-v3.json | enable-saas-location-deprecated | `POST /saas-api/public-api/enable-saas/{locationId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_get_location_subscription_deprecated` | v3/saas-v3.json | get-location-subscription-deprecated | `GET /saas-api/public-api/get-saas-subscription/{locationId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_get_locations_by_stripe_id_deprecated` | v3/saas-v3.json | locations-deprecated | `GET /saas-api/public-api/locations` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_pause_location_deprecated` | v3/saas-v3.json | pause-location-deprecated | `POST /saas-api/public-api/pause/{locationId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_get_locations_deprecated` | v3/saas-v3.json | get-saas-locations-deprecated | `GET /saas-api/public-api/saas-locations/{companyId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_get_plan_deprecated` | v3/saas-v3.json | get-saas-plan-deprecated | `GET /saas-api/public-api/saas-plan/{planId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_update_rebilling_deprecated` | v3/saas-v3.json | update-rebilling-deprecated | `POST /saas-api/public-api/update-rebilling/{companyId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_update_saas_subscription_deprecated` | v3/saas-v3.json | generate-payment-link-deprecated | `PUT /saas-api/public-api/update-saas-subscription/{locationId}` | v3 | DEPRECATED (registered, flagged) |
| [x] | `ghl_saas_get_agency_plans` | v3/saas-v3.json | get-agency-plans | `GET /saas/agency-plans/{companyId}` | v3 |  |
| [x] | `ghl_saas_allow_attach_rebilling` | v3/saas-v3.json | allow-attach-rebilling | `POST /saas/allow-attach-rebilling/{locationId}` | v3 |  |
| [x] | `ghl_saas_bulk_disable` | v3/saas-v3.json | bulk-disable-saas | `POST /saas/bulk-disable-saas/{companyId}` | v3 |  |
| [x] | `ghl_saas_bulk_enable` | v3/saas-v3.json | bulk-enable-saas | `POST /saas/bulk-enable-saas/{companyId}` | v3 |  |
| [x] | `ghl_saas_enable_location` | v3/saas-v3.json | enable-saas-location | `POST /saas/enable-saas/{locationId}` | v3 |  |
| [x] | `ghl_saas_get_location_subscription` | v3/saas-v3.json | get-location-subscription | `GET /saas/get-saas-subscription/{locationId}` | v3 |  |
| [x] | `ghl_saas_get_locations_by_stripe_id` | v3/saas-v3.json | locations | `GET /saas/locations` | v3 |  |
| [x] | `ghl_saas_pause_location` | v3/saas-v3.json | pause-location | `POST /saas/pause/{locationId}` | v3 |  |
| [x] | `ghl_saas_get_locations` | v3/saas-v3.json | get-saas-locations | `GET /saas/saas-locations/{companyId}` | v3 |  |
| [x] | `ghl_saas_get_plan` | v3/saas-v3.json | get-saas-plan | `GET /saas/saas-plan/{planId}` | v3 |  |
| [x] | `ghl_saas_update_rebilling` | v3/saas-v3.json | update-rebilling | `POST /saas/update-rebilling/{companyId}` | v3 |  |
| [x] | `ghl_saas_update_saas_subscription` | v3/saas-v3.json | generate-payment-link | `PUT /saas/update-saas-subscription/{locationId}` | v3 |  |
| [x] | `ghl_snapshot_list` | v3/snapshots-v3.json | get-custom-snapshots | `GET /snapshots/` | v3 |  |
| [x] | `ghl_snapshot_create_share_link` | v3/snapshots-v3.json | create-snapshot-share-link | `POST /snapshots/share/link` | v3 |  |
| [x] | `ghl_snapshot_get_latest_push` | v3/snapshots-v3.json | get-latest-snapshot-push | `GET /snapshots/snapshot-status/{snapshotId}/location/{locationId}` | v3 |  |
| [x] | `ghl_snapshot_get_pushes_between_dates` | v3/snapshots-v3.json | get-snapshot-push | `GET /snapshots/snapshot-status/{snapshotId}` | v3 |  |
| [x] | `ghl_user_delete` | v3/users-v3.json | delete-user | `DELETE /users/{userId}` | v3 | SPEC BUG: operation-level parameters omits the userId path parameter (only the GET sibling declares it) in both users.json and v3/users-v3.json, despite sharing the same {userId} path template. regist |
| [x] | `ghl_user_get` | v3/users-v3.json | get-user | `GET /users/{userId}` | v3 |  |
| [x] | `ghl_user_update` | v3/users-v3.json | update-user | `PUT /users/{userId}` | v3 | SPEC BUG: operation-level parameters omits the userId path parameter (only the GET sibling declares it) in both users.json and v3/users-v3.json, despite sharing the same {userId} path template. regist |
| [x] | `ghl_user_create` | v3/users-v3.json | create-user | `POST /users/` | v3 |  |
| [x] | `ghl_user_filter_by_email` | v3/users-v3.json | filter-users-by-email | `POST /users/search/filter-by-email` | v3 |  |
| [x] | `ghl_user_search` | v3/users-v3.json | search-users | `GET /users/search` | v3 |  |

## Exceptions summary (16)

- `PUT /ad-publishing/facebook/ads-v2` — v3 twin registered under ad-publishing (PUT /ad-publishing/facebook/ads, fb-upsert-ad)
- `POST /ad-publishing/facebook/adsets/{adsetId}/duplicate` — v3 twin registered under ad-publishing (POST /ad-publishing/facebook/adsets/{adSetId}/duplicate, fb-duplicate-adset)
- `POST /ad-publishing/facebook/adsets/{adsetId}/pause` — v3 twin registered under ad-publishing (POST /ad-publishing/facebook/adsets/{adSetId}/pause, fb-pause-adset)
- `POST /ad-publishing/facebook/adsets/{adsetId}/resume` — v3 twin registered under ad-publishing (POST /ad-publishing/facebook/adsets/{adSetId}/resume, fb-resume-adset)
- `DELETE /ad-publishing/facebook/adsets/{adsetId}` — v3 twin registered under ad-publishing (DELETE /ad-publishing/facebook/adsets/{adSetId}, fb-delete-adset)
- `GET /social-media-posting/oauth/facebook/start` — Browser-only OAuth initiation flow (spec: 'Open the API in a window ... User is navigated to Facebook login OAuth screen ... listen on window object for message'). Result is delivered via window.postMessage in a browser context, not a server-to-server HTTP response — not callable from an MCP server. Complete the flow in an actual browser, then use ghl_social_get_facebook_page_group / ghl_social_attach_facebook_page_group with the resulting accountId.
- `GET /social-media-posting/oauth/google/start` — Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_google_locations / ghl_social_set_google_locations after completing the flow in a browser.
- `GET /social-media-posting/oauth/instagram/start` — Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_instagram_page_group / ghl_social_attach_instagram_page_group after completing the flow in a browser.
- `GET /social-media-posting/oauth/linkedin/start` — Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_linkedin_page_profile / ghl_social_attach_linkedin_page_profile after completing the flow in a browser.
- `GET /social-media-posting/oauth/tiktok-business/start` — Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_tiktok_business_profile after completing the flow in a browser.
- `GET /social-media-posting/oauth/tiktok/start` — Browser-only OAuth initiation flow, same pattern as the Facebook start endpoint (window.postMessage response, not a normal HTTP response). Not callable server-to-server. Use ghl_social_get_tiktok_profile / ghl_social_attach_tiktok_profile after completing the flow in a browser.
- `GET /social-media-posting/oauth/twitter/start` — Browser-only OAuth initiation flow AND deprecated per the spec (Twitter/X). Not callable server-to-server (window.postMessage response). No documented replacement named in the spec.
- `POST /conversations/messages/review-reply` — Spec description states verbatim: 'This endpoint is internal-only and is not supported for OAuth or public API integrations. It will be removed from the public OpenAPI specification in a future release.' Unusable by an API-key/OAuth-authenticated MCP server; no alternative public endpoint is documented for Google-review replies.
- `POST /conversations/messages/upload/complete` — Spec description states verbatim: 'This endpoint is internal-only and is not supported for OAuth or public API integrations. It will be removed from the public OpenAPI specification in a future release.' Unusable by an API-key/OAuth-authenticated MCP server. Functional replacement for file uploads: POST /conversations/messages/upload (ghl_conversation_upload_file_attachments), which is not deprecated.
- `POST /conversations/messages/upload/initiate` — Same internal-only/no-OAuth-support disclaimer as POST /conversations/messages/upload/complete (part of the same 2-step GCS signed-URL flow). Unusable by an API-key/OAuth-authenticated MCP server. Functional replacement: POST /conversations/messages/upload (ghl_conversation_upload_file_attachments).
- `GET /social-media-posting/oauth/{platform}/start` — v3 generic browser-only OAuth initiation flow ('Start OAuth Flow (Step 1 of 3)' — spec explicitly says 'Open this API in a browser window (not via cURL)'; result delivered via window.postMessage). Not callable server-to-server. After completing the flow in a browser, use GET /social-media-posting/{locationId}/{platform}/accounts/{accountId} (ghl_social_get_oauth_accounts) with the resulting accountId, per the spec's own documented 3-step flow.
