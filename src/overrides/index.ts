/**
 * Aggregates per-domain curated overrides. Each domain audit contributes one
 * module. Keys are "METHOD /path" exactly as in operations.json.
 */
import type { DomainOverrides } from "../types.js";
import { contactsOverrides } from "./contacts.js";
import { opportunitiesOverrides } from "./opportunities.js";
import { calendarsOverrides } from "./calendars.js";
import { conversationsOverrides } from "./conversations.js";
import { paymentsOverrides } from "./payments.js";
import { marketingOverrides } from "./marketing.js";
import { adsOverrides } from "./ads.js";
import { platformOverrides } from "./platform.js";

export const allOverrides: DomainOverrides[] = [
  contactsOverrides,
  opportunitiesOverrides,
  calendarsOverrides,
  conversationsOverrides,
  paymentsOverrides,
  marketingOverrides,
  adsOverrides,
  platformOverrides,
];
