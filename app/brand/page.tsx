"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/Logo";
import CountUp from "@/components/CountUp";
import DppQrModal from "@/components/DppQrModal";
import type { BrandDashboardData, BrandPassportData } from "@/lib/clientTypes";

const CATEGORIES = ["Electronics", "Textiles", "Furniture", "Small appliances", "Packaging", "Other"];

const EMPTY_FORM = {
  brand: "",
  productName: "",
  sku: "",
  category: "Electronics",
  material: "",
  recyclability: "Recyclable (WEEE)",
  recycledContentPct: 20,
  repairabilityIndex: 6,
};

const ESPR_DEADLINES = [
  { category: "Batteries", deadline: "Feb 2027" },
  { category: "Textiles & apparel", deadline: "2027→" },
  { category: "Electronics & ICT", deadline: "2028→" },
  { category: "Furniture", deadline: "2028→" },
];

const PRICING = [
  {
    tier: "Starter",
    price: "€0.40 / passport",
    includes: ["Pay-as-you-go DPP issuance", "Hosted QR/NFC passport pages", "Basic ESPR fields"],
  },
  {
    tier: "Growth",
    price: "€1,500 / mo",
    includes: ["Up to 50k passports", "End-of-life intelligence dashboard", "EPR & eco-modulation reports", "API access"],
    highlight: true,
  },
  {
    tier: "Enterprise",
    price: "Custom",
    includes: ["Unlimited SKUs", "Verified reuse/recycle proof", "Take-back integration", "SLA + data export"],
  },
];

