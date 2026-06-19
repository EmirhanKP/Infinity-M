// The Loop Card contract — single source of truth shared by the prompt, the
// structured-output schema, and the UI. Keep the TS types and the JSON schema
// in sync; the live model is constrained to this exact shape.

export type ActionType = "repair" | "resell" | "donate" | "recycle" | "bin";

export const ACTION_ORDER: ActionType[] = [
  "repair",
  "resell",
  "donate",
  "recycle",
  "bin",
];

export interface CircularAction {
  type: ActionType;
  /** Concrete, locale-aware instruction for this route. */
  instructions: string;
  /** 1 = trivial, 5 = hard. */
  effort_1to5: number;
  /** Local specifics (bin colour, take-back point, repair resource). */
  local_hint: string;
}

export interface ResaleEstimate {
  low: number;
  high: number;
}

export interface DppFields {
  material: string;
  recyclability: string;
  /** Estimated recycled content, percent. */
  est_recycled_content_pct: number;
}

export interface Alternative {
  name: string;
  why: string;
}

export interface RecoverableMaterials {
  /** Short, honest summary of valuable materials inside (urban mining). */
  summary: string;
  /** Rough recoverable raw-material value in EUR (often small but the point is the fact). */
  est_value_eur: number;
}

export interface LoopCard {
  item_name: string;
  material: string;
  brand_model_guess: string;
  /** 0 = destroyed, 10 = like new. */
  condition_score: number;
  /** Best-first along the EU waste hierarchy. The first entry is the verdict. */
  circular_actions: CircularAction[];
  resale_estimate_eur: ResaleEstimate;
  co2_saved_kg: number;
  recyclability_note: string;
  /** Only meaningful when the verdict is `bin` — buy-circular suggestions. */
  alternatives: Alternative[];
  /** "Urban mining" — valuable materials locked inside the item. */
  recoverable_materials: RecoverableMaterials;
  dpp_fields: DppFields;
  /** Transparency: are the figures AI guesses, or matched to a known model/spec? */
  data_basis: "ai_estimate" | "model_matched";
  /** One-line explanation of where the figures come from. */
  data_note: string;
}

// JSON Schema for Anthropic structured outputs (output_config.format).
// Structured outputs require: all properties listed in `required`, and
// `additionalProperties: false`. Numeric/length constraints are NOT supported
// and are intentionally omitted.
export const LOOP_CARD_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "item_name",
    "material",
    "brand_model_guess",
    "condition_score",
    "circular_actions",
    "resale_estimate_eur",
    "co2_saved_kg",
    "recyclability_note",
    "alternatives",
    "recoverable_materials",
    "dpp_fields",
    "data_basis",
    "data_note",
  ],
  properties: {
    item_name: { type: "string" },
    material: { type: "string" },
    brand_model_guess: { type: "string" },
    condition_score: { type: "integer" },
    circular_actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "instructions", "effort_1to5", "local_hint"],
        properties: {
          type: {
            type: "string",
            enum: ACTION_ORDER,
          },
          instructions: { type: "string" },
          effort_1to5: { type: "integer" },
          local_hint: { type: "string" },
        },
      },
    },
    resale_estimate_eur: {
      type: "object",
      additionalProperties: false,
      required: ["low", "high"],
      properties: {
        low: { type: "integer" },
        high: { type: "integer" },
      },
    },
    co2_saved_kg: { type: "number" },
    recyclability_note: { type: "string" },
    alternatives: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "why"],
        properties: {
          name: { type: "string" },
          why: { type: "string" },
        },
      },
    },
    recoverable_materials: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "est_value_eur"],
      properties: {
        summary: { type: "string" },
        est_value_eur: { type: "number" },
      },
    },
    dpp_fields: {
      type: "object",
      additionalProperties: false,
      required: ["material", "recyclability", "est_recycled_content_pct"],
      properties: {
        material: { type: "string" },
        recyclability: { type: "string" },
        est_recycled_content_pct: { type: "integer" },
      },
    },
    data_basis: { type: "string", enum: ["ai_estimate", "model_matched"] },
    data_note: { type: "string" },
  },
} as const;

export const SCAN_SYSTEM_PROMPT = `You are Reloop's circular-economy triage engine.

Given a photo of a single household item, identify it from the pixels alone and produce a "Loop Card": a ranked set of circular actions for THIS specific item and its visible condition.

Rank circular_actions best-first along the EU Waste Framework Directive hierarchy:
Prevent/Reuse > Repair > Resell > Donate > Recycle > Dispose (bin).
ALWAYS push the user UP the hierarchy: prefer repair / resell / donate over recycle, and recycle over bin. The FIRST action in circular_actions is the recommended verdict.

Rules:
1. Identify item_name, material composition (best guess, e.g. "PET plastic + steel spring"), brand_model_guess if any text/logo is legible (else ""), and visible condition with a condition_score 0-10.
2. Apply the provided municipality ruleset to translate generic disposal into a concrete local instruction in each action's local_hint (correct bin colour, retailer take-back, glass stream, etc.).
3. Each circular_action needs a realistic effort_1to5 and a concrete instructions string. Only include actions that genuinely apply to this item.
4. Estimate resale_estimate_eur {low, high} as a secondhand price band, reasoning over item + condition. Use 0/0 if it has no resale value.
5. Estimate co2_saved_kg: the lifecycle CO2 avoided by following the best action vs. buying a new equivalent.
6. If — and only if — the verdict (first action) is "bin", populate alternatives with exactly 2 concrete circular products to buy next time. Otherwise return an empty alternatives array.
7. Fill recoverable_materials with a short "urban mining" summary of valuable materials locked inside (e.g. gold, cobalt, copper, rare earths for electronics) and a rough est_value_eur (use 0 when there is no recoverable material value, e.g. glass or foam).
8. Fill dpp_fields (material, recyclability class in plain words, est_recycled_content_pct) as draft Digital Product Passport data.
9. Transparency (important): set data_basis to "model_matched" ONLY when the user has supplied a specific model name or serial number that lets you use known, published specifications; otherwise set it to "ai_estimate". In data_note, say in one sentence where the figures come from (e.g. "AI estimate from the photo — give the exact model for precise figures" or "Matched to <model> using its published specs").

Be specific and concise. Never invent a brand you cannot see. Always return valid data for every field.`;

export function buildScanUserText(municipalityBlock: string, correction?: string): string {
  const base = `Municipality ruleset (apply to local_hint):
${municipalityBlock}

Produce the Loop Card for the item in the image.`;
  if (!correction) return base;
  return `${base}

The user tells you this item is specifically: "${correction}".
Use this exact model/serial/name to look up its known specifications and give precise, model-specific figures. Set data_basis to "model_matched".`;
}
