import type { ActionType, LoopCard } from "./ai/loopcard";

export interface DeepLink {
  label: string;
  url: string;
}

export interface DashboardData {
  totalScans: number;
  totalCo2SavedKg: number;
  totalWasteDivertedKg: number;
  actionBreakdown: { type: ActionType; count: number; share: number }[];
  materialFlow: { material: string; count: number; avgRecycledContentPct: number }[];
  sampleDpp: {
    itemName: string;
    material: string;
    recyclability: string;
    recycledContentPct: number;
    confidence: "ai_estimated" | "document_backed";
  }[];
  recentItems: { itemName: string; bestActionType: ActionType; co2SavedKg: number }[];
}

export interface ScanResponse {
  scanId: string;
  card: LoopCard;
  links: Record<string, DeepLink[]>;
  source: "live" | "mock" | "mock-fallback";
  municipality: string;
}

export interface StreakValues {
  loopPoints: number;
  weeklyCo2SavedKg: number;
  weeklyWasteDivertedKg: number;
  currentStreakDays: number;
}

export interface ResaleGrounding {
  low: number;
  high: number;
  links: DeepLink[];
  note: string;
}

export interface RepairStepResult {
  step_confirmed: boolean;
  observation: string;
  next_instruction: string;
  done: boolean;
  encouragement: string;
}
