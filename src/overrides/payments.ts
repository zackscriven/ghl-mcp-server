/** Curated overrides for the payments domain — populated by the domain audit. */
import type { DomainOverrides } from "../types.js";

export const paymentsOverrides: DomainOverrides = {
  domain: "payments",
  notes: [
    "Scope: 114 ops across 5 spec files, all sourced exclusively from the v3 tier (apps/v3/invoices-v3.json 42, apps/v3/payments-v3.json 23, apps/v3/products-v3.json 27, apps/v3/store-v3.json 18, apps/v3/proposals-v3.json 4). None of these 5 resources have a legacy (apps/*.json) twin carried into operations.json — legacy apps/invoices.json etc. exist on disk but every op in scope resolved to its v3 preferred variant.",
    "Version header: invoices/payments/products/proposals all declare a required header param `Version` with `enum: [\"v3\"]` on every operation — operations.json's versionHeader:'v3' matches exactly, no override needed. store-v3.json is the one exception: it has NO Version header parameter anywhere in the spec (confirmed by direct grep — zero matches for \"Version\" in the file, vs. hundreds in invoices-v3.json), and the legacy apps/store.json twin likewise only requires `Authorization`, no Version header. operations.json correctly carries versionHeader:'' for all 18 store ops. This is a genuine spec quirk (Store API doesn't gate on a Version header), not an extraction bug — verified against the raw spec, not overridden.",
    "Body schema completeness (brief's explicit spot-check list, all CONFIRMED byte-for-byte against the spec's components.schemas): POST /invoices/ (CreateInvoiceDto, 23 props) match; PUT /invoices/{invoiceId} (UpdateInvoiceDto, 24 props) match; POST /invoices/schedule (CreateInvoiceScheduleDto, 19 props) match; POST /invoices/estimate (CreateEstimatesDto, 25 props) match; POST /products/{productId}/price and PUT .../price/{priceId} (CreatePriceDto/UpdatePriceDto, 22 props each, including nested membershipOffers/trialPeriod/variantOptionIds/shippingOptions/digitalDelivery) match. No extraction loss found anywhere in the domain's nested bodies — the deep nesting (invoiceItems, paymentSchedule, tipsConfiguration, businessDetails, contactDetails, discount, etc.) all survived generation intact.",
    "Content type: all 114 ops are application/json only. Grepped all 5 spec files for 'multipart/form-data' — zero matches. No contentType overrides.",
    "Deprecated ops: none. Grepped all 5 spec files for '\"deprecated\": true' — zero matches. No skip entries.",
    "Pagination: every list-style op that the spec documents pagination for exposes it correctly in operations.json — invoices/estimates/templates/schedules use limit+offset (both required, matching spec); payments orders/transactions/subscriptions/coupons use limit+offset (optional, matching spec); products/collections/inventory/reviews use limit+offset; proposals document/template lists use limit+skip. Three sub-resource list ops genuinely have NO pagination in the spec (GET /payments/orders/{orderId}/fulfillments, GET /payments/orders/{orderId}/notes, GET /store/shipping-carrier — bounded per-parent or small result sets) — verified against the raw spec, not an extraction gap, no extraQueryParams override added since the API doesn't document accepting one.",
    "Required params: altId+altType (or locationId, depending on endpoint convention) are consistently marked required in the spec on every scoped list/get op and operations.json honors all of them. No under-marked-required cases found; no forceRequired overrides.",
    "Two real bugs found and fixed via name override (not extraction bugs — the request/response schemas were fine, only the derived tool name was wrong): (1) GET /products/ auto-derived to `ghl_product_list_invoices` — an apparent copy-paste artifact from the invoices domain; the operation has nothing to do with invoices (it lists Products). Renamed to `ghl_product_list`. (2) POST /store/shipping-zone/shipping-rates auto-derived to `ghl_store_get_available_shipping_zones`, but the op (operationId `get-available-shipping-zones`, summary 'Get available shipping rates') returns shipping RATES for a country/order-amount combination, not zones — the name actively misdescribes the response. Renamed to `ghl_store_get_available_shipping_rates`.",
    "Sub-resource prefix convention applied throughout per the brief's own example (ghl_payment_order_*): payments' coupon/custom-provider/order/subscription/transaction/integration-provider groups, invoices' schedule/template groups, and products' price/collection/inventory/review/store groups were all renamed onto a consistent `ghl_<resource>_<subresource>_<action>` shape (e.g. ghl_payment_coupon_create, ghl_invoice_schedule_cancel, ghl_product_price_update, ghl_store_upsert_settings for the create/update 'Create/Update Store Settings' op). Estimates were split onto their own `ghl_estimate_*` prefix (create/update/delete/send/list/etc. + a nested `ghl_estimate_template_*` group) per the brief's explicit ghl_estimate_* example — they're a first-class resource under /invoices/estimate/*, not really an invoice sub-action. Full list of ~60 renames is in the overrides map below; every name stays under the 64-char limit (longest is ghl_invoice_template_update_payment_methods_configuration at 57 chars) and starts with its domain's resource prefix, so no server-wide collision risk per the brief's 'stay within your prefix and you're safe' rule.",
    "Grammar/consistency fixes in store.json: three singular-vs-plural mismatches where the generated name pluralized a single-resource GET (get_shipping_carriers/get_shipping_zones/get_shipping_rates when each op returns exactly one record by ID) — renamed to singular (ghl_store_get_shipping_carrier / ghl_store_get_shipping_zone / ghl_store_get_shipping_rate) to match their sibling create/update/delete ops which are already singular.",
    "High-stakes monetary/destructive ops (healthcare consumer — brief's explicit concern): all DELETE ops already read as clearly destructive by name+description (delete_invoice, delete_estimate, delete_coupon, delete_product, delete_collection, delete_review, delete_shipping_*, custom_provider delete). Added descriptionNote clarifications on the 4 ops where the name alone doesn't convey the operational/financial blast radius: ghl_invoice_void (irreversible; invoice can't be paid or reactivated after), ghl_payment_custom_provider_disconnect_config (can interrupt live payment collection until reconnected), ghl_payment_custom_provider_delete (permanently removes the integration; in-flight payment flows using it will fail), and ghl_invoice_schedule_cancel (stops all remaining not-yet-sent occurrences of a recurring/scheduled invoice). No true refund endpoint exists in this domain's 114 ops (checked all summaries/operationIds for 'refund' — none found; record-payment ops are additive/manual-reconciliation, not refunds).",
    "No versionHeader, forceRequired, extraQueryParams, contentType, or skip overrides were needed anywhere in this domain — every override below is a `name` and/or `descriptionNote` curation only.",
  ],
  overrides: {
    // ---- invoices-v3.json (core invoice ops) ----
    "POST /invoices/{invoiceId}/record-payment": {
      name: "ghl_invoice_record_payment",
      descriptionNote: "Records a manual/offline payment against an invoice (e.g. cash, check). Does not process a live charge.",
    },
    "POST /invoices/{invoiceId}/void": {
      name: "ghl_invoice_void",
      descriptionNote: "Irreversible: marks the invoice as void. A voided invoice cannot be paid or reactivated afterward.",
    },
    "GET /invoices/generate-invoice-number": { name: "ghl_invoice_generate_number" },
    "GET /invoices/settings": { name: "ghl_invoice_get_settings" },

    // ---- invoices-v3.json (template sub-resource) ----
    "GET /invoices/template": { name: "ghl_invoice_template_list" },
    "POST /invoices/template": { name: "ghl_invoice_template_create" },
    "DELETE /invoices/template/{templateId}": { name: "ghl_invoice_template_delete" },
    "GET /invoices/template/{templateId}": { name: "ghl_invoice_template_get" },
    "PUT /invoices/template/{templateId}": { name: "ghl_invoice_template_update" },
    "PATCH /invoices/template/{templateId}/late-fees-configuration": {
      name: "ghl_invoice_template_update_late_fees_configuration",
    },
    "PATCH /invoices/template/{templateId}/payment-methods-configuration": {
      name: "ghl_invoice_template_update_payment_methods_configuration",
      descriptionNote: "Updates which payment methods are enabled on invoices created from this template.",
    },

    // ---- invoices-v3.json (schedule sub-resource — recurring invoices) ----
    "GET /invoices/schedule": { name: "ghl_invoice_schedule_list" },
    "POST /invoices/schedule": { name: "ghl_invoice_schedule_create" },
    "DELETE /invoices/schedule/{scheduleId}": { name: "ghl_invoice_schedule_delete" },
    "GET /invoices/schedule/{scheduleId}": { name: "ghl_invoice_schedule_get" },
    "PUT /invoices/schedule/{scheduleId}": { name: "ghl_invoice_schedule_update" },
    "POST /invoices/schedule/{scheduleId}/auto-payment": { name: "ghl_invoice_schedule_set_auto_payment" },
    "POST /invoices/schedule/{scheduleId}/cancel": {
      name: "ghl_invoice_schedule_cancel",
      descriptionNote: "Stops all remaining not-yet-sent occurrences of this recurring/scheduled invoice. Already-sent invoices are unaffected.",
    },
    "POST /invoices/schedule/{scheduleId}/schedule": {
      name: "ghl_invoice_schedule_activate",
      descriptionNote: "Activates (starts sending) a previously created but not-yet-scheduled recurring invoice.",
    },
    "POST /invoices/schedule/{scheduleId}/updateAndSchedule": { name: "ghl_invoice_schedule_update_and_activate" },

    // ---- invoices-v3.json (estimate sub-resource — split to its own ghl_estimate_* prefix) ----
    "POST /invoices/estimate": { name: "ghl_estimate_create" },
    "DELETE /invoices/estimate/{estimateId}": { name: "ghl_estimate_delete" },
    "PUT /invoices/estimate/{estimateId}": { name: "ghl_estimate_update" },
    "POST /invoices/estimate/{estimateId}/invoice": {
      name: "ghl_estimate_convert_to_invoice",
      descriptionNote: "Creates a new invoice from an accepted/existing estimate.",
    },
    "POST /invoices/estimate/{estimateId}/send": { name: "ghl_estimate_send" },
    "GET /invoices/estimate/list": { name: "ghl_estimate_list" },
    "GET /invoices/estimate/number/generate": { name: "ghl_estimate_generate_number" },
    "PATCH /invoices/estimate/stats/last-visited-at": { name: "ghl_estimate_update_last_visited_at" },
    "GET /invoices/estimate/template": { name: "ghl_estimate_template_list" },
    "POST /invoices/estimate/template": { name: "ghl_estimate_template_create" },
    "DELETE /invoices/estimate/template/{templateId}": { name: "ghl_estimate_template_delete" },
    "PUT /invoices/estimate/template/{templateId}": { name: "ghl_estimate_template_update" },
    "GET /invoices/estimate/template/preview": { name: "ghl_estimate_template_preview" },

    // ---- payments-v3.json (coupon sub-resource) ----
    "DELETE /payments/coupon": {
      name: "ghl_payment_coupon_delete",
      descriptionNote: "Permanently deletes the coupon. Any checkout links relying on its code will stop applying the discount.",
    },
    "GET /payments/coupon": { name: "ghl_payment_coupon_get" },
    "POST /payments/coupon": { name: "ghl_payment_coupon_create" },
    "PUT /payments/coupon": { name: "ghl_payment_coupon_update" },
    "GET /payments/coupon/list": { name: "ghl_payment_coupon_list" },

    // ---- payments-v3.json (custom-provider sub-resource — location's own payment gateway integration) ----
    "PUT /payments/custom-provider/capabilities": { name: "ghl_payment_custom_provider_update_capabilities" },
    "GET /payments/custom-provider/connect": { name: "ghl_payment_custom_provider_get_config" },
    "POST /payments/custom-provider/connect": { name: "ghl_payment_custom_provider_create_config" },
    "POST /payments/custom-provider/disconnect": {
      name: "ghl_payment_custom_provider_disconnect_config",
      descriptionNote: "Disconnects the custom payment provider's live/test config. This can interrupt live payment collection at this location until reconnected.",
    },
    "DELETE /payments/custom-provider/provider": {
      name: "ghl_payment_custom_provider_delete",
      descriptionNote: "Permanently removes the custom payment provider integration itself (not just its config). Any in-flight or future payment flows depending on it will fail.",
    },
    "POST /payments/custom-provider/provider": { name: "ghl_payment_custom_provider_create" },

    // ---- payments-v3.json (white-label integration provider sub-resource) ----
    "GET /payments/integrations/provider/whitelabel": { name: "ghl_payment_integration_provider_list" },
    "POST /payments/integrations/provider/whitelabel": { name: "ghl_payment_integration_provider_create" },

    // ---- payments-v3.json (orders sub-resource) ----
    "GET /payments/orders": { name: "ghl_payment_order_list" },
    "GET /payments/orders/{orderId}": { name: "ghl_payment_order_get" },
    "GET /payments/orders/{orderId}/fulfillments": { name: "ghl_payment_order_list_fulfillments" },
    "POST /payments/orders/{orderId}/fulfillments": { name: "ghl_payment_order_create_fulfillment" },
    "GET /payments/orders/{orderId}/notes": { name: "ghl_payment_order_list_notes" },
    "POST /payments/orders/{orderId}/record-payment": {
      name: "ghl_payment_order_record_payment",
      descriptionNote: "Records a manual/offline payment against an order. Does not process a live charge.",
    },

    // ---- payments-v3.json (subscriptions / transactions — read-only sub-resources) ----
    "GET /payments/subscriptions": { name: "ghl_payment_subscription_list" },
    "GET /payments/subscriptions/{subscriptionId}": { name: "ghl_payment_subscription_get" },
    "GET /payments/transactions": { name: "ghl_payment_transaction_list" },
    "GET /payments/transactions/{transactionId}": { name: "ghl_payment_transaction_get" },

    // ---- products-v3.json (core product ops) ----
    "GET /products/": {
      name: "ghl_product_list",
      descriptionNote: "Lists products for a location. (Generated tool name was originally 'ghl_product_list_invoices' — an evident copy-paste artifact unrelated to this operation; corrected here.)",
    },
    "DELETE /products/{productId}": { name: "ghl_product_delete" },
    "GET /products/{productId}": { name: "ghl_product_get" },
    "PUT /products/{productId}": { name: "ghl_product_update" },
    "POST /products/bulk-update": {
      descriptionNote: "Bulk-mutates multiple products in one call — review the target productIds carefully before sending.",
    },
    "POST /products/bulk-update/edit": {
      descriptionNote: "Bulk-edits fields across multiple products and their prices in one call — review the target scope carefully before sending.",
    },

    // ---- products-v3.json (price sub-resource) ----
    "GET /products/{productId}/price": { name: "ghl_product_price_list" },
    "POST /products/{productId}/price": { name: "ghl_product_price_create" },
    "DELETE /products/{productId}/price/{priceId}": { name: "ghl_product_price_delete" },
    "GET /products/{productId}/price/{priceId}": { name: "ghl_product_price_get" },
    "PUT /products/{productId}/price/{priceId}": { name: "ghl_product_price_update" },

    // ---- products-v3.json (collections sub-resource) ----
    "GET /products/collections": { name: "ghl_product_collection_list" },
    "POST /products/collections": { name: "ghl_product_collection_create" },
    "DELETE /products/collections/{collectionId}": { name: "ghl_product_collection_delete" },
    "GET /products/collections/{collectionId}": { name: "ghl_product_collection_get" },
    "PUT /products/collections/{collectionId}": { name: "ghl_product_collection_update" },

    // ---- products-v3.json (inventory sub-resource) ----
    "GET /products/inventory": { name: "ghl_product_inventory_list" },
    "POST /products/inventory": { name: "ghl_product_inventory_update" },

    // ---- products-v3.json (reviews sub-resource) ----
    "GET /products/reviews": { name: "ghl_product_review_list" },
    "DELETE /products/reviews/{reviewId}": { name: "ghl_product_review_delete" },
    "PUT /products/reviews/{reviewId}": { name: "ghl_product_review_update" },
    "POST /products/reviews/bulk-update": {
      name: "ghl_product_review_bulk_update",
      descriptionNote: "Bulk-mutates multiple reviews in one call (e.g. approve/reject in batch) — review the target reviewIds carefully before sending.",
    },
    "GET /products/reviews/count": { name: "ghl_product_review_count" },

    // ---- products-v3.json (store-display sub-resource — a product's visibility/priority within a storefront) ----
    "POST /products/store/{storeId}": {
      name: "ghl_product_store_set_inclusion",
      descriptionNote: "Includes or excludes a product from the given store's storefront listing.",
    },
    "POST /products/store/{storeId}/priority": { name: "ghl_product_store_set_priority" },
    "GET /products/store/{storeId}/stats": { name: "ghl_product_store_get_stats" },

    // ---- store-v3.json (shipping carrier / zone / rate / settings) ----
    "GET /store/shipping-carrier/{shippingCarrierId}": { name: "ghl_store_get_shipping_carrier" },
    "GET /store/shipping-zone/{shippingZoneId}": { name: "ghl_store_get_shipping_zone" },
    "GET /store/shipping-zone/{shippingZoneId}/shipping-rate/{shippingRateId}": { name: "ghl_store_get_shipping_rate" },
    "POST /store/shipping-zone/shipping-rates": {
      name: "ghl_store_get_available_shipping_rates",
      descriptionNote: "Returns the shipping rates available for a given country/order-amount combination. (Generated tool name was originally 'ghl_store_get_available_shipping_zones', which misdescribed the response — this endpoint returns rates, not zones; corrected here.)",
    },
    "GET /store/store-setting": { name: "ghl_store_get_settings" },
    "POST /store/store-setting": {
      name: "ghl_store_upsert_settings",
      descriptionNote: "Creates the store settings record if none exists yet, otherwise updates it in place (per spec summary 'Create/Update Store Settings').",
    },

    // ---- proposals-v3.json ----
    "GET /proposals/document": { name: "ghl_proposal_list_documents" },
    "POST /proposals/document/send": { name: "ghl_proposal_send_document" },
    "GET /proposals/templates": { name: "ghl_proposal_list_templates" },
    "POST /proposals/templates/send": { name: "ghl_proposal_send_template" },
  },
};
