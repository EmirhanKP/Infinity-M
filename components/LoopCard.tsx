"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ScanResponse, ResaleGrounding } from "@/lib/clientTypes";
import type { ActionType } from "@/lib/ai/loopcard";
import { ACTION_META, effortDots } from "@/lib/ui";

export default function LoopCard({
  scan,
  previewUrl,
  onConfirm,
  onScanNext,
  onStartRepair,
}: {
  scan: ScanResponse;
  previewUrl: string;
  onConfirm: (actionType: ActionType, co2: number) => void;
  onScanNext: () => void;
  onStartRepair: (itemName: string) => void;
}) {
  const { card, links } = scan;
  const best = card.circular_actions[0]?.type as ActionType | undefined;
  const isBin = best === "bin";

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="w-full overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl"
    >
      {/* Header */}
      <div className="flex gap-4 border-b border-zinc-100 p-5">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="scanned item" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">📦</div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-zinc-900">{card.item_name}</h2>
          <p className="truncate text-sm text-zinc-500">{card.material}</p>
          {card.brand_model_guess && (
            <p className="truncate text-xs text-zinc-400">{card.brand_model_guess}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-zinc-500">Condition</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${card.condition_score * 10}%` }}
              />
            </div>
            <span className="text-xs font-medium text-zinc-600">{card.condition_score}/10</span>
          </div>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-px bg-zinc-100">
        <div className="bg-white p-3 text-center">
          <div className="text-[11px] uppercase tracking-wide text-zinc-400">CO₂ saved</div>
          <div className="text-lg font-bold text-emerald-700">{card.co2_saved_kg} kg</div>
        </div>
        <div className="bg-white p-3 text-center">
          <div className="text-[11px] uppercase tracking-wide text-zinc-400">Resale value</div>
          <div className="text-lg font-bold text-sky-700">
            {card.resale_estimate_eur.high > 0
              ? `€${card.resale_estimate_eur.low}–${card.resale_estimate_eur.high}`
              : "—"}
          </div>
        </div>
      </div>

      {/* Action hierarchy */}
      <div className="space-y-3 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Best action first · {scan.municipality}
        </p>
        {card.circular_actions.map((action, i) => {
          const meta = ACTION_META[action.type as ActionType];
          const isBest = i === 0;
          const actionLinks = links[action.type] ?? [];
          return (
            <div
              key={`${action.type}-${i}`}
              className={`rounded-2xl border p-4 ${
                isBest ? `ring-2 ${meta.ring} border-transparent bg-zinc-50` : "border-zinc-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.chip}`}>
                  <span>{meta.emoji}</span>
                  {meta.label}
                </span>
                {isBest && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Best loop
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-zinc-700">{action.instructions}</p>
              {action.local_hint && (
                <p className="mt-1 text-xs text-zinc-500">📍 {action.local_hint}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                <span>Effort {effortDots(action.effort_1to5)}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {action.type === "repair" && isBest && (
                  <button
                    type="button"
                    onClick={() => onStartRepair(card.item_name)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white ${meta.solid}`}
                  >
                    🛠️ Start guided repair
                  </button>
                )}
                {action.type === "resell" && (
                  <ResaleComps itemName={card.item_name} conditionNote={`condition ${card.condition_score}/10`} />
                )}
                {actionLinks.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    {l.label} ↗
                  </a>
                ))}
                <button
                  type="button"
                  onClick={() => onConfirm(action.type as ActionType, card.co2_saved_kg)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white ${meta.solid}`}
                >
                  ✓ {meta.verb}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alternatives nudge (bin verdict) */}
      {isBin && card.alternatives.length > 0 && (
        <div className="mx-5 mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">💡 Next time, buy circular</p>
          <ul className="mt-2 space-y-2">
            {card.alternatives.map((a) => (
              <li key={a.name} className="text-sm text-amber-900">
                <span className="font-medium">{a.name}</span>
                <span className="text-amber-800/80"> — {a.why}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DPP + recyclability footer */}
      <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 text-xs text-zinc-500">
        <p>{card.recyclability_note}</p>
        <p className="mt-2">
          <span className="font-medium text-zinc-600">Draft Digital Product Passport:</span>{" "}
          {card.dpp_fields.material} · {card.dpp_fields.recyclability} · ~
          {card.dpp_fields.est_recycled_content_pct}% recycled content
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-zinc-400">
            {scan.source === "live"
              ? "● Live AI scan"
              : scan.source === "mock-fallback"
                ? "● Cached (live unavailable)"
                : "● Demo data"}
          </span>
          <button
            type="button"
            onClick={onScanNext}
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            Scan next →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ResaleComps({ itemName, conditionNote }: { itemName: string; conditionNote: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [data, setData] = useState<ResaleGrounding | null>(null);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/resale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName, conditionNote }),
      });
      const json = (await res.json()) as { grounding: ResaleGrounding };
      setData(json.grounding);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  if (state === "done" && data) {
    return (
      <div className="w-full rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs">
        <p className="font-semibold text-sky-900">Live comps: €{data.low}–{data.high}</p>
        <p className="mt-0.5 text-sky-800/80">{data.note}</p>
        {data.links.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {data.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="underline">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={state === "loading"}
      className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-100 disabled:opacity-60"
    >
      {state === "loading" ? "Searching comps…" : "🔎 Get live resale comps"}
    </button>
  );
}
