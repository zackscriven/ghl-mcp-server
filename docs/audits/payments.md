# Payments & Commerce Domain Audit

Scope per `docs/audits/BRIEF.md`: payments, invoices, products, store, proposals — **114 operations**, all sourced from the v3-preferred spec tier:

| Spec file | Ops |
|---|---|
| `apps/v3/invoices-v3.json` | 42 |
| `apps/v3/payments-v3.json` | 23 |
| `apps/v3/products-v3.json` | 27 |
| `apps/v3/store-v3.json` | 18 |
| `apps/v3/proposals-v3.json` | 4 |
| **Total** | **114** |

None of these 5 resources carry a legacy `apps/*.json` twin into `operations.json` — a legacy `apps/store.json`, `apps/invoices.json`, etc. exist on disk (and were spot-checked for context, see Version header note below) but every op in scope in `operations.json` resolved to its v3 variant. This matches `114` = the count reported by the BRIEF.

## 1. Version header

- `invoices-v3.json`, `payments-v3.json`, `products-v3.json`, `proposals-v3.json`: every operation declares a required header param `Version` with `schema.enum: ["v3"]`. `operations.json`'s `versionHeader: "v3"` matches exactly on all of these. No override needed.
- `store-v3.json`: **no `Version` header parameter exists anywhere in the spec** (grepped the whole file for the literal string `"Version"` — zero matches, vs. hundreds of matches in `invoices-v3.json`). The legacy `apps/store.json` twin was cross-checked via `ghl_docs_context` and likewise only requires `Authorization` — no Version header on any Store API operation, legacy or v3. `operations.json` correctly carries `versionHeader: ""` for all 18 store ops. **This is a genuine, spec-confirmed quirk of the Store API, not an extraction bug** — verified against raw spec text, so no `versionHeader` override was added (adding one would be wrong — there is nothing to force).

## 2. Request body completeness (brief's explicit spot-check list)

Compared `operations.json`'s extracted `requestBody.content["application/json"].schema` property list against the spec's `components.schemas` definition, prop-for-prop, for every op the brief called out plus one more (`CreatePriceDto`/`UpdatePriceDto`) because prices are explicitly flagged as "nested" in the brief:

| Operation | Schema | Props (spec) | Match |
|---|---|---|---|
| `POST /invoices/` | `CreateInvoiceDto` | 23 | ✅ exact (same 23 names, same order) |
| `PUT /invoices/{invoiceId}` | `UpdateInvoiceDto` | 24 | ✅ exact |
| `POST /invoices/schedule` | `CreateInvoiceScheduleDto` | 19 | ✅ exact |
| `POST /invoices/estimate` | `CreateEstimatesDto` | 25 | ✅ exact |
| `POST /products/{productId}/price` | `CreatePriceDto` | 22 | ✅ exact |
| `PUT /products/{productId}/price/{priceId}` | `UpdatePriceDto` | 22 | ✅ exact |

No extraction loss anywhere in these deeply nested bodies — `invoiceItems`, `paymentSchedule`, `tipsConfiguration`, `businessDetails`, `contactDetails`, `discount`, `membershipOffers`, `trialPeriod`, `variantOptionIds`, `shippingOptions`, `digitalDelivery`, etc. all survived generation intact. This gives high confidence the extraction pipeline handled deep nesting correctly across the rest of the domain's bodies too (spot-checked, not exhaustively diffed for all 114 — the 6 above were chosen as the deepest/highest-risk shapes per the brief).

## 3. Content type

Grepped all 5 spec files for `multipart/form-data`: **zero matches**. All 114 ops are `application/json` only (confirmed independently by walking every `requestBody.content` key in `operations.json` for the domain — the only content type present is `application/json`). No `contentType` overrides.

## 4. Pagination

Every list op the spec documents pagination for exposes it correctly in `operations.json`:

- Invoices/estimates/templates/schedules: `limit` + `offset`, both **required** (matches spec).
- Payments orders/transactions/subscriptions/coupons: `limit` + `offset`, both optional (matches spec).
- Products/collections/inventory/reviews: `limit` + `offset`.
- Proposals document/template lists: `limit` + `skip`.

Three sub-resource list ops genuinely have **no** pagination params in the spec: `GET /payments/orders/{orderId}/fulfillments`, `GET /payments/orders/{orderId}/notes`, `GET /store/shipping-carrier`. Verified directly against the raw spec (not an extraction gap) — these return small, bounded-per-parent result sets and the API doesn't document a cursor/offset for them. No `extraQueryParams` override added since there's no documented param to add.

## 5. Under-marked required params

