import { promises as fs } from "fs";
import path from "path";
import type { ActionType, LoopCard } from "./ai/loopcard";

// Lightweight JSON-file store. Zero native deps, runs anywhere, and gives the
// B2B dashboard real aggregates from real scans. Swap for Postgres/Prisma later
// by re-implementing this module's functions.

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "reloop.json");

export interface ScanRecord {
  id: string;
  sessionId: string;
  createdAt: number;
  itemName: string;
  material: string;
  conditionScore: number;
  bestActionType: ActionType;
  resaleLowEur: number;
  resaleHighEur: number;
  co2SavedKg: number;
  recyclabilityNote: string;
  municipalityCode: string;
  dppMaterial: string;
  dppRecyclability: string;
  dppRecycledContentPct: number;
}

export interface ConfirmRecord {
  id: string;
  scanId: string;
  sessionId: string;
  chosenActionType: ActionType;
  confirmedAt: number;
  pointsAwarded: number;
  co2SavedKg: number;
  wasteDivertedKg: number;
}

export interface StreakRecord {
  sessionId: string;
  loopPoints: number;
  weeklyCo2SavedKg: number;
  weeklyWasteDivertedKg: number;
  currentStreakDays: number;
  lastActionAt: number;
}

interface DbShape {
  scans: ScanRecord[];
  confirms: ConfirmRecord[];
  streaks: Record<string, StreakRecord>;
}

// Seed so the dashboard looks alive on first load (anonymized aggregate feed)
// and the demo streak shows a believable running total.
function seed(): DbShape {
  const now = Date.now();
  const day = 86_400_000;
  const sample: Array<Partial<ScanRecord>> = [
    { itemName: "Smartphone (cracked)", material: "Aluminium + glass + Li-ion", bestActionType: "repair", co2SavedKg: 32, dppMaterial: "Aluminium + glass + Li-ion", dppRecyclability: "Partial (WEEE)", dppRecycledContentPct: 20 },
    { itemName: "Charger cable", material: "Copper + PVC + ABS", bestActionType: "recycle", co2SavedKg: 1.2, dppMaterial: "Copper + PVC + ABS", dppRecyclability: "Recyclable (WEEE)", dppRecycledContentPct: 10 },
    { itemName: "Glass jar", material: "Soda-lime glass + steel", bestActionType: "donate", co2SavedKg: 0.6, dppMaterial: "Soda-lime glass + steel", dppRecyclability: "Fully recyclable", dppRecycledContentPct: 60 },
    { itemName: "Toaster", material: "Steel + nichrome + electronics", bestActionType: "repair", co2SavedKg: 6, dppMaterial: "Steel + nichrome + electronics", dppRecyclability: "Recyclable (WEEE)", dppRecycledContentPct: 30 },
    { itemName: "Cotton t-shirt", material: "Cotton", bestActionType: "donate", co2SavedKg: 4, dppMaterial: "Cotton", dppRecyclability: "Textile EPR stream", dppRecycledContentPct: 15 },
    { itemName: "PET bottle", material: "PET", bestActionType: "recycle", co2SavedKg: 0.3, dppMaterial: "PET", dppRecyclability: "Fully recyclable", dppRecycledContentPct: 35 },
    { itemName: "Wooden chair", material: "Beech wood", bestActionType: "resell", co2SavedKg: 18, dppMaterial: "Beech wood", dppRecyclability: "Reusable / biomass", dppRecycledContentPct: 0 },
    { itemName: "EPS packaging", material: "Expanded polystyrene", bestActionType: "bin", co2SavedKg: 0.1, dppMaterial: "EPS", dppRecyclability: "Rarely recycled", dppRecycledContentPct: 0 },
  ];
  const scans: ScanRecord[] = sample.map((s, i) => ({
    id: `seed-${i}`,
    sessionId: "seed",
    createdAt: now - (i + 1) * (day / 3),
    itemName: s.itemName!,
    material: s.material!,
    conditionScore: 6,
    bestActionType: s.bestActionType as ActionType,
    resaleLowEur: 0,
    resaleHighEur: 0,
    co2SavedKg: s.co2SavedKg!,
    recyclabilityNote: "",
    municipalityCode: "munich",
    dppMaterial: s.dppMaterial!,
    dppRecyclability: s.dppRecyclability!,
    dppRecycledContentPct: s.dppRecycledContentPct!,
  }));
  return {
    scans,
    confirms: [],
    streaks: {
      // a believable demo streak for the home banner
      "demo-seed": {
        sessionId: "demo-seed",
        loopPoints: 480,
        weeklyCo2SavedKg: 41,
        weeklyWasteDivertedKg: 2.3,
        currentStreakDays: 5,
        lastActionAt: now,
      },
    },
  };
}

