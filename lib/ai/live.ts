import Anthropic from "@anthropic-ai/sdk";
import type { LoopCard } from "./loopcard";
import { ACTION_ORDER, LOOP_CARD_JSON_SCHEMA, SCAN_SYSTEM_PROMPT, buildScanUserText } from "./loopcard";
import type { RepairStepResult, ResaleGrounding } from "./mock";
import type { MultiScanItem, ListingResult, PartResult, AskResult } from "../clientTypes";
import type { MunicipalityRule } from "../municipality";
import { municipalityBlock } from "../municipality";

// Model selection (overridable per the user's key/org).
// claude-fable-5: vision + structured output, thinking always on (omit `thinking`),
// effort lives inside output_config. claude-haiku-4-5: fast/cheap, but `effort` errors there.
const SCAN_MODEL = process.env.RELOOP_SCAN_MODEL || "claude-fable-5";
const REPAIR_MODEL = process.env.RELOOP_REPAIR_MODEL || "claude-haiku-4-5";
const RESALE_MODEL = process.env.RELOOP_RESALE_MODEL || SCAN_MODEL;

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic(); // reads ANTHROPIC_API_KEY
  return _client;
}

/** Haiku rejects output_config.effort; everything else accepts it. */
function effortFor(model: string): "low" | "medium" | "high" | undefined {
  if (model.includes("haiku")) return undefined;
  return "medium";
}

function imageBlock(imageBase64: string, mediaType: string) {
  return {
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: mediaType,
      data: imageBase64,
    },
  };
}

function firstText(content: Anthropic.Messages.ContentBlock[]): string {
  for (const block of content) {
    if (block.type === "text") return block.text;
  }
  throw new Error("No text block in model response");
}

// A structured (json_schema) call. We pass output_config via a cast because the
// raw json_schema form is newer than some SDK type definitions; the wire shape
// is correct per the structured-outputs API.
async function structuredVisionCall<T>(opts: {
  model: string;
  system: string;
  userText: string;
  imageBase64: string;
  mediaType: string;
  schema: unknown;
  maxTokens?: number;
}): Promise<T> {
  const effort = effortFor(opts.model);
  const params: Record<string, unknown> = {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 12000,
    system: opts.system,
    output_config: {
      format: { type: "json_schema", schema: opts.schema },
      ...(effort ? { effort } : {}),
    },
    messages: [
      {
        role: "user",
        content: [imageBlock(opts.imageBase64, opts.mediaType), { type: "text", text: opts.userText }],
      },
    ],
  };

  const res = (await client().messages.create(params as never)) as Anthropic.Messages.Message;

  if (res.stop_reason === "refusal") {
    throw new Error("Model refused the request (safety classifier).");
  }
  return JSON.parse(firstText(res.content)) as T;
}

export async function liveLoopCard(
  imageBase64: string,
  rule: MunicipalityRule,
  mediaType = "image/jpeg",
): Promise<LoopCard> {
  return structuredVisionCall<LoopCard>({
    model: SCAN_MODEL,
    system: SCAN_SYSTEM_PROMPT,
    userText: buildScanUserText(municipalityBlock(rule)),
    imageBase64,
    mediaType,
    schema: LOOP_CARD_JSON_SCHEMA,
  });
}

export async function liveRefine(
  imageBase64: string,
  rule: MunicipalityRule,
  correction: string,
  mediaType = "image/jpeg",
): Promise<LoopCard> {
  return structuredVisionCall<LoopCard>({
    model: SCAN_MODEL,
    system: SCAN_SYSTEM_PROMPT,
    userText: buildScanUserText(municipalityBlock(rule), correction),
    imageBase64,
    mediaType,
    schema: LOOP_CARD_JSON_SCHEMA,
  });
}

// A structured text-only call (no image).
async function structuredTextCall<T>(opts: {
  model: string;
  system: string;
  userText: string;
  schema: unknown;
  maxTokens?: number;
}): Promise<T> {
  const effort = effortFor(opts.model);
  const params: Record<string, unknown> = {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 2000,
    system: opts.system,
    output_config: {
      format: { type: "json_schema", schema: opts.schema },
      ...(effort ? { effort } : {}),
    },
    messages: [{ role: "user", content: opts.userText }],
  };
  const res = (await client().messages.create(params as never)) as Anthropic.Messages.Message;
  if (res.stop_reason === "refusal") throw new Error("refusal");
  return JSON.parse(firstText(res.content)) as T;
}

