"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import CameraCapture, { type Capture } from "@/components/CameraCapture";
import LoopCard from "@/components/LoopCard";
import MultiScanView, { type MultiItem } from "@/components/MultiScanView";
import StreakBanner from "@/components/StreakBanner";
import Logo from "@/components/Logo";
import RepairCoach from "@/components/RepairCoach";
import ImpactCard from "@/components/ImpactCard";
import ImpactTranslator from "@/components/ImpactTranslator";
import type { ScanResponse, StreakValues } from "@/lib/clientTypes";
import type { ActionType } from "@/lib/ai/loopcard";

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

function useSessionId() {
  const [id, setId] = useState<string>("anon");
  useEffect(() => {
    let s = localStorage.getItem("reloop-session");
    if (!s) {
      s = crypto.randomUUID();
      localStorage.setItem("reloop-session", s);
    }
    setId(s);
  }, []);
  return id;
}

export default function Home() {
  const sessionId = useSessionId();
  const [phase, setPhase] = useState<"scan" | "scanning" | "result" | "result-multi">("scan");
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [multi, setMulti] = useState<MultiState | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [lastImage, setLastImage] = useState<string>("");
  const [lastMedia, setLastMedia] = useState<string>("image/jpeg");
  const [streak, setStreak] = useState<StreakValues>(ZERO_STREAK);
  const [toast, setToast] = useState<string | null>(null);
  const [repairFor, setRepairFor] = useState<string | null>(null);
  const [showImpact, setShowImpact] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const [refining, setRefining] = useState(false);

  useEffect(() => {
    if (sessionId === "anon") return;
    fetch(`/api/streak?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((j) => setStreak(j.streak))
      .catch(() => {});
  }, [sessionId]);

  async function handleCapture(c: Capture) {
    setPhase("scanning");
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
        setPhase("result-multi");
      } else {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: c.imageBase64, mediaType: c.mediaType, sessionId, hint: c.hint }),
        });
        const json = (await res.json()) as ScanResponse;
        setScan(json);
        setPhase("result");
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
      showToast("Refined with your model ✓");
    } catch {
      showToast("Refine failed — try again");
    } finally {
      setRefining(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function scanNext() {
    setScan(null);
    setMulti(null);
    setPreviewUrl("");
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
            </motion.div>
          )}

          {phase === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-16"
            >
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="scanning" className="h-32 w-32 rounded-2xl object-cover shadow-lg" />
              )}
              <div className="flex items-center gap-2 text-emerald-700">
                <span className="h-3 w-3 animate-ping rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">Reading & ranking circular actions…</span>
              </div>
            </motion.div>
          )}

          {phase === "result" && scan && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
