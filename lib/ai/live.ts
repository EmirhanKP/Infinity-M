import OpenAI from "openai";
import type { LoopCard } from "./loopcard";
import { ACTION_ORDER, LOOP_CARD_JSON_SCHEMA, SCAN_SYSTEM_PROMPT, buildScanUserText } from "./loopcard";
import type { RepairStepResult, ResaleGrounding } from "./mock";
import type { MultiScanItem, ListingResult, PartResult, AskResult } from "../clientTypes";
import type { MunicipalityRule } from "../municipality";
import { municipalityBlock } from "../municipality";

// Model selection (overridable per env). gpt-5.4-mini is multimodal (vision),
// supports strict structured outputs + the web_search tool, and is ~3x cheaper
// than gpt-5.4. Bump RELOOP_SCAN_MODEL=gpt-5.4 if the hero scan ever
// misidentifies a real photo on stage.
const SCAN_MODEL = process.env.RELOOP_SCAN_MODEL || "gpt-5.4-mini";
const REPAIR_MODEL = process.env.RELOOP_REPAIR_MODEL || "gpt-5.4-mini";
const RESALE_MODEL = process.env.RELOOP_RESALE_MODEL || SCAN_MODEL;

// Low reasoning effort keeps the structured calls fast + cheap; the tasks are
// perception/extraction, not deep reasoning.
const REASONING_EFFORT = "low";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) _client = new OpenAI(); // reads OPENAI_API_KEY
  return _client;
}

function dataUrl(imageBase64: string, mediaType: string): string {
  return `data:${mediaType};base64,${imageBase64}`;
}

// A structured (json_schema) chat completion with an image. OpenAI strict mode
// needs `additionalProperties: false` + every key in `required`, which our
// schemas already satisfy, so they are drop-in.
async function structuredVisionCall<T>(opts: {
  model: string;
  schemaName: string;
  system: string;
  userText: string;
  imageBase64: string;
  mediaType: string;
  schema: unknown;
  maxTokens?: number;
}): Promise<T> {
  const params: Record<string, unknown> = {
    model: opts.model,
    max_completion_tokens: opts.maxTokens ?? 16000,
    reasoning_effort: REASONING_EFFORT,
    messages: [
      { role: "system", content: opts.system },
      {
        role: "user",
        content: [
          { type: "text", text: opts.userText },
          { type: "image_url", image_url: { url: dataUrl(opts.imageBase64, opts.mediaType) } },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: opts.schemaName, schema: opts.schema, strict: true },
    },
  };

  const res = (await client().chat.completions.create(params as never)) as OpenAI.Chat.Completions.ChatCompletion;
  const msg = res.choices[0]?.message;
  if (msg?.refusal) throw new Error("Model refused the request (safety classifier).");
  if (!msg?.content) throw new Error("No content in model response");
  return JSON.parse(msg.content) as T;
}

// A structured text-only chat completion (no image).
async function structuredTextCall<T>(opts: {
  model: string;
  schemaName: string;
  system: string;
  userText: string;
  schema: unknown;
  maxTokens?: number;
}): Promise<T> {
  const params: Record<string, unknown> = {
    model: opts.model,
    max_completion_tokens: opts.maxTokens ?? 4000,
    reasoning_effort: REASONING_EFFORT,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.userText },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: opts.schemaName, schema: opts.schema, strict: true },
    },
  };
  const res = (await client().chat.completions.create(params as never)) as OpenAI.Chat.Completions.ChatCompletion;
  const msg = res.choices[0]?.message;
  if (msg?.refusal) throw new Error("refusal");
  if (!msg?.content) throw new Error("No content in model response");
  return JSON.parse(msg.content) as T;
}

// Live web search via the Responses API web_search tool. Returns the model's
// grounded prose; a follow-up structured call then extracts strict JSON. (Search
// + strict JSON are split into two steps so citations and schema don't collide.)
async function webSearch(model: string, instructions: string, input: string): Promise<string> {
  const params: Record<string, unknown> = {
    model,
    instructions,
    input,
    tools: [{ type: "web_search" }],
  };
  const res = (await client().responses.create(params as never)) as { output_text?: string };
  return (res.output_text ?? "").trim();
}