const MULTI_SCAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "label",
          "material",
          "condition_score",
          "box",
          "best_action",
          "instruction",
          "local_hint",
          "co2_saved_kg",
          "resale_low",
          "resale_high",
        ],
        properties: {
          label: { type: "string" },
          material: { type: "string" },
          condition_score: { type: "integer" },
          box: {
            type: "object",
            additionalProperties: false,
            required: ["x", "y", "w", "h"],
            properties: { x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" } },
          },
          best_action: { type: "string", enum: ACTION_ORDER },
          instruction: { type: "string" },
          local_hint: { type: "string" },
          co2_saved_kg: { type: "number" },
          resale_low: { type: "integer" },
          resale_high: { type: "integer" },
        },
      },
    },
  },
} as const;

export async function liveMultiScan(
  imageBase64: string,
  rule: MunicipalityRule,
  mediaType = "image/jpeg",
): Promise<MultiScanItem[]> {
  const system = `You are Reloop's multi-item triage engine. The photo shows several household items together (a drawer, a table, a pile).
Detect EVERY distinct discardable item (up to 8). For each, return:
- label, material guess, condition_score 0-10
- box: a normalized bounding box {x,y,w,h} in 0..1 from the TOP-LEFT of the image (x,y = top-left corner of the item; w,h = its width/height as fractions of the image)
- best_action: the best circular action ranked UP the EU waste hierarchy (repair > resell > donate > recycle > bin)
- a one-line instruction and a local_hint using the municipality ruleset
- co2_saved_kg and a resale band (resale_low/resale_high, 0 if none)
Be accurate with boxes so they can be drawn over the image.`;
  const userText = `Municipality ruleset:\n${municipalityBlock(rule)}\n\nDetect and triage every item in the image.`;
  const res = await structuredVisionCall<{ items: MultiScanItem[] }>({
    model: SCAN_MODEL,
    system,
    userText,
    imageBase64,
    mediaType,
    schema: MULTI_SCAN_SCHEMA,
    maxTokens: 16000,
  });
  return res.items;
}

const LISTING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "price_eur", "category", "marketplaceUrl"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    price_eur: { type: "integer" },
    category: { type: "string" },
    marketplaceUrl: { type: "string" },
  },
} as const;

export async function liveListing(
  itemName: string,
  material: string,
  conditionScore: number,
  resaleLow: number,
  resaleHigh: number,
): Promise<ListingResult> {
  const system =
    "You write ready-to-post secondhand marketplace listings (Vinted / Back Market style) that help an item find a second life. Output a catchy title, a friendly 2-3 sentence description, a fair EUR price within the given band, a sensible category, and a Vinted new-listing URL prefilled with a search for the item.";
  const userText = `Item: ${itemName}\nMaterial: ${material}\nCondition: ${conditionScore}/10\nResale band: €${resaleLow}-${resaleHigh}\nWrite the listing.`;
  return structuredTextCall<ListingResult>({ model: SCAN_MODEL, system, userText, schema: LISTING_SCHEMA });
}

export async function liveAsk(question: string): Promise<AskResult> {
  const searchRes = (await client().messages.create({
    model: RESALE_MODEL,
    max_tokens: 4000,
    system:
      "You answer questions about the circular economy, recycling, repair and product sustainability for a general audience: accurate, encouraging, and concrete. Prefer authoritative sources (EU, UN, Ellen MacArthur Foundation, Our World in Data, peer-reviewed). Keep the answer to 3-5 sentences.",
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }],
    messages: [{ role: "user", content: question }],
  } as never)) as Anthropic.Messages.Message;

  let res = searchRes;
  for (let i = 0; i < 4 && res.stop_reason === "pause_turn"; i++) {
    res = (await client().messages.create({
      model: RESALE_MODEL,
      max_tokens: 4000,
      messages: [{ role: "assistant", content: res.content }],
    } as never)) as Anthropic.Messages.Message;
  }
  const findings = res.content.map((b) => (b.type === "text" ? b.text : "")).join("\n").trim();

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["answer", "sources"],
    properties: {
      answer: { type: "string" },
      sources: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "url"],
          properties: { label: { type: "string" }, url: { type: "string" } },
        },
      },
    },
  } as const;

  return structuredTextCall<AskResult>({
    model: RESALE_MODEL,
    system: "Turn the research notes into a short, friendly answer with 1-3 cited sources, as strict JSON.",
    userText: `Question: ${question}\n\nResearch notes:\n${findings || "(no sources found)"}`,
    schema,
  });
}

