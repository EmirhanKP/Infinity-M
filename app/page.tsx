"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import CameraCapture, { type Capture } from "@/components/CameraCapture";
import LoopCard from "@/components/LoopCard";
import MiniHistory, { type HistoryItem } from "@/components/MiniHistory";
import MultiScanView, { type MultiItem } from "@/components/MultiScanView";
import SingleItemChooser from "@/components/SingleItemChooser";
import StreakBanner from "@/components/StreakBanner";
import Logo from "@/components/Logo";
import RepairCoach from "@/components/RepairCoach";
import ImpactCard from "@/components/ImpactCard";
import ImpactTranslator from "@/components/ImpactTranslator";
import Confetti from "@/components/Confetti";
import ScanningOverlay from "@/components/ScanningOverlay";
import { celebrate } from "@/lib/haptics";
import type { ScanChoiceResponse, ScanResponse, SingleScanResponse, StreakValues } from "@/lib/clientTypes";
import type { ActionType, LoopCard as LoopCardData } from "@/lib/ai/loopcard";

// Synthesize a minimal Loop Card from a multi-scan item so /api/refine has a
// currentCard to work from when we drill a pile item into the full single view.
function multiItemToCard(item: MultiItem): LoopCardData {
  return {
    item_name: item.label,
    material: item.material,
    brand_model_guess: "",
    condition_score: item.condition_score,
    circular_actions: [
      { type: item.best_action, instructions: item.instruction, effort_1to5: 2, local_hint: item.local_hint },
    ],
    resale_estimate_eur: { low: item.resale_low, high: item.resale_high },
    co2_saved_kg: item.co2_saved_kg,
    recyclability_note: item.instruction,
    alternatives: [],
    recoverable_materials: { summary: "", est_value_eur: 0 },
    dpp_fields: { material: item.material, recyclability: "AI-estimated", est_recycled_content_pct: 0 },
    data_basis: "ai_estimate",
    data_note: "From your pile scan — refine for precise figures.",
    other_items_detected: [],
  };
}

function selectedItemToCard(itemName: string): LoopCardData {
  return {
    item_name: itemName,
    material: "AI-estimated material after item selection",
    brand_model_guess: "",
    condition_score: 5,
    circular_actions: [
      { type: "recycle", instructions: "Waiting for focused analysis.", effort_1to5: 1, local_hint: "" },
    ],
    resale_estimate_eur: { low: 0, high: 0 },
    co2_saved_kg: 0,
    recyclability_note: "Draft DPP will be generated from the selected item analysis.",
    alternatives: [],
    recoverable_materials: { summary: "", est_value_eur: 0 },
    dpp_fields: {
      material: "AI-estimated material after item selection",
      recyclability: "AI-estimated from selected item",
      est_recycled_content_pct: 0,
    },
    data_basis: "ai_estimate",
    data_note: "Waiting for focused analysis.",
    other_items_detected: [],
  };
}

const ZERO_STREAK: StreakValues = {
  loopPoints: 0,
  weeklyCo2SavedKg: 0,
  weeklyWasteDivertedKg: 0,
  currentStreakDays: 0,
};

interface MultiState {
  items: MultiItem[];
  source: string;
  municipality: string;
}

function historyStorageKey(sessionId: string): string {
  return `reloop-history:${sessionId}`;
}

function historyFromScan(scan: ScanResponse): HistoryItem {
  const best = scan.card.circular_actions[0]?.type ?? "recycle";
  return {
    scanId: scan.scanId,
    itemName: scan.card.item_name,
    bestAction: best as ActionType,
    co2SavedKg: scan.card.co2_saved_kg,
    resaleLowEur: scan.card.resale_estimate_eur.low,
    resaleHighEur: scan.card.resale_estimate_eur.high,
    createdAt: Date.now(),
  };
}

function historyFromMultiItem(item: MultiItem): HistoryItem | null {
  if (!item.scanId) return null;
  return {
    scanId: item.scanId,
    itemName: item.label,
    bestAction: item.best_action as ActionType,
    co2SavedKg: item.co2_saved_kg,
    resaleLowEur: item.resale_low,
    resaleHighEur: item.resale_high,
    createdAt: Date.now(),
  };
}

function useSessionId() {
  const [id, setId] = useState<string>("anon");
  useEffect(() => {
    let s = localStorage.getItem("reloop-session");
    if (!s) {
      s = crypto.randomUUID();
      localStorage.setItem("reloop-session", s);
    }
    setTimeout(() => setId(s), 0);
  }, []);
  return id;
}

