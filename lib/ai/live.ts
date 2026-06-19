import Anthropic from "@anthropic-ai/sdk";
import type { LoopCard } from "./loopcard";
import { LOOP_CARD_JSON_SCHEMA, SCAN_SYSTEM_PROMPT, buildScanUserText } from "./loopcard";
import type { RepairStepResult, ResaleGrounding } from "./mock";
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
