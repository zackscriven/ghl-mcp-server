# Final Build Report — ghl-mcp-server-v2 (2026-07-16)

Executed per `HD/MCP/prompts/2026-07-16_ghl-custom-mcp-server-build-prompt.md`. Orchestrator on the frontier model; 8 domain audits dispatched in parallel to Sonnet-class sub-agents. No live GHL API call was made at any point (Hard Rule honored); no existing MCP registration was touched.

## Coverage result

- **667 unique operations** enumerated (deduped from 1,203 raw across 84 spec files; v3 spec variant canonical where twins exist).
- **651 tools registered — 97.6%** of the enumerated surface.
- **16 explicit exceptions — 2.4%**, every one itemized with a reason in `api-coverage-checklist.md`:
  - 5 × ad-publishing legacy near-duplicates (cosmetic path diffs defeated dedupe; v3 twin registered instead)
  - 8 × social-media OAuth `/start` endpoints (browser-only flows: response arrives via `window.postMessage`, not callable server-to-server; the follow-up attach endpoints ARE registered)
  - 3 × conversations endpoints whose spec text states verbatim they are internal-only and unsupported for OAuth/public API integrations (review-reply, upload/initiate, upload/complete; the public `POST /conversations/messages/upload` is registered as the working replacement)
- Zero silent omissions: every one of the 667 checklist rows carries `[x]` or `[E]`+reason.

## Key engineering calls (documented per the brief's instruction to decide and document)

1. **Spec-driven generation instead of hand-written per-tool Zod schemas.** The full official OpenAPI corpus was available on disk (the exact corpus the `ghl-docs` MCP indexes — same ground truth, untruncated). Request schemas are extracted verbatim and served as tool input schemas, so a field can only be absent if GHL's own spec omits it. Hand-transcribing ~667 operations is precisely how the old connector dropped `assignedTo` — this architecture makes that failure mode structurally impossible. Sub-agents therefore audited + curated (names, version headers, content types, exceptions) rather than re-typing schemas. Validation at call time uses Ajv against the same schemas.
2. **Per-operation Version headers, from the spec file documenting that operation.** Distribution in the final registry: 494 × `v3`, 117 × `2021-07-28`, 10 × `2021-04-15`, 30 × none (e.g. the store spec documents no Version header at all — verified deliberate). Notable: the ad-publishing *v3* spec itself mandates `2021-07-28` for 91 of its 95 ops — proof that a global header (or even a global per-tier header) would be wrong.
3. **v3-preferred dedupe with a curated escape hatch.** The calendars audit caught the one place blind v3-preference was wrong: the 5 Calendar Resources ops are `deprecated: true` in the v3 spec ("Services V1") while the legacy `2021-04-15` variant is current — fixed by `versionHeader` overrides.
4. **Default read-only.** All non-GET calls are blocked unless `GHL_ENABLE_WRITES=true` (arguments still validated, so writes can be dry-run). Chosen because the primary consumer is a live healthcare-practice CRM (PHI-adjacent).
5. **Registry-level fixes for official spec bugs**: path params omitted by the spec (`GET /conversations/messages/{id}`, `GET /conversations/messages/email/{id}`, `PUT|DELETE /users/{userId}`) are inferred from the URL template; bodies with empty spec schemas (`POST /forms/upload-custom-files`) get a permissive object instead of disappearing.
6. **Real multipart + form-urlencoded support** in the shared request helper (file inputs as `{filePath}`), so upload endpoints and `POST /oauth/token` are genuinely callable, not just registered.

## Confirmed-regression verification (the 7 failures the rebuild exists to fix)

All verified fixed against the built registry (see `docs/evaluation.xml` for the checkable assertions and `docs/audits/*` for detail):

1. Opportunity update: all 9 body fields ✓
2. Contact update: all 20 body fields ✓
3. Contact task create: schema enforces `title`+`dueDate`+`completed` (the 422 root cause) and exposes `assignedTo` ✓
4. Opportunity search: `startAfter`/`startAfterId`/`page`/`limit`/`contactId` + ~15 more filters pass through verbatim ✓
5. Media list: `type`/`altType`/`altId`/`sortBy`/`sortOrder` required per spec ✓
6. Social post create: schema faithful; live-regression warning (2026-07-04) carried in the description ✓
7. Version tiers: resolved per-operation, never global ✓

## Genuine upstream spec gaps found (documented, not fabricated around)

- `POST /contacts/search`, `POST|PUT /objects/{schemaKey}/records[/{id}]`: official spec bodies are empty `properties: {}` — exposed as permissive objects with explanatory descriptions.
- `POST /forms/upload-custom-files`: empty multipart schema — permissive body + multipart support.
- `PUT|DELETE /users/{userId}`, `GET /conversations/messages[/email]/{id}`: missing path-param declarations — inferred.
- Legacy opportunities spec uses snake_case field names vs v3 camelCase — likely the root cause of the old connector being built against the wrong shape.

## Acceptance gate (mcp-builder Phase 3/4)

- `npm run build` clean; stdio smoke test passed: initialize → tools/list (651) → write-gate block message → actionable no-API-key error → Ajv rejection of malformed args with precise messages.
- 10 evaluation Q&A pairs in `docs/evaluation.xml`, each answer independently verified against the built registry this session.

## Open items for Zack (operator)

1. Live read-only smoke test with a real `GHL_API_KEY` (Private Integration token), then a supervised write test with `GHL_ENABLE_WRITES=true` on a low-stakes record.
2. Decide registration: run alongside the existing `ghl-mcp-server` or retire it. Consider `GHL_ENABLED_DOMAINS` to keep client context small (651 tools is a lot for tools/list).
3. AppleDouble `._*` sidecars and two empty scratch files under `docs/audits/` were left by the audit agents (bridge cannot delete) — clear when convenient.
4. When GHL updates its docs repo: `npm run extract && npm run build`, re-check the exceptions list.
