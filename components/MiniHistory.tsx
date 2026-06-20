"use client";

import Link from "next/link";
import type { ActionType } from "@/lib/ai/loopcard";
import { ACTION_META } from "@/lib/ui";

export interface HistoryItem {
  scanId: string;
  itemName: string;
  bestAction: ActionType;
  co2SavedKg: number;
  resaleLowEur: number;
  resaleHighEur: number;
  createdAt: number;
}

function timeAgo(ts: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - ts) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function MiniHistory({ items }: { items: HistoryItem[] }) {
  if (!items.length) return null;

  return (
    <section className="glass w-full overflow-hidden rounded-3xl border border-emerald-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Recent loops</p>
          <p className="text-[11px] text-zinc-500">Your last scanned items</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
          last {items.length}
        </span>
      </div>

      <div className="divide-y divide-zinc-100">
        {items.map((item) => {
          const meta = ACTION_META[item.bestAction];
          const hasResale = item.resaleHighEur > 0;
          return (
            <Link
              key={item.scanId}
              href={`/dpp/${item.scanId}`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-emerald-50/60"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border text-base ${meta.chip}`}>
                {meta.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-zinc-900">{item.itemName}</p>
                  <span className="shrink-0 text-[10px] text-zinc-400">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                  {meta.label} loop - {item.co2SavedKg} kg CO2 saved
                  {hasResale ? ` - EUR ${item.resaleLowEur}-${item.resaleHighEur}` : ""}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">DPP</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