export default function BrandConsole() {
  const [data, setData] = useState<BrandDashboardData | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState<BrandPassportData | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);

  function refresh() {
    fetch("/api/brand")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }
  useEffect(refresh, []);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    setIssuing(true);
    setIssueError(null);
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Could not issue passport");
      const json = (await res.json()) as { passport: BrandPassportData };
      setIssued(json.passport);
      refresh();
    } catch {
      setIssueError("Could not issue the passport. Please check the fields and try again.");
    } finally {
      setIssuing(false);
    }
  }

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#101817]">
              <span className="lowercase">reloop</span> for brands
            </h1>
            <p className="text-sm text-emerald-700/70">
              DPP-as-a-Service + the end-of-life intelligence no one else can see. Built for the EU ESPR wave.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/dashboard"
            className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            Material flow
          </Link>
          <Link
            href="/"
            className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            ← App
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Passports issued" value={<CountUp value={data?.issuedCount ?? 0} />} accent="text-emerald-700" />
        <Kpi label="End-of-life events" value={<CountUp value={data?.totalEolEvents ?? 0} />} accent="text-teal-700" />
        <Kpi label="Material streams" value={<CountUp value={data?.materialsTracked ?? 0} />} accent="text-sky-700" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="glow-mint rounded-2xl border border-emerald-200 bg-white/70 p-4 text-center shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-zinc-400">Take-back GMV routed</div>
          <div className="text-2xl font-extrabold text-emerald-700">
            <CountUp value={data?.routedGmvEur ?? 0} prefix="€" />
          </div>
        </div>
        <div className="glow-mint rounded-2xl border border-emerald-200 bg-white/70 p-4 text-center shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-zinc-400">Reloop revenue</div>
          <div className="text-2xl font-extrabold text-emerald-700">
            <CountUp value={data?.reloopRevenueEur ?? 0} prefix="€" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel title="Issue a Digital Product Passport">
          {issued ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">● Issued · document-backed</p>
                <h3 className="mt-1 font-bold text-emerald-900">{issued.productName}</h3>
                <p className="text-xs text-emerald-800/80">
                  {issued.brand}
                  {issued.sku ? ` · SKU ${issued.sku}` : ""} · {issued.category}
                </p>
                <p className="mt-1 text-[11px] text-emerald-700/70">Passport ID: {issued.id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQrId(issued.id)}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  📲 Show passport QR
                </button>
                <Link
                  href={`/passport/${issued.id}`}
                  target="_blank"
                  className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  Open passport ↗
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIssued(null);
                    setForm({ ...EMPTY_FORM });
                  }}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50"
                >
                  + Issue another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={issue} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Brand">
                  <input className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Acme" />
                </Field>
                <Field label="SKU / GTIN">
                  <input className={inputCls} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="ACM-1234" />
                </Field>
              </div>
              <Field label="Product name">
                <input className={inputCls} value={form.productName} onChange={(e) => set("productName", e.target.value)} placeholder="Wireless headphones X2" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Category">
                  <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Recyclability">
                  <input className={inputCls} value={form.recyclability} onChange={(e) => set("recyclability", e.target.value)} />
                </Field>
              </div>
              <Field label="Material composition">
                <input className={inputCls} value={form.material} onChange={(e) => set("material", e.target.value)} placeholder="ABS + Li-ion + copper" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={`Recycled content: ${form.recycledContentPct}%`}>
                  <input type="range" min={0} max={100} value={form.recycledContentPct} onChange={(e) => set("recycledContentPct", Number(e.target.value))} className="w-full accent-emerald-600" />
                </Field>
                <Field label={`Repairability: ${form.repairabilityIndex}/10`}>
                  <input type="range" min={0} max={10} value={form.repairabilityIndex} onChange={(e) => set("repairabilityIndex", Number(e.target.value))} className="w-full accent-emerald-600" />
                </Field>
              </div>
              <button
                type="submit"
                disabled={issuing}
                className="w-full rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {issuing ? "Issuing…" : "Issue passport →"}
              </button>
              {issueError && <p className="text-sm text-red-600">{issueError}</p>}
            </form>
          )}
        </Panel>

        <Panel title="End-of-life intelligence (Reloop-exclusive)">
          <p className="mb-3 text-xs text-zinc-500">
            What <span className="font-semibold text-zinc-700">actually</span> happens to products downstream — crowdsourced
            from consumer scans. The data brands are pushed to report but cannot otherwise see.
          </p>
          <div className="space-y-2">
            {(data?.eolIntelligence ?? []).slice(0, 7).map((m) => (
              <div key={m.material} className="rounded-xl border border-zinc-100 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-800">{m.material}</span>
                  <span className="text-xs text-zinc-400">{m.events} events · ⌀ {m.avgCo2SavedKg} kg CO₂</span>
                </div>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-zinc-100">
                  <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${m.reusePct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} title={`Reused ${m.reusePct}%`} />
                  <motion.div className="h-full bg-teal-400" initial={{ width: 0 }} animate={{ width: `${m.recyclePct}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} title={`Recycled ${m.recyclePct}%`} />
                  <motion.div className="h-full bg-zinc-300" initial={{ width: 0 }} animate={{ width: `${m.disposedPct}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} title={`Disposed ${m.disposedPct}%`} />
                </div>
                <div className="mt-1 flex gap-3 text-[10px] text-zinc-500">
                  <span>🔁 {m.reusePct}% reused</span>
                  <span>♻️ {m.recyclePct}% recycled</span>
                  <span>🗑️ {m.disposedPct}% disposed</span>
                </div>
              </div>
            ))}
            {!data?.eolIntelligence?.length && <p className="text-sm text-zinc-400">No scan data yet.</p>}
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Compliance & EPR eco-modulation">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">ESPR DPP deadlines</p>
              <ul className="mt-2 space-y-1.5">
                {ESPR_DEADLINES.map((d) => (
                  <li key={d.category} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                    <span className="font-medium text-zinc-700">{d.category}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">{d.deadline}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Why brands pay</p>
              <p className="mt-1 text-emerald-900/80">
                EPR fees are shifting to <span className="font-semibold">eco-modulation</span>: more repairable, more
                recycled, more recyclable products pay <span className="font-semibold">less</span>. Reloop turns your
                passports + real reuse/recycle proof into the evidence that lowers those fees — and keeps you audit-ready.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="How Reloop charges (revenue model)">
          <div className="grid gap-3 sm:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.tier}
                className={`rounded-2xl border p-4 ${p.highlight ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200" : "border-zinc-100"}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">{p.tier}</h3>
                  {p.highlight && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Popular</span>
                  )}
                </div>
                <p className="mt-1 text-lg font-extrabold text-emerald-700">{p.price}</p>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600">
                  {p.includes.map((i) => (
                    <li key={i}>✓ {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Three stacked revenue lines: per-passport issuance (B2B SaaS), the EOL data/insights subscription, and a
            take-rate on take-back/resale routed through Reloop. The consumer app is the data engine that feeds all three.
          </p>
        </Panel>
      </div>

      {qrId && <DppQrModal scanId={qrId} pathPrefix="/passport/" onClose={() => setQrId(null)} />}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      {children}
    </label>
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