export async function liveLoopCard(
  imageBase64: string,
  rule: MunicipalityRule,
  mediaType = "image/jpeg",
): Promise<LoopCard> {
  return structuredVisionCall<LoopCard>({
    model: SCAN_MODEL,
    schemaName: "loop_card",
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
    schemaName: "loop_card",
    system: SCAN_SYSTEM_PROMPT,
    userText: buildScanUserText(municipalityBlock(rule), correction),
    imageBase64,
    mediaType,
    schema: LOOP_CARD_JSON_SCHEMA,
  });
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
    schemaName: "multi_scan",
    system,
    userText,
    imageBase64,
    mediaType,
    schema: MULTI_SCAN_SCHEMA,
    maxTokens: 20000,
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
  return structuredTextCall<ListingResult>({
    model: SCAN_MODEL,
    schemaName: "listing",
    system,
    userText,
    schema: LISTING_SCHEMA,
  });
}

const ASK_SCHEMA = {
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

export async function liveAsk(question: string): Promise<AskResult> {
  const findings = await webSearch(
    RESALE_MODEL,
    "You answer questions about the circular economy, recycling, repair and product sustainability for a general audience: accurate, encouraging, and concrete. Prefer authoritative sources (EU, UN, Ellen MacArthur Foundation, Our World in Data, peer-reviewed). Keep the answer to 3-5 sentences and include the source URLs you used.",
    question,
  );

  return structuredTextCall<AskResult>({
    model: RESALE_MODEL,
    schemaName: "ask_answer",
    system: "Turn the research notes into a short, friendly answer with 1-3 cited sources, as strict JSON.",
    userText: `Question: ${question}\n\nResearch notes:\n${findings || "(no sources found)"}`,
    schema: ASK_SCHEMA,
  });
}

const PARTS_SCHEMA = {
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

export async function liveParts(itemName: string, brandModel: string): Promise<PartResult> {
  const findings = await webSearch(
    RESALE_MODEL,
    "You find the exact replacement part / repair kit for a specific device and its current price on EU sites (prefer ifixit.com, amazon.de, ebay.de). Search before answering and surface real product/guide URLs.",
    `Find the exact replacement part or repair kit for: "${itemName}"${brandModel ? ` (${brandModel})` : ""}. Give the part name, a EUR price, and 1-3 real URLs.`,
  );

  return structuredTextCall<PartResult>({
    model: RESALE_MODEL,
    schemaName: "part_result",
    system: "Extract the replacement-part summary as strict JSON from the research notes.",
    userText: `Item: ${itemName}\n\nResearch notes:\n${findings || "(no part found)"}`,
    schema: PARTS_SCHEMA,
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
    schemaName: "repair_step",
    system,
    userText: "Here is my progress photo. How did I do, and what's next?",
    imageBase64,
    mediaType,
    schema: REPAIR_STEP_SCHEMA,
    maxTokens: 4000,
  });
}

const RESALE_SCHEMA = {
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

// Confidence-gated resale grounding: web search for live comps, then a small
// structured call extracts a tightened band + cited links.
export async function liveResale(itemName: string, conditionNote: string): Promise<ResaleGrounding> {
  const findings = await webSearch(
    RESALE_MODEL,
    "You find live secondhand price comparisons for a specific item on EU resale marketplaces (prefer vinted.com, vinted.de, backmarket.com, backmarket.de). When unsure of the price, search before answering and surface real listing URLs.",
    `Find current secondhand price comps for: "${itemName}" (${conditionNote}). Give a EUR price band and 1-3 real listing/guide URLs.`,
  );

  return structuredTextCall<ResaleGrounding>({
    model: RESALE_MODEL,
    schemaName: "resale_grounding",
    system: "Extract a resale summary as strict JSON from the provided research notes.",
    userText: `Item: ${itemName}\n\nResearch notes:\n${findings || "(no comps found)"}`,
    schema: RESALE_SCHEMA,
  });
}
