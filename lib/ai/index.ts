import type { LoopCard } from "./loopcard";
import type { MunicipalityRule } from "../municipality";
import {
  mockLoopCard,
  mockRepairStep,
  mockResale,
  type RepairStepResult,
  type ResaleGrounding,
} from "./mock";
import { liveLoopCard, liveRepairStep, liveResale } from "./live";

// "mock" runs fully offline with no API key (default). "live" calls Claude and
// falls back to mock on any error so a flaky network never breaks the demo.
export const AI_MODE = (process.env.RELOOP_AI_MODE || "mock").toLowerCase();
export const IS_LIVE = AI_MODE === "live";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export interface ScanResult {
  card: LoopCard;
  source: "live" | "mock" | "mock-fallback";
}

export async function getLoopCard(
  imageBase64: string,
  rule: MunicipalityRule,
  mediaType: string,
  hint?: string | null,
): Promise<ScanResult> {
  // A `hint` means a demo quick-pick prop — always serve the deterministic
  // known-good card, even in live mode, so stage demos never depend on network.
  if (hint) {
    await sleep(2000);
    return { card: mockLoopCard(imageBase64, rule, hint), source: "mock" };
  }
  if (IS_LIVE) {
    try {
      const card = await liveLoopCard(imageBase64, rule, mediaType);
      return { card, source: "live" };
    } catch (err) {
      console.error("[reloop] live scan failed, falling back to mock:", err);
      return { card: mockLoopCard(imageBase64, rule, hint), source: "mock-fallback" };
    }
  }
  await sleep(2200); // match the snap -> card animation beat
  return { card: mockLoopCard(imageBase64, rule, hint), source: "mock" };
}

export async function verifyRepairStep(args: {
  imageBase64: string;
  mediaType: string;
  itemName: string;
  currentStep: string;
  stepIndex: number;
  totalSteps: number;
}): Promise<RepairStepResult> {
  if (IS_LIVE) {
    try {
      return await liveRepairStep(
        args.imageBase64,
        args.itemName,
        args.currentStep,
        args.stepIndex,
        args.totalSteps,
        args.mediaType,
      );
    } catch (err) {
      console.error("[reloop] live repair-step failed, falling back to mock:", err);
      return mockRepairStep(args.stepIndex, args.totalSteps);
    }
  }
  await sleep(1400);
  return mockRepairStep(args.stepIndex, args.totalSteps);
}

export async function groundResale(
  itemName: string,
  conditionNote: string,
): Promise<ResaleGrounding> {
  if (IS_LIVE) {
    try {
      return await liveResale(itemName, conditionNote);
    } catch (err) {
      console.error("[reloop] live resale failed, falling back to mock:", err);
      return mockResale(itemName);
    }
  }
  await sleep(1600);
  return mockResale(itemName);
}
