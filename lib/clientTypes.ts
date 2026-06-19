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

export interface MultiScanItem {
  scanId?: string;
  label: string;
  material: string;
  condition_score: number;
  /** Normalized 0..1 box over the source image. */
  box: { x: number; y: number; w: number; h: number };
  best_action: ActionType;
  instruction: string;
  local_hint: string;
  co2_saved_kg: number;
  resale_low: number;
  resale_high: number;
}

export interface MultiScanResult {
  items: MultiScanItem[];
  source: "live" | "mock" | "mock-fallback";
}

export interface ListingResult {
  title: string;
  description: string;
  price_eur: number;
  category: string;
  marketplaceUrl: string;
}

export interface PartResult {
  part_name: string;
  price_eur: number;
  note: string;
  links: DeepLink[];
}

export interface AskResult {
  answer: string;
  sources: DeepLink[];
}
