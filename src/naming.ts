/**
 * Deterministic tool naming: ghl_<resource>_<action>.
 * Domain audits curate final names via overrides; this generates the base name
 * and guarantees uniqueness (collisions get a short method/path suffix).
 */
import type { Operation } from "./types.js";

/** spec basename → resource prefix */
const RESOURCE: Record<string, string> = {
  "ad-manager": "ad",
  "ad-publishing": "ad",
  "affiliate-manager": "affiliate",
  "agent-studio": "agent_studio",
  associations: "association",
  blogs: "blog",
  "brand-boards": "brand_board",
  businesses: "business",
  calendars: "calendar",
  campaigns: "campaign",
  "chat-widget": "chat_widget",
  companies: "company",
  contacts: "contact",
  "conversation-ai": "conversation_ai",
  conversations: "conversation",
  courses: "course",
  "custom-fields": "custom_field",
  "custom-menus": "custom_menu",
  "email-isv": "email_verify",
  emails: "email",
  forms: "form",
  funnels: "funnel",
  invoices: "invoice",
  "knowledge-base": "kb",
  links: "link",
  locations: "location",
  marketplace: "marketplace",
  medias: "media",
  oauth: "oauth",
  objects: "object",
  opportunities: "opportunity",
  payments: "payment",
  "phone-system": "phone",
  products: "product",
  proposals: "proposal",
  saas: "saas",
  "saas-api": "saas",
  snapshots: "snapshot",
  "social-media-posting": "social",
  "social-planner": "social",
  store: "store",
  surveys: "survey",
  users: "user",
  "voice-ai": "voice_ai",
  workflows: "workflow",
};

export function specBase(specFile: string): string {
  return specFile.replace(/^v3\//, "").replace(/-v3\.json$|\.json$/, "");
}

function snake(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

const VERB: Record<string, string> = {
  GET: "get",
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

export function deriveName(op: Operation): string {
  const resource = RESOURCE[specBase(op.specFile)] ?? snake(specBase(op.specFile));
  let action = op.operationId ? snake(op.operationId) : "";
  if (!action) {
    const segs = op.path
      .split("/")
      .filter((s) => s && !s.startsWith("{"))
      .slice(1)
      .map(snake);
    action = [VERB[op.method], ...segs.slice(-2)].join("_");
  }
  // strip redundant resource tokens from the action
  const resTokens = new Set([...resource.split("_"), ...resource.split("_").map((t) => t + "s")]);
  const tokens = action.split("_").filter((t) => !resTokens.has(t));
  action = tokens.join("_") || VERB[op.method];
  return `ghl_${resource}_${action}`.slice(0, 64);
}

/** Assign unique names across all operations (curated names win; collisions get suffixes). */
export function assignNames(
  ops: Operation[],
  curated: (op: Operation) => string | undefined
): Map<Operation, string> {
  const used = new Map<string, number>();
  const names = new Map<Operation, string>();
  for (const op of ops) {
    let name = curated(op) ?? deriveName(op);
    if (used.has(name)) {
      const n = used.get(name)! + 1;
      used.set(name, n);
      const suffix = `_${op.method.toLowerCase()}${n > 1 ? n : ""}`;
      name = (name.slice(0, 64 - suffix.length) + suffix).replace(/__+/g, "_");
    }
    used.set(name, used.get(name) ?? 1);
    names.set(op, name);
  }
  return names;
}