export async function liveParts(itemName: string, brandModel: string): Promise<PartResult> {
  const searchRes = (await client().messages.create({
    model: RESALE_MODEL,
    max_tokens: 4000,
    system:
      "You find the exact replacement part / repair kit for a specific device and its current price on EU sites. Search before answering and surface real product/guide URLs.",
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 3,
        allowed_domains: ["ifixit.com", "amazon.de", "ebay.de"],
      },
    ],
    messages: [
      {
        role: "user",
        content: `Find the exact replacement part or repair kit for: "${itemName}"${brandModel ? ` (${brandModel})` : ""}. Give the part name, a EUR price, and 1-3 real URLs.`,
      },
    ],
  } as never)) as Anthropic.Messages.Message;

  let res = searchRes;
  for (let i = 0; i < 4 && res.stop_reason === "pause_turn"; i++) {
    res = (await client().messages.create({
      model: RESALE_MODEL,
      max_tokens: 4000,
      messages: [{ role: "assistant", content: res.content }],
    } as never)) as Anthropic.Messages.Message;
  }
  const findings = res.content.map((b) => (b.type === "text" ? b.text : "")).join("\n").trim();

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["part_name", "price_eur", "note", "links"],
    properties: {
      part_name: { type: "string" },
      price_eur: { type: "integer" },
      note: { type: "string" },
      links: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "url"],
          properties: { label: { type: "string" }, url: { type: "string" } },
        },
      },
    },
  } as const;

  return structuredTextCall<PartResult>({
    model: RESALE_MODEL,
    system: "Extract the replacement-part summary as strict JSON from the research notes.",
    userText: `Item: ${itemName}\n\nResearch notes:\n${findings || "(no part found)"}`,
    schema,
  });
}

const REPAIR_STEP_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["step_confirmed", "observation", "next_instruction", "done", "encouragement"],
  properties: {
    step_confirmed: { type: "boolean" },
    observation: { type: "string" },
    next_instruction: { type: "string" },
    done: { type: "boolean" },
    encouragement: { type: "string" },
  },
} as const;

export async function liveRepairStep(
  imageBase64: string,
  itemName: string,
  currentStep: string,
  stepIndex: number,
  totalSteps: number,
  mediaType = "image/jpeg",
): Promise<RepairStepResult> {
  const system = `You are a friendly, specific repair coach. The user is repairing: ${itemName}.
They are on step ${stepIndex + 1} of ${totalSteps}: "${currentStep}".
Look at their progress photo. Confirm whether the step is done correctly; if yes, give the next concrete step; if not, say exactly what to fix. Set done=true only if this was the final step. Be encouraging and concrete.`;
  return structuredVisionCall<RepairStepResult>({
    model: REPAIR_MODEL,
    system,
    userText: "Here is my progress photo. How did I do, and what's next?",
    imageBase64,
    mediaType,
    schema: REPAIR_STEP_SCHEMA,
    maxTokens: 2000,
  });
}

// Confidence-gated resale grounding via the web_search server tool. We run search
// (no structured output — they can't combine with citations), then a small
// follow-up structured call extracts a tightened band + cited links.
export async function liveResale(
  itemName: string,
  conditionNote: string,
): Promise<ResaleGrounding> {
  const searchRes = (await client().messages.create({
    model: RESALE_MODEL,
    max_tokens: 4000,
    system:
      "You find live secondhand price comparisons for a specific item on EU resale marketplaces. When unsure of the price, search before answering and surface real listing URLs.",
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 3,
        allowed_domains: ["vinted.com", "vinted.de", "backmarket.com", "backmarket.de", "ifixit.com"],
      },
    ],
    messages: [
      {
        role: "user",
        content: `Find current secondhand price comps for: "${itemName}" (${conditionNote}). Give a EUR price band and 1-3 real listing/guide URLs.`,
      },
    ],
  } as never)) as Anthropic.Messages.Message;

  // Resolve any pause_turn from the server-tool loop (bounded).
  let res = searchRes;
  for (let i = 0; i < 4 && res.stop_reason === "pause_turn"; i++) {
    res = (await client().messages.create({
      model: RESALE_MODEL,
      max_tokens: 4000,
      messages: [{ role: "assistant", content: res.content }],
    } as never)) as Anthropic.Messages.Message;
  }

  const findings = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();

  const extractSchema = {
    type: "object",
    additionalProperties: false,
    required: ["low", "high", "links", "note"],
    properties: {
      low: { type: "integer" },
      high: { type: "integer" },
      links: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "url"],
          properties: { label: { type: "string" }, url: { type: "string" } },
        },
      },
      note: { type: "string" },
    },
  } as const;

  const effort = effortFor(RESALE_MODEL);
  const extract = (await client().messages.create({
    model: RESALE_MODEL,
    max_tokens: 2000,
    system: "Extract a resale summary as strict JSON from the provided research notes.",
    output_config: {
      format: { type: "json_schema", schema: extractSchema },
      ...(effort ? { effort } : {}),
    },
    messages: [
      {
        role: "user",
        content: `Item: ${itemName}\n\nResearch notes:\n${findings || "(no comps found)"}`,
      },
    ],
  } as never)) as Anthropic.Messages.Message;

  if (extract.stop_reason === "refusal") throw new Error("refusal");
  return JSON.parse(firstText(extract.content)) as ResaleGrounding;
}