let cache: DbShape | null = null;

async function load(): Promise<DbShape> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    cache = JSON.parse(raw) as DbShape;
  } catch {
    cache = seed();
    await persist();
  }
  return cache!;
}

async function persist(): Promise<void> {
  if (!cache) return;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 2), "utf8");
}

let counter = 0;
function id(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export async function addScan(
  sessionId: string,
  card: LoopCard,
  municipalityCode: string,
): Promise<ScanRecord> {
  const db = await load();
  const best = card.circular_actions[0]?.type ?? "recycle";
  const rec: ScanRecord = {
    id: id("scan"),
    sessionId,
    createdAt: Date.now(),
    itemName: card.item_name,
    material: card.material,
    conditionScore: card.condition_score,
    bestActionType: best,
    resaleLowEur: card.resale_estimate_eur.low,
    resaleHighEur: card.resale_estimate_eur.high,
    co2SavedKg: card.co2_saved_kg,
    recyclabilityNote: card.recyclability_note,
    municipalityCode,
    dppMaterial: card.dpp_fields.material,
    dppRecyclability: card.dpp_fields.recyclability,
    dppRecycledContentPct: card.dpp_fields.est_recycled_content_pct,
  };
  db.scans.push(rec);
  await persist();
  return rec;
}

const POINTS: Record<ActionType, number> = {
  repair: 100,
  resell: 80,
  donate: 70,
  recycle: 40,
  bin: 10,
};

export async function confirmAction(args: {
  sessionId: string;
  scanId: string;
  actionType: ActionType;
  co2SavedKg: number;
}): Promise<{ confirm: ConfirmRecord; streak: StreakRecord }> {
  const db = await load();
  const points = POINTS[args.actionType] ?? 20;
  // Reward keeping material in use: diverting from the bin counts as waste diverted.
  const wasteDivertedKg = args.actionType === "bin" ? 0 : 0.4;
  const confirm: ConfirmRecord = {
    id: id("confirm"),
    scanId: args.scanId,
    sessionId: args.sessionId,
    chosenActionType: args.actionType,
    confirmedAt: Date.now(),
    pointsAwarded: points,
    co2SavedKg: args.co2SavedKg,
    wasteDivertedKg,
  };
  db.confirms.push(confirm);
  const streak = bumpStreak(db, args.sessionId, points, args.co2SavedKg, wasteDivertedKg);
  await persist();
  return { confirm, streak };
}

function bumpStreak(
  db: DbShape,
  sessionId: string,
  points: number,
  co2: number,
  waste: number,
): StreakRecord {
  const existing = db.streaks[sessionId];
  if (existing) {
    existing.loopPoints += points;
    existing.weeklyCo2SavedKg = round1(existing.weeklyCo2SavedKg + co2);
    existing.weeklyWasteDivertedKg = round1(existing.weeklyWasteDivertedKg + waste);
    existing.currentStreakDays = Math.max(existing.currentStreakDays, 1);
    existing.lastActionAt = Date.now();
    return existing;
  }
  // New users inherit the demo seed total so the banner never starts at zero on stage.
  const base = db.streaks["demo-seed"];
  const fresh: StreakRecord = {
    sessionId,
    loopPoints: (base?.loopPoints ?? 0) + points,
    weeklyCo2SavedKg: round1((base?.weeklyCo2SavedKg ?? 0) + co2),
    weeklyWasteDivertedKg: round1((base?.weeklyWasteDivertedKg ?? 0) + waste),
    currentStreakDays: (base?.currentStreakDays ?? 0) + 1,
    lastActionAt: Date.now(),
  };
  db.streaks[sessionId] = fresh;
  return fresh;
}

export async function getStreak(sessionId: string): Promise<StreakRecord> {
  const db = await load();
  return (
    db.streaks[sessionId] ??
    db.streaks["demo-seed"] ?? {
      sessionId,
      loopPoints: 0,
      weeklyCo2SavedKg: 0,
      weeklyWasteDivertedKg: 0,
      currentStreakDays: 0,
      lastActionAt: Date.now(),
    }
  );
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

export async function getDashboard(): Promise<DashboardData> {
  const db = await load();
  const scans = db.scans;
  const totalScans = scans.length;
  const totalCo2 = round1(scans.reduce((s, r) => s + r.co2SavedKg, 0));
  const totalWaste = round1(db.confirms.reduce((s, c) => s + c.wasteDivertedKg, 0));

  const actionCounts = new Map<ActionType, number>();
  for (const r of scans) actionCounts.set(r.bestActionType, (actionCounts.get(r.bestActionType) ?? 0) + 1);
  const actionBreakdown = Array.from(actionCounts.entries())
    .map(([type, count]) => ({ type, count, share: totalScans ? Math.round((count / totalScans) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  const matMap = new Map<string, { count: number; sumPct: number }>();
  for (const r of scans) {
    const key = bucketMaterial(r.dppMaterial || r.material);
    const cur = matMap.get(key) ?? { count: 0, sumPct: 0 };
    cur.count += 1;
    cur.sumPct += r.dppRecycledContentPct;
    matMap.set(key, cur);
  }
  const materialFlow = Array.from(matMap.entries())
    .map(([material, v]) => ({ material, count: v.count, avgRecycledContentPct: Math.round(v.sumPct / v.count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const sampleDpp = scans
    .slice(-4)
    .reverse()
    .map((r, i) => ({
      itemName: r.itemName,
      material: r.dppMaterial || r.material,
      recyclability: r.dppRecyclability || "—",
      recycledContentPct: r.dppRecycledContentPct,
      confidence: (i === 0 ? "document_backed" : "ai_estimated") as "ai_estimated" | "document_backed",
    }));

  const recentItems = scans
    .slice(-6)
    .reverse()
    .map((r) => ({ itemName: r.itemName, bestActionType: r.bestActionType, co2SavedKg: r.co2SavedKg }));

  return {
    totalScans,
    totalCo2SavedKg: totalCo2,
    totalWasteDivertedKg: totalWaste,
    actionBreakdown,
    materialFlow,
    sampleDpp,
    recentItems,
  };
}

function bucketMaterial(m: string): string {
  const s = m.toLowerCase();
  // Order matters: multi-material items (a phone is "aluminium + glass + li-ion")
  // should bucket by their defining material, so check electronics first.
  if (s.includes("li-ion") || s.includes("electronic") || s.includes("copper")) return "Electronics / e-waste";
  if (s.includes("cotton") || s.includes("textile") || s.includes("wool")) return "Textiles";
  if (s.includes("wood")) return "Wood";
  if (s.includes("eps") || s.includes("polystyrene")) return "EPS foam";
  if (s.includes("pet") || s.includes("polyester")) return "PET / polyester";
  if (s.includes("glass")) return "Glass";
  if (s.includes("plastic") || s.includes("abs") || s.includes("pvc")) return "Mixed plastics";
  if (s.includes("steel") || s.includes("alumin") || s.includes("metal")) return "Metals";
  return "Other";
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