export default function Home() {
  const sessionId = useSessionId();
  const [phase, setPhase] = useState<"scan" | "scanning" | "choose-item" | "result" | "result-multi">("scan");
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [multi, setMulti] = useState<MultiState | null>(null);
  const [singleChoice, setSingleChoice] = useState<ScanChoiceResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [lastImage, setLastImage] = useState<string>("");
  const [lastMedia, setLastMedia] = useState<string>("image/jpeg");
  const [streak, setStreak] = useState<StreakValues>(ZERO_STREAK);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [repairFor, setRepairFor] = useState<string | null>(null);
  const [showImpact, setShowImpact] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const [refining, setRefining] = useState(false);
  const [cheering, setCheering] = useState(false);
  const [cameFromMulti, setCameFromMulti] = useState(false);

  useEffect(() => {
    if (sessionId === "anon") return;
    fetch(`/api/streak?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((j) => setStreak(j.streak))
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (sessionId === "anon") return;
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(historyStorageKey(sessionId));
        setHistory(raw ? (JSON.parse(raw) as HistoryItem[]) : []);
      } catch {
        setHistory([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [sessionId]);

  function addHistoryItems(items: Array<HistoryItem | null>) {
    const valid = items.filter((item): item is HistoryItem => Boolean(item));
    if (!valid.length) return;

    setHistory((current) => {
      const next = [...valid, ...current]
        .filter((item, index, all) => all.findIndex((candidate) => candidate.scanId === item.scanId) === index)
        .slice(0, 3);
      if (sessionId !== "anon") {
        localStorage.setItem(historyStorageKey(sessionId), JSON.stringify(next));
      }
      return next;
    });
  }

  async function handleCapture(c: Capture) {
    setPhase("scanning");
    setScan(null);
    setMulti(null);
    setSingleChoice(null);
    setPreviewUrl(c.previewUrl);
    setLastImage(c.imageBase64);
    setLastMedia(c.mediaType);
    try {
      if (c.mode === "pile") {
        const res = await fetch("/api/scan-multi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: c.imageBase64, mediaType: c.mediaType, sessionId, hint: c.hint }),
        });
        const json = await res.json();
        setMulti({ items: json.items, source: json.source, municipality: json.municipality });
        addHistoryItems(json.items.map((item: MultiItem) => historyFromMultiItem(item)));
        setPhase("result-multi");
      } else {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: c.imageBase64, mediaType: c.mediaType, sessionId, hint: c.hint }),
        });
        const json = (await res.json()) as SingleScanResponse;
        if (json.kind === "choose-item") {
          setSingleChoice(json);
          setPhase("choose-item");
        } else {
          setScan(json);
          addHistoryItems([historyFromScan(json)]);
          setPhase("result");
        }
      }
    } catch {
      setToast("Scan failed — try again");
      setPhase("scan");
    }
  }

  async function handleConfirm(scanId: string, actionType: ActionType, co2: number) {
    try {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, scanId, actionType, co2SavedKg: co2 }),
      });
      const json = await res.json();
      const gained = json.streak.loopPoints - streak.loopPoints;
      setStreak(json.streak);
      showToast(`+${gained > 0 ? gained : json.confirm.pointsAwarded} Loop Points`);
    } catch {
      showToast("Saved locally");
    } finally {
      // Celebrate the loop being closed — confetti + a haptic triple-tap.
      celebrate();
      setCheering(true);
    }
  }

  async function handleRefine(correction: string) {
    if (!scan || !correction) return;
    setRefining(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: lastImage,
          mediaType: lastMedia,
          sessionId,
          correction,
          currentCard: scan.card,
        }),
      });
      const json = (await res.json()) as ScanResponse;
      setScan(json);
      addHistoryItems([historyFromScan(json)]);
      showToast("Refined with your model ✓");
    } catch {
      showToast("Refine failed — try again");
    } finally {
      setRefining(false);
    }
  }

  async function chooseSingleItem(itemName: string) {
    if (!singleChoice) return;
    setRefining(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: lastImage,
          mediaType: lastMedia,
          sessionId,
          correction: `Focus only on the ${itemName} in this photo and produce its Loop Card for that single item.`,
          currentCard: selectedItemToCard(itemName),
        }),
      });
      const json = (await res.json()) as ScanResponse;
      setScan(json);
      addHistoryItems([historyFromScan(json)]);
      setSingleChoice(null);
      setPhase("result");
    } catch {
      showToast("Could not load that item");
      setPhase("choose-item");
    } finally {
      setRefining(false);
    }
  }

  // Drill a pile item into the full single Loop Card (re-analyzed live, focused
  // on that one item) so each multi item gets the same rich options + review.
  async function openMultiItem(item: MultiItem) {
    setPhase("scanning");
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: lastImage,
          mediaType: lastMedia,
          sessionId,
          correction: `Focus only on the ${item.label} in this photo and produce its Loop Card for that single item.`,
          currentCard: multiItemToCard(item),
        }),
      });
      const json = (await res.json()) as ScanResponse;
      setScan(json);
      addHistoryItems([historyFromScan(json)]);
      setCameFromMulti(true);
      setPhase("result");
    } catch {
      showToast("Could not load that item");
      setPhase("result-multi");
    }
  }

  function backToList() {
    setScan(null);
    setCameFromMulti(false);
    setPhase("result-multi");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function scanNext() {
    setScan(null);
    setMulti(null);
    setSingleChoice(null);
    setPreviewUrl("");
    setCameFromMulti(false);
    setPhase("scan");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-10 w-10" />
          <div>
            <h1 className="text-2xl font-extrabold lowercase tracking-tight text-[#101817]">reloop</h1>
            <p className="text-xs text-[#101817]/60">Snap it. Score it. Loop it.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/learn"
            className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            Learn
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            B2B →
          </Link>
          <Link
            href="/brand"
            className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Brands
          </Link>
        </div>
      </header>

      <button onClick={() => setShowTranslator(true)} className="w-full text-left">
        <StreakBanner streak={streak} />
        <p className="mt-1 text-center text-[10px] text-emerald-700/60">tap to see what that really means →</p>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <CameraCapture onCapture={handleCapture} busy={false} />
              <div className="mt-4">
                <MiniHistory items={history} />
              </div>
            </motion.div>
          )}

          {phase === "scanning" && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <ScanningOverlay previewUrl={previewUrl} />
            </motion.div>
          )}

          {phase === "choose-item" && singleChoice && (
            <motion.div key="choose-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <SingleItemChooser
                choices={singleChoice.choices}
                previewUrl={previewUrl}
                busy={refining}
                onChoose={chooseSingleItem}
                onRetake={scanNext}
              />
            </motion.div>
          )}

          {phase === "result" && scan && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              {cameFromMulti && (
                <button
                  onClick={backToList}
                  className="mb-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
                >
                  ← Back to list
                </button>
              )}
              <LoopCard
                scan={scan}
                previewUrl={previewUrl}
                refining={refining}
                onConfirm={(actionType, co2) => handleConfirm(scan.scanId, actionType, co2)}
                onScanNext={scanNext}
                onStartRepair={(itemName) => setRepairFor(itemName)}
                onRefine={handleRefine}
              />
            </motion.div>
          )}

          {phase === "result-multi" && multi && (
            <motion.div key="result-multi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <MultiScanView
                items={multi.items}
                previewUrl={previewUrl}
                source={multi.source}
                municipality={multi.municipality}
                onConfirm={handleConfirm}
                onScanNext={scanNext}
                onOpenItem={openMultiItem}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Celebration confetti */}
      {cheering && <Confetti onDone={() => setCheering(false)} />}

      {/* Reward toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 bottom-8 z-40 mx-auto w-fit rounded-full bg-emerald-600 px-6 py-3 text-base font-bold text-white shadow-xl"
          >
            🎉 {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Repair coach */}
      {repairFor && (
        <RepairCoach
          itemName={repairFor}
          onClose={() => setRepairFor(null)}
          onComplete={() => {
            setRepairFor(null);
            if (scan) handleConfirm(scan.scanId, "repair", scan.card.co2_saved_kg);
          }}
        />
      )}

      {/* Impact translator (tangible equivalences) */}
      {showTranslator && (
        <ImpactTranslator
          streak={streak}
          onShare={() => {
            setShowTranslator(false);
            setShowImpact(true);
          }}
          onClose={() => setShowTranslator(false)}
        />
      )}

      {/* Shareable impact card */}
      {showImpact && <ImpactCard streak={streak} onClose={() => setShowImpact(false)} />}

      <footer className="pt-2 text-center text-[10px] text-emerald-700/50">
        Reloop · circular-economy AI · SDG 12 / 13 / 11
      </footer>
    </div>
  );
}
