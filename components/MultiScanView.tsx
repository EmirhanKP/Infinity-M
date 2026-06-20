"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MultiScanItem, DeepLink } from "@/lib/clientTypes";
import type { ActionType } from "@/lib/ai/loopcard";
import { ACTION_META } from "@/lib/ui";

export type MultiItem = MultiScanItem & { links: DeepLink[] };

const BOX_COLOR: Record<ActionType, string> = {
  repair: "border-emerald-500 bg-emerald-500/10",
  resell: "border-sky-500 bg-sky-500/10",
  donate: "border-violet-500 bg-violet-500/10",
  recycle: "border-teal-500 bg-teal-500/10",
  bin: "border-zinc-400 bg-zinc-400/10",
};

export default function MultiScanView({
  items,
  previewUrl,
  source,
  municipality,
  onConfirm,
  onScanNext,
  onOpenItem,
}: {
  items: MultiItem[];
  previewUrl: string;
  source: string;
  municipality: string;
  onConfirm: (scanId: string, actionType: ActionType, co2: number) => void;
  onScanNext: () => void;
  onOpenItem: (item: MultiItem) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const totalCo2 = Math.round(items.reduce((s, i) => s + i.co2_saved_kg, 0) * 10) / 10;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="w-full overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl"
    >
      <div className="border-b border-zinc-100 p-4">
        <h2 className="text-lg font-bold text-zinc-900">
          {items.length} items found · {totalCo2} kg CO₂ if you loop them all
        </h2>
        <p className="text-xs text-zinc-500">One photo → the AI triaged your whole pile · {municipality}</p>
      </div>

      {/* Image with bounding boxes */}
      <div className="relative mx-4 my-4 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 to-emerald-50">
        <div className="relative aspect-square w-full">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="your items" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">
              your items
            </div>
          )}
          {items.map((it, i) => {
            const meta = ACTION_META[it.best_action as ActionType];
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`absolute rounded-lg border-2 transition ${BOX_COLOR[it.best_action as ActionType]} ${
                  active === i ? "ring-2 ring-offset-1 ring-emerald-500" : ""
                }`}
                style={{
                  left: `${it.box.x * 100}%`,
                  top: `${it.box.y * 100}%`,
                  width: `${it.box.w * 100}%`,
                  height: `${it.box.h * 100}%`,
                }}
              >
                <span className="absolute -top-2 left-0 whitespace-nowrap rounded-full border border-white bg-white px-1.5 py-0.5 text-[9px] font-bold shadow-sm">
                  {meta.emoji} {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Item list */}
      <div className="space-y-2 px-4 pb-4">
        {items.map((it, i) => {
          const meta = ACTION_META[it.best_action as ActionType];
          return (
            <div
              key={i}
              onMouseEnter={() => setActive(i)}
              className={`rounded-2xl border p-3 transition ${active === i ? "border-emerald-300 bg-emerald-50/50" : "border-zinc-100"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-zinc-900">{it.label}</span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.chip}`}>
                  {meta.emoji} {meta.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">{it.instruction}</p>
              <p className="text-[11px] text-zinc-400">📍 {it.local_hint}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-emerald-700">{it.co2_saved_kg} kg CO₂</span>
                {it.resale_high > 0 && (
                  <span className="text-[11px] text-sky-700">€{it.resale_low}–{it.resale_high}</span>
                )}
                {it.scanId && (
                  <Link
                    href={`/dpp/${it.scanId}`}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    DPP
                  </Link>
                )}
                <button
                  onClick={() => onOpenItem(it)}
                  className="ml-auto rounded-full border border-emerald-300 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  🔎 Review &amp; options
                </button>
                <button
                  onClick={() => it.scanId && onConfirm(it.scanId, it.best_action as ActionType, it.co2_saved_kg)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold text-white ${meta.solid}`}
                >
                  ✓ {meta.verb}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-4 py-3 text-xs">
        <span className="text-[10px] uppercase tracking-wide text-zinc-400">
          {source === "live" ? "● Live AI multi-scan" : source === "mock-fallback" ? "● Cached (live unavailable)" : "● Demo data"}
        </span>
        <button
          onClick={onScanNext}
          className="rounded-full bg-emerald-600 px-4 py-1.5 font-semibold text-white transition hover:bg-emerald-700"
        >
          Scan next →
        </button>
      </div>
    </motion.div>
  );
}