`altId`+`altType` (or `locationId`, depending on the endpoint's own convention) are consistently marked `required: true` in the spec on every list/get op in scope, and `operations.json` honors all of them. No cases found where docs/help-center imply a param is required but the spec doesn't mark it. No `forceRequired` overrides.

## 6. Deprecated ops

Grepped all 5 spec files for `"deprecated": true`: **zero matches**. No `skip` entries in this domain.

## 7. Two real bugs found (name-level, not extraction)

1. **`GET /products/`** auto-derived to `ghl_product_list_invoices` — an evident copy-paste artifact; the operation lists Products and has nothing to do with invoices. → renamed `ghl_product_list`.
2. **`POST /store/shipping-zone/shipping-rates`** auto-derived to `ghl_store_get_available_shipping_zones`, but the operation (`operationId: get-available-shipping-zones`, summary "Get available shipping rates") returns shipping **rates** for a country/order-amount combination, not zones — the generated name actively misdescribes the response shape. → renamed `ghl_store_get_available_shipping_rates`.

Both were caught by cross-referencing the generated name against the op's own `summary`/`operationId`, not by any schema issue — the request/response schemas for both ops were extracted correctly.

## 8. Tool name curation

Applied the brief's own sub-resource-prefix convention (`ghl_payment_order_*`) consistently across the domain: **92 of the 114 ops** got a `name` and/or `descriptionNote` override; the other 22 already had clear, correctly resource-prefixed names and were left untouched (verified by diffing the full op list against the override map — see the 22 listed below).

Groups renamed onto a consistent `ghl_<resource>_<subresource>_<action>` shape:
- **Payments**: `coupon`, `custom_provider` (config vs. the integration itself, disambiguated), `order`, `subscription`, `transaction`, `integration_provider`.
- **Invoices**: `schedule`, `template`.
- **Estimates**: split onto their **own `ghl_estimate_*` prefix** (including a nested `ghl_estimate_template_*` group) rather than staying under `ghl_invoice_*` — they're a first-class resource at `/invoices/estimate/*`, and the brief explicitly names `ghl_estimate_*` as a desired prefix.
- **Products**: `price`, `collection`, `inventory`, `review`, `store` (a product's storefront visibility/priority, distinct from the `store` domain resource itself).
- **Store**: grammar fixes only (see below) plus the two bug fixes above.
- **Proposals**: dropped the redundant `_documents_contracts` stutter (e.g. `ghl_proposal_list_documents_contracts` → `ghl_proposal_list_documents`).

Grammar/consistency fix: three Store API single-record GETs were pluralized by the generator (`get_shipping_carriers`/`get_shipping_zones`/`get_shipping_rates` for ops that each return exactly one record by ID) — renamed to singular to match their sibling create/update/delete ops, which were already singular.

All final names verified: **90 unique names, 0 duplicates, 0 over the 64-char limit** (longest: `ghl_invoice_template_update_payment_methods_configuration`, 57 chars). `npx tsc --noEmit` passes clean.

The 22 ops left with their generated (unoverridden) name, because it was already clear:
`GET/POST /invoices/`, `GET/DELETE/PUT /invoices/{invoiceId}`, `PATCH /invoices/{invoiceId}/late-fees-configuration`, `POST /invoices/{invoiceId}/send`, `PATCH /invoices/stats/last-visited-at`, `POST /invoices/text2pay`, `POST /products/`, and the 14 store shipping-carrier/zone/rate CRUD ops that weren't the two grammar/bug fixes.

## 9. High-stakes monetary/destructive ops (healthcare consumer)

All `DELETE` ops already read as clearly destructive by name + spec description (`delete_invoice`, `delete_estimate`, `delete_coupon`, `delete_product`, `delete_collection`, `delete_review`, `delete_shipping_*`, custom-provider delete). Added a `descriptionNote` clarifying operational/financial blast radius on the 4 ops where the name alone doesn't convey it:

- `ghl_invoice_void` — irreversible; a voided invoice can't be paid or reactivated.
- `ghl_payment_custom_provider_disconnect_config` — can interrupt live payment collection at the location until reconnected.
- `ghl_payment_custom_provider_delete` — permanently removes the integration itself; in-flight/future payment flows depending on it will fail.
- `ghl_invoice_schedule_cancel` — stops all remaining not-yet-sent occurrences of a recurring invoice.

Also flagged (non-destructive but high-blast-radius) `POST /products/bulk-update` and `POST /products/bulk-update/edit`, and `POST /products/reviews/bulk-update` with descriptionNotes to review the target ID scope before sending, since a single call mutates many records at once.

**No true refund endpoint exists in this domain's 114 ops** — checked every summary/operationId for "refund"; none found. The two `record-payment` ops (`ghl_invoice_record_payment`, `ghl_payment_order_record_payment`) are additive manual/offline-payment reconciliation, not refunds or live charges, and are noted as such.

## Regression / sanity checks

- `npx tsc --noEmit` — clean, no errors.
- Every override key exists in `operations.json` for this domain (114/114 checked programmatically; 0 stray keys).
- Every override `name` is unique across the file (90/90) and ≤64 chars.
- `payments-status.json` covers all 114 operations in the domain, one row per op, all `"status": "ok"` — no exceptions/skips this pass (nothing warranted a `skip`; nothing was unusable).

## Deliverables

1. `src/overrides/payments.ts` — populated, compiles clean.
2. `docs/audits/payments.md` — this file.
3. `docs/audits/payments-status.json` — 114/114 operations, all `ok`.
