"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import type { AskResult } from "@/lib/clientTypes";

const FACTS = [
  {
    big: "62 Mt",
    text: "of electronic waste was generated worldwide in 2022 — only 22.3% was formally collected and recycled.",
    source: { label: "UN Global E-waste Monitor 2024", url: "https://globalewaste.org/" },
  },
  {
    big: "€62 bn",
    text: "of recoverable materials — gold, copper, rare earths — was lost in a single year of unrecycled e-waste.",
    source: {
      label: "UNITAR / ITU",
      url: "https://unitar.org/about/news-stories/press/global-e-waste-monitor-2024-electronic-waste-rising-five-times-faster-documented-e-waste-recycling",
    },
  },
  {
    big: "~9%",
    text: "of all the plastic ever made has actually been recycled. Packaging alone is ~40% of plastic waste.",
    source: { label: "Our World in Data", url: "https://ourworldindata.org/plastic-pollution" },
  },
  {
    big: "~80%",
    text: "of a product's environmental impact is locked in at the design stage — which is why keeping things in use matters most.",
    source: {
      label: "Ellen MacArthur Foundation",
      url: "https://www.ellenmacarthurfoundation.org/topics/circular-economy-introduction/overview",
    },
  },
];

const STEPS = [
  { n: 1, t: "Snap", d: "Photograph any item — clutter, a gadget, a jar — or a whole pile at once." },
  { n: 2, t: "See", d: "A vision AI identifies the item, its materials and condition straight from the pixels." },
  { n: 3, t: "Score", d: "It ranks the best circular action UP the EU waste hierarchy: repair → resell → donate → recycle → bin." },
  { n: 4, t: "Loop", d: "Act with one tap, earn Loop Points, and watch your CO₂ saved grow." },
  { n: 5, t: "Passport", d: "Every scan drafts a Digital Product Passport — the data the EU's ESPR rules will require." },
];

const VIDEOS = [
  {
    title: "Explaining the circular economy — re-thinking progress",
    by: "Ellen MacArthur Foundation",
    url: "https://www.ellenmacarthurfoundation.org/videos/explaining-the-circular-economy-rethink-progress",
  },
  {
    title: "Basics of a circular economy",
    by: "Ellen MacArthur Foundation",
    url: "https://www.ellenmacarthurfoundation.org/videos/basics-of-a-circular-economy",
  },
];

const READS = [
  {
    title: "The circular economy in detail",
    by: "Ellen MacArthur Foundation",
    url: "https://www.ellenmacarthurfoundation.org/the-circular-economy-in-detail-deep-dive",
  },
  {
    title: "Plastic Pollution — data & research",
    by: "Our World in Data",
    url: "https://ourworldindata.org/plastic-pollution",
  },
  {
    title: "EU Circular Economy Action Plan",
    by: "European Commission",
    url: "https://environment.ec.europa.eu/strategy/circular-economy-action-plan_en",
  },
];

export default function Learn() {
  return (
    <div className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-emerald-900">Why it matters</h1>
            <p className="text-xs text-emerald-700/70">The impact behind every loop</p>
          </div>
        </div>
        <Link
          href="/"
          className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
        >
          ← App
        </Link>
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
        <p className="text-lg font-semibold leading-snug">
          Every year we throw away mountains of things that still had value — and most of it was never broken.
        </p>
        <p className="mt-2 text-sm text-white/85">
          We take, make and waste. A circular economy does the opposite: it keeps products and materials in use,
          designs out waste, and lets nature recover. Small everyday choices — repair instead of replace, reuse
          instead of bin — add up to a huge difference. Reloop makes that choice take 3 seconds.
        </p>
      </section>

      <h2 className="mt-8 mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">The numbers</h2>
      <div className="grid grid-cols-2 gap-3">
        {FACTS.map((f) => (
          <div key={f.big} className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
            <div className="text-2xl font-extrabold text-emerald-700">{f.big}</div>
            <p className="mt-1 text-xs text-zinc-600">{f.text}</p>
            <a href={f.source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] text-emerald-600 underline">
              {f.source.label} ↗
            </a>
          </div>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">How Reloop works</h2>
      <div className="space-y-2">
        {STEPS.map((s) => (
          <div key={s.n} className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              {s.n}
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{s.t}</p>
              <p className="text-xs text-zinc-600">{s.d}</p>
            </div>
          </div>
        ))}
        <p className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-900">
          ⓘ <span className="font-semibold">Transparency:</span> figures like CO₂ saved or what&apos;s inside an item
          are AI estimates unless you give the exact model — and they&apos;re always labelled as such.
        </p>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">Ask the science</h2>
      <AskBox />

      <h2 className="mt-8 mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">Watch</h2>
      <div className="space-y-2">
        {VIDEOS.map((v) => (
          <a
            key={v.url}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm transition hover:border-emerald-200"
          >
            <span className="text-2xl">▶️</span>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{v.title}</p>
              <p className="text-xs text-zinc-500">{v.by}</p>
            </div>
          </a>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">Read</h2>
      <div className="space-y-2">
        {READS.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm transition hover:border-emerald-200"
          >
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{r.title}</p>
              <p className="text-xs text-zinc-500">{r.by}</p>
            </div>
          </a>
        ))}
      </div>

      <footer className="py-8 text-center text-[10px] text-emerald-700/50">
        Reloop · Snap it. Score it. Loop it.
      </footer>
    </div>
  );
}

function AskBox() {
  const [q, setQ] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<AskResult | null>(null);

  const SUGGESTIONS = [
    "Is it better to repair or recycle my phone?",
    "Why is plastic so hard to recycle?",
    "What is a Digital Product Passport?",
  ];

  async function ask(question: string) {
    setQ(question);
    setState("loading");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = (await res.json()) as { result: AskResult };
      setResult(json.result);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && q.trim() && ask(q.trim())}
          placeholder="Ask anything about waste, repair, recycling…"
          className="flex-1 rounded-full border border-emerald-200 px-4 py-2 text-sm outline-none focus:border-emerald-400"
        />
        <button
          onClick={() => q.trim() && ask(q.trim())}
          disabled={state === "loading" || !q.trim()}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {state === "loading" ? "…" : "Ask"}
        </button>
      </div>

      {state === "idle" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 transition hover:bg-emerald-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {state === "loading" && <p className="mt-3 text-sm text-emerald-700">Looking it up…</p>}

      {state === "done" && result && (
        <div className="mt-3">
          <p className="text-sm text-zinc-700">{result.answer}</p>
          {result.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {result.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 underline">
                  {s.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
