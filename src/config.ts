/** Environment-driven configuration. Credentials come from env only — never hardcoded. */

export interface Config {
  apiKey: string | undefined;
  baseUrl: string;
  /** Mutating calls are BLOCKED unless this is explicitly "true" / "1". Default: safe (read-only). */
  enableWrites: boolean;
  /** Optional comma-separated spec-file basenames (e.g. "contacts,opportunities") to limit exposed tools. */
  enabledDomains: string[] | null;
  /**
   * Deploy-time default for `locationId` arguments (from GHL_DEFAULT_LOCATION_ID
   * or the legacy GHL_LOCATION_ID). Auto-fills a tool's `locationId` when the
   * caller omits it. Never hardcoded — env-only, and a caller-supplied value
   * always wins.
   */
  defaultLocationId: string | undefined;
  /** Request timeout ms. */
  timeoutMs: number;
}

/**
 * Resolve the API key. Supports, in order:
 * 1. GHL_API_KEY (this server's native var)
 * 2. HD_GHL_API_KEY (HD-ecosystem script convention)
 * 3. The retired v1 connector's convention: GHL_LOCATION_ID plus a
 *    location-scoped GHL_API_KEY_<SANITIZED_LOCATION_ID> (location ID
 *    uppercased, non-alphanumerics → "_"), so existing ~/.config/ghl-mcp/env
 *    files keep working unchanged.
 */
function resolveApiKey(): string | undefined {
  if (process.env.GHL_API_KEY) return process.env.GHL_API_KEY;
  if (process.env.HD_GHL_API_KEY) return process.env.HD_GHL_API_KEY;
  const loc = process.env.GHL_LOCATION_ID;
  if (loc) {
    const sanitized = loc.toUpperCase().replace(/[^A-Z0-9]/g, "_");
    return process.env[`GHL_API_KEY_${sanitized}`];
  }
  return undefined;
}

export function loadConfig(): Config {
  const truthy = (v: string | undefined) => v === "true" || v === "1" || v === "yes";
  const domains = process.env.GHL_ENABLED_DOMAINS?.trim();
  return {
    apiKey: resolveApiKey(),
    baseUrl: process.env.GHL_BASE_URL ?? "https://services.leadconnectorhq.com",
    enableWrites: truthy(process.env.GHL_ENABLE_WRITES ?? process.env.HD_GHL_ENABLE_WRITES),
    enabledDomains: domains ? domains.split(",").map((d) => d.trim().toLowerCase()) : null,
    defaultLocationId: process.env.GHL_DEFAULT_LOCATION_ID ?? process.env.GHL_LOCATION_ID,
    timeoutMs: Number(process.env.GHL_TIMEOUT_MS ?? 30000),
  };
}
