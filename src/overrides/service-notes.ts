/**
 * Service-level guidance prepended to every tool of a service. Keyed by spec
 * basename (see naming.specBase). Each note states ONLY what the live
 * marketplace docs (pulled 2026-10-28) say — no inferred behaviour.
 */
export const SERVICE_NOTES: Record<string, string> = {
  workflows:
    "WORKFLOW API — limited availability: enabled for selected sub-accounts only; others get 403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION (not a token or scope problem). " +
    "Suggested order: get step types -> build the definition -> validate (validate_workflow_definition, read-only) -> create (always lands in `draft`) -> publish via update status. " +
    "Rate limits: integration daily quota + 10s burst (X-RateLimit-* headers) AND a per-sub-account budget per 10s window with reads and writes counted separately; no Retry-After is sent. " +
    "Logs: default and max range 30 days; retained 60 days.",
  projects:
    "PROJECT MANAGEMENT API — hierarchy is spaces -> folders -> lists -> tasks (+ comments, space statuses, recurring tasks). " +
    "Task batch-get is RBAC-filtered (inaccessible ids are omitted, not errors) and omits embedded subtasks. " +
    "`position` is an opaque server-assigned lexorank string; there is no public reorder endpoint. " +
    "Recurring tasks use `owners`/`contactIds` and `rruleOptions.intervalType` (task create uses `assignees`/`contactId`). " +
    "Task search supports `updatedAt` filtering/sorting for incremental sync. The docs do not describe what a delete cascades to — treat every delete as destructive.",
  "clientportal-ai":
    "CLIENT PORTAL AI BUILDER API (/ai-builder-api) — side-effecting: opens/edits sandboxes and starts builds. Edit a sandbox only once `sandbox.status` is `ready`; checkpoint after edits and before starting the run that builds them; 409 means a cloud build owns the sandbox or it is not running.",
  "countdown-timer": "COUNTDOWN TIMER API — timers belong to the access token's location.",
  files: "FILES API — resolves a share-link slug to the file (sub-account token, files.readonly).",
  courses: "COURSES API — the {productId} path parameter is the course (product) id.",
};
