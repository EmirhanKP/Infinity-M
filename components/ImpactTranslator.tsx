"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { StreakValues } from "@/lib/clientTypes";

function useCountUp(value: number, ms = 800) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, ms]);
  return display;
}

function fmt(n: number): string {
  if (n >= 1000) return Math.round(n).toLocaleString("en-US");
  if (n >= 10) return Math.round(n).toString();
  return (Math.round(n * 10) / 10).toString();
}

function Equiv({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  const v = useCountUp(value);
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-3 text-center shadow-sm">
      <div className="text-3xl">{emoji}</div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-700">{fmt(v)}</div>
      <div className="text-[11px] leading-tight text-zinc-500">{label}</div>
    </div>
  );
}

const SCALES = [
  { label: "Just you", m: 1, emoji: "🧍" },
  { label: "Your street ×50", m: 50, emoji: "🏘️" },
  { label: "Your city ×10k", m: 10000, emoji: "🌆" },
];

export default function ImpactTranslator({
  streak,
  onShare,
  onClose,
}: {
  streak: StreakValues;
  onShare: () => void;
  onClose: () => void;
}) {
  const [scaleIdx, setScaleIdx] = useState(0);
  const m = SCALES[scaleIdx].m;
  const co2 = streak.weeklyCo2SavedKg * m;
  const waste = streak.weeklyWasteDivertedKg * m;

  const trees = Math.round(co2 / 21);
  const treeEmojis = Math.min(trees, 60);

  const co2Cards = [
    { emoji: "🚗", value: co2 / 0.12, label: "km not driven" },
    { emoji: "📱", value: co2 / 0.0084, label: "phone charges" },
    { emoji: "🌳", value: co2 / 21, label: "trees working a year" },
    { emoji: "🍔", value: co2 / 3, label: "beef burgers' CO₂" },
  ];
  const wasteCards = [
    { emoji: "🥤", value: waste / 0.02, label: "PET bottles diverted" },
    { emoji: "🍌", value: waste / 0.12, label: "bananas in weight" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" onClick={onClose}>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-zinc-50 p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-emerald-900">What that really means</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {fmt(co2)} kg CO₂ &amp; {fmt(waste)} kg waste — made tangible.
        </p>

        {/* Scale selector — the "wow" multiplier */}
        <div className="mt-3 flex gap-1 rounded-full bg-emerald-100 p-1 text-xs font-semibold">
          {SCALES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setScaleIdx(i)}
              className={`flex-1 rounded-full px-2 py-1.5 transition ${i === scaleIdx ? "bg-white text-emerald-800 shadow" : "text-emerald-700/70"}`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* Forest visual */}
        <div className="mt-4 rounded-2xl bg-gradient-to-b from-sky-50 to-emerald-50 p-4">
          <p className="text-center text-sm font-semibold text-emerald-900">
            🌳 {fmt(trees)} trees soaking up CO₂ for a year
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-0.5 text-xl leading-none">
            <AnimatePresence mode="popLayout">
              {Array.from({ length: treeEmojis }).map((_, i) => (
                <motion.span
                  key={`${scaleIdx}-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.01, 0.5) }}
                >
                  🌳
                </motion.span>
              ))}
            </AnimatePresence>
            {trees > treeEmojis && (
              <span className="self-center pl-1 text-xs font-semibold text-emerald-700">
                +{fmt(trees - treeEmojis)} more
              </span>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">Your CO₂ saved equals</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {co2Cards.map((c) => (
            <Equiv key={c.label} {...c} />
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">Waste kept in the loop</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {wasteCards.map((c) => (
            <Equiv key={c.label} {...c} />
          ))}
        </div>

        {m > 1 && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-center text-xs text-amber-900">
            😮 If {m.toLocaleString("en-US")} people looped like you, that&apos;s the impact above — every single week.
          </p>
        )}
        <p className="mt-2 text-center text-[10px] text-zinc-400">Equivalences are approximate (EU averages).</p>

        <button
          onClick={onShare}
          className="mt-4 w-full rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          📤 Share my impact
        </button>
      </motion.div>
    </div>
  );
}
