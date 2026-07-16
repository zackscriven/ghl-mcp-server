/** Shared types for ghl-mcp-server-v2. */

export interface SpecParameter {
  name: string;
  in: "path" | "query" | "header";
  required?: boolean;
  description?: string;
  schema?: Record<string, unknown>;
  explode?: boolean;
  style?: string;
}

export interface Operation {
  specFile: string;
  tier: "legacy" | "v3";
  tags: string[];
  operationId: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  versionHeader: string;
  summary: string;
  description: string;
  deprecated: boolean;
  scopes: string[];
  parameters: SpecParameter[];
  requestBody: {
    required?: boolean;
    description?: string;
    content?: Record<string, { schema?: Record<string, unknown> }>;
  } | null;
  legacyTwin?: { specFile: string; versionHeader: string; operationId: string };
}

export interface OperationsFile {
  generatedAt: string;
  specsDir: string;
  totals: { rawOperations: number; uniqueOperations: number; parseErrors: number };
  operations: Operation[];
}

/**
 * Per-domain curated overrides. Written by the domain audit passes; the
 * registry consults these when building each tool. Keyed by "METHOD /path".
 */
export interface OperationOverride {
  /** Curated tool name (ghl_<resource>_<action>). Wins over the derived name. */
  name?: string;
  /** Replace/augment the generated description (prepended). */
  descriptionNote?: string;
  /** Skip registering this operation entirely — MUST include a reason (goes in the exceptions report). */
  skip?: { reason: string };
  /** Force a specific Version header (only when the spec is known-wrong). Document why. */
  versionHeader?: string;
  /** Extra query params the spec under-documents but the API accepts (each needs a note). */
  extraQueryParams?: Array<{ name: string; schema: Record<string, unknown>; description: string }>;
  /** Mark params the spec under-marks as required (e.g. GET /medias/files `type`). */
  forceRequired?: string[];
  /** Content type override, e.g. multipart/form-data uploads. */
  contentType?: string;
}

export interface DomainOverrides {
  domain: string;
  /** Audit notes for the final report. */
  notes?: string[];
  overrides: Record<string, OperationOverride>;
}
