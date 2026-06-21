"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/Logo";
import CountUp from "@/components/CountUp";
import type { DashboardData } from "@/lib/clientTypes";
import { ACTION_META } from "@/lib/ui";
import type { ActionType } from "@/lib/ai/loopcard";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#101817]">
              <span className="lowercase">reloop</span> · Material-Flow &amp; DPP
            </h1>
            <p className="text-sm text-emerald-700/70">
              Anonymized end-of-life data crowdsourced from consumer scans — the B2B layer for municipalities &amp; EPR schemes.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/brand"
            className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            For brands →
          </Link>
          <Link
            href="/"
            className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            ← Back to app
          </Link>
        </div>
      </header>

      {!data ? (
        <p className="text-sm text-zinc-500">Loading aggregates…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Kpi label="Items scanned" value={<CountUp value={data.totalScans} />} accent="text-emerald-700" />
            <Kpi label="CO₂ saved (kg)" value={<CountUp value={data.totalCo2SavedKg} decimals={1} />} accent="text-teal-700" />
            <Kpi label="Waste diverted (kg)" value={<CountUp value={data.totalWasteDivertedKg} decimals={1} />} accent="text-sky-700" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glow-mint rounded-2xl border border-emerald-200 bg-white/70 p-4 text-center shadow-sm">
              <div className="text-[11px] uppercase tracking-wide text-zinc-400">Routed GMV (trade-in)</div>
              <div className="text-2xl font-extrabold text-emerald-700">
                <CountUp value={data.routedGmvEur} prefix="€" />
              </div>
            </div>
            <div className="glow-mint rounded-2xl border border-emerald-200 bg-white/70 p-4 text-center shadow-sm">
              <div className="text-[11px] uppercase tracking-wide text-zinc-400">Reloop revenue</div>
              <div className="text-2xl font-extrabold text-emerald-700">
                <CountUp value={data.reloopRevenueEur} prefix="€" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Circular decisions (waste hierarchy)">
              <div className="space-y-2">
                {data.actionBreakdown.map((a) => {
                  const meta = ACTION_META[a.type as ActionType];
                  return (
                    <div key={a.type}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-zinc-700">
                          {meta.emoji} {meta.label}
                        </span>
                        <span className="text-zinc-400">
                          {a.count} · {a.share}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <motion.div
                          className="h-full rounded-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${a.share}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Material flow (by family)">
              <div className="space-y-2">
                {data.materialFlow.map((m) => (
                  <div key={m.material} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                    <span className="font-medium text-zinc-700">{m.material}</span>
                    <span className="text-xs text-zinc-500">
                      {m.count} items · ~{m.avgRecycledContentPct}% recycled
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Auto-filled Digital Product Passports (ESPR-aligned drafts)">
            <div className="grid gap-3 sm:grid-cols-2">
              {data.sampleDpp.map((d, i) => (
                <div key={i} className="rounded-xl border border-zinc-100 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900">{d.itemName}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        d.confidence === "document_backed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {d.confidence === "document_backed" ? "● Doc-backed" : "● AI-estimated"}
                    </span>
                  </div>
                  <dl className="mt-2 space-y-1 text-xs text-zinc-600">
                    <Row k="Material" v={d.material} />
                    <Row k="Recyclability" v={d.recyclability} />
                    <Row k="Recycled content" v={`~${d.recycledContentPct}%`} />
                  </dl>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              ESPR makes Digital Product Passports mandatory — batteries 2026, textiles 2027. Reloop is the consumer
              on-ramp that crowdsources the real end-of-life data these passports require.
            </p>
          </Panel>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: React.ReactNode; accent: string }) {
  return (
    <div className="glass rounded-2xl border border-zinc-100 p-4 text-center shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl border border-zinc-100 p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-zinc-400">{k}</dt>
      <dd className="text-right font-medium text-zinc-700">{v}</dd>
    </div>
  );
}
