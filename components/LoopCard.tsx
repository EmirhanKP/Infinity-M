"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ScanResponse, ResaleGrounding, ListingResult, PartResult, TradeInQuote } from "@/lib/clientTypes";
import type { ActionType, LoopCard as LoopCardType } from "@/lib/ai/loopcard";
import { ACTION_META, effortDots } from "@/lib/ui";
import DppQrModal from "./DppQrModal";

export default function LoopCard({
  scan,
  previewUrl,
  refining = false,
  onConfirm,
  onScanNext,
  onStartRepair,
  onRefine,
}: {
  scan: ScanResponse;
  previewUrl: string;
  refining?: boolean;
  onConfirm: (actionType: ActionType, co2: number) => void;
  onScanNext: () => void;
  onStartRepair: (itemName: string) => void;
  onRefine: (correction: string) => void;
}) {
  const { card, links } = scan;
  const best = card.circular_actions[0]?.type as ActionType | undefined;
  const isBin = best === "bin";
  const [showQr, setShowQr] = useState(false);
  const matched = card.data_basis === "model_matched";
  const others = card.other_items_detected ?? [];

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="glass w-full overflow-hidden rounded-3xl border border-emerald-100 shadow-xl"
    >
      {/* Honest fallback banner — live AI failed, so this is a canned demo card,
          NOT a real analysis of the uploaded photo. */}
      {scan.source === "mock-fallback" && (
        <div className="border-b border-amber-200 bg-amber-100 px-5 py-2.5 text-xs text-amber-900">
          <span className="font-bold">⚠️ Live-KI nicht erreichbar.</span> Das ist eine Demo-Karte,
          nicht euer echtes Foto. OpenAI-Konto braucht Guthaben/gültigen Key (Billing).
        </div>
      )}

      {/* Disambiguation — the photo shows several items. Don't guess silently:
          let the user pick which one they meant, or retake with just one. */}
      {others.length > 0 && (
        <div className="border-b border-sky-200 bg-sky-50 px-5 py-3">
          <p className="text-xs font-semibold text-sky-900">
            👀 Mehrere Objekte erkannt — ich zeige <span className="font-bold">{card.item_name}</span>. Welches meinst du?
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              {card.item_name} ✓
            </span>
            {others.map((label) => (
              <button
                key={label}
                type="button"
                disabled={refining}
                onClick={() => onRefine(`Focus only on the ${label} in this photo and produce its Loop Card.`)}
                className="rounded-full border border-sky-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-800 transition hover:bg-sky-100 disabled:opacity-60"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={onScanNext}
              className="rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition hover:bg-zinc-50"
            >
              📷 Neu aufnehmen (nur 1 Objekt)
            </button>
          </div>
          {refining && <p className="mt-1.5 text-[11px] text-sky-700">Wechsle…</p>}
        </div>
      )}

      {/* Header */}
      <div className="flex gap-4 border-b border-zinc-100 p-5">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="scanned item" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">📦</div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight text-zinc-900">{card.item_name}</h2>
          <p className="mt-0.5 text-sm text-zinc-600">{card.material}</p>
          {card.brand_model_guess && (
            <p className="text-xs text-zinc-400">{card.brand_model_guess}</p>
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

      {/* Transparency line */}
      <div
        className={`mx-5 mt-4 rounded-2xl border p-3 ${
          matched ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
        }`}
      >
        <p className={`text-xs ${matched ? "text-emerald-900" : "text-amber-900"}`}>
          <span className="font-semibold">{matched ? "✓ Matched to your details" : "ⓘ AI estimate"}</span> ·{" "}
          {card.data_note}
        </p>
      </div>

      {/* Item review — specify what it is + condition, then re-score with AI */}
      <ItemReview card={card} refining={refining} onRefine={onRefine} />

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
      <motion.div
        className="space-y-3 p-5"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } }}
        initial="hidden"
        animate="show"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Best action first · {scan.municipality}
        </p>
        {card.circular_actions.map((action, i) => {
          const meta = ACTION_META[action.type as ActionType];
          const isBest = i === 0;
          const actionLinks = links[action.type] ?? [];
          return (
            <motion.div
              key={`${action.type}-${i}`}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
              }}
              className={`rounded-2xl border p-4 ${
                isBest ? `glow-mint ${meta.ring} border-transparent bg-white/60` : "border-zinc-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.chip}`}>
                  <span>{meta.emoji}</span>
                  {meta.label}
                </span>
                {isBest && (
                  <span className="pulse-mint rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
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
                  <>
                    <button
                      type="button"
                      onClick={() => onStartRepair(card.item_name)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white ${meta.solid}`}
                    >
                      🛠️ Start guided repair
                    </button>
                    <PartsPanel itemName={card.item_name} brandModel={card.brand_model_guess} />
                  </>
                )}
                {action.type === "resell" && (
                  <>
                    <TradeInPanel
                      itemName={card.item_name}
                      material={card.material}
                      conditionScore={card.condition_score}
                      resaleLow={card.resale_estimate_eur.low}
                      resaleHigh={card.resale_estimate_eur.high}
                      onAccept={() => onConfirm("resell", card.co2_saved_kg)}
                    />
                    <ResaleComps itemName={card.item_name} conditionNote={`condition ${card.condition_score}/10`} />
                    <ListingPanel
                      itemName={card.item_name}
                      material={card.material}
                      conditionScore={card.condition_score}
                      resaleLow={card.resale_estimate_eur.low}
                      resaleHigh={card.resale_estimate_eur.high}
                    />
                  </>
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
            </motion.div>
          );
        })}
      </motion.div>

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

      {/* Urban mining */}
      {(card.recoverable_materials?.summary || card.recoverable_materials?.est_value_eur > 0) && (
        <div className="mx-5 mb-3 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3">
          <p className="text-sm font-semibold text-yellow-900">
            ⛏️ Urban mining
            {card.recoverable_materials.est_value_eur > 0 && (
              <span className="ml-1 font-normal text-yellow-800">
                · ≈ €{card.recoverable_materials.est_value_eur} recoverable
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-yellow-800/80">{card.recoverable_materials.summary}</p>
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
        <button
          type="button"
          onClick={() => setShowQr(true)}
          className="mt-3 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
        >
          📲 Show DPP QR — scan it with your phone
        </button>
        <div className="mt-3 flex items-center justify-between">
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

      {showQr && <DppQrModal scanId={scan.scanId} onClose={() => setShowQr(false)} />}
    </motion.div>
  );
}

const CONDITION_OPTIONS: { key: "working" | "partial" | "broken"; label: string; emoji: string }[] = [
  { key: "working", label: "Läuft", emoji: "✅" },
  { key: "partial", label: "Teilweise", emoji: "⚠️" },
  { key: "broken", label: "Kaputt", emoji: "🔧" },
];

// Context-aware "what's broken" quick-picks, chosen from the item's category.
function damageChips(name: string, material: string): string[] {
  const s = `${name} ${material}`.toLowerCase();
  if (/(phone|smartphone|iphone|laptop|macbook|tablet|computer|keyboard|mouse|electronic|li-ion|akku|battery)/.test(s))
    return ["Display gesprungen", "Akku schwach", "Geht nicht an", "Anschluss/Port defekt", "Wasserschaden", "Tasten/Knopf defekt"];
  if (/(toaster|kettle|appliance|mixer|föhn|hairdryer|heiz|nichrome)/.test(s))
    return ["Heizt nicht", "Kabel/Stecker defekt", "Schalter klemmt", "Macht keinen Strom"];
  if (/(shirt|jacket|jeans|cotton|textile|wool|kleid|hose|schuh|shoe)/.test(s))
    return ["Loch/Riss", "Fleck", "Reißverschluss kaputt", "Knöpfe fehlen"];
  if (/(chair|table|sofa|desk|wood|furniture|möbel|regal)/.test(s))
    return ["Wackelt", "Kratzer", "Teil fehlt", "Bruch"];
  if (/(watch|uhr|clock|wristwatch)/.test(s))
    return ["Läuft nicht", "Batterie leer", "Glas zerkratzt", "Armband defekt"];
  return ["Beschädigt", "Teil fehlt", "Funktioniert nicht", "Verschleiß", "Verschmutzt"];
}

// Reusable review step (single- AND multi-scan via drill-in): specify the exact
// item + its condition, then re-score with the AI.
function ItemReview({
  card,
  refining,
  onRefine,
}: {
  card: LoopCardType;
  refining: boolean;
  onRefine: (correction: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [specify, setSpecify] = useState("");
  const [condition, setCondition] = useState<"working" | "partial" | "broken" | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const chips = damageChips(card.item_name, card.material);
  const showIssues = condition === "partial" || condition === "broken";
  const hasInput = Boolean(specify.trim() || condition || issues.length || note.trim());

  function toggle(chip: string) {
    setIssues((cur) => (cur.includes(chip) ? cur.filter((c) => c !== chip) : [...cur, chip]));
  }

  function submit() {
    const parts: string[] = [];
    if (specify.trim()) parts.push(`This item is specifically: ${specify.trim()}`);
    if (condition)
      parts.push(
        `Condition: ${condition === "working" ? "works fine" : condition === "partial" ? "partially working" : "broken / not working"}`,
      );
    const allIssues = [...issues, note.trim()].filter(Boolean);
    if (allIssues.length) parts.push(`Issues: ${allIssues.join(", ")}`);
    if (!parts.length) return;
    onRefine(parts.join(". ") + ".");
  }

  return (
    <div className="mx-5 mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white/60 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-white"
      >
        <span>🔎 Prüfen &amp; präzisieren — was ist es genau, ist es kaputt?</span>
        <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-3 rounded-2xl border border-zinc-200 bg-white/80 p-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Was ist das genau?
            </label>
            <input
              value={specify}
              onChange={(e) => setSpecify(e.target.value)}
              placeholder={`z. B. exaktes Modell statt „${card.item_name}"`}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Funktioniert es?
            </label>
            <div className="flex gap-1.5">
              {CONDITION_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setCondition(condition === o.key ? null : o.key)}
                  className={`flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition ${
                    condition === o.key ? "bg-emerald-600 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>
          {showIssues && (
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Was ist kaputt?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggle(chip)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                      issues.includes(chip) ? "bg-amber-500 text-white" : "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="…oder frei beschreiben"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          )}
          <button
            type="button"
            disabled={refining || !hasInput}
            onClick={submit}
            className="w-full rounded-full bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {refining ? "Bewerte neu…" : "✨ Neu bewerten"}
          </button>
        </div>
      )}
    </div>
  );
}

function TradeInPanel({
  itemName,
  material,
  conditionScore,
  resaleLow,
  resaleHigh,
  onAccept,
}: {
  itemName: string;
  material: string;
  conditionScore: number;
  resaleLow: number;
  resaleHigh: number;
  onAccept: () => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "accepted">("idle");
  const [quote, setQuote] = useState<TradeInQuote | null>(null);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/tradein", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName, material, conditionScore, resaleLow, resaleHigh }),
      });
      const json = (await res.json()) as { quote: TradeInQuote };
      setQuote(json.quote);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  if (state === "accepted" && quote) {
    return (
      <div className="w-full rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs">
        <p className="font-semibold text-emerald-900">✓ Offer accepted — €{quote.instantOfferEur} on the way</p>
        <p className="mt-0.5 text-emerald-800/80">
          {quote.logistics} sent to your email · {quote.payout}. Item stays in the loop via {quote.partner}.
        </p>
      </div>
    );
  }

  if (state === "done" && quote) {
    if (!quote.eligible) {
      return (
        <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
          {quote.note}
        </div>
      );
    }
    return (
      <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-amber-900">💸 Instant cash offer</p>
          <p className="text-xl font-extrabold text-amber-900">€{quote.instantOfferEur}</p>
        </div>
        <p className="mt-0.5 text-amber-800/80">
          {quote.note}
        </p>
        <ul className="mt-2 space-y-0.5 text-amber-900/80">
          <li>📦 {quote.logistics} · {quote.payout}</li>
          <li>🔁 Routed to {quote.partner}</li>
          <li className="text-amber-700/70">
            Or sell it yourself for €{quote.sellYourselfLow}–{quote.sellYourselfHigh} (more effort, you wait for a buyer).
          </li>
        </ul>
        <button
          type="button"
          onClick={() => {
            setState("accepted");
            // Record the routed GMV + Reloop margin so the dashboards move live.
            fetch("/api/tradein/accept", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                itemName,
                category: quote.category,
                instantOfferEur: quote.instantOfferEur,
                marketValueEur: quote.marketValueEur,
                reloopMarginEur: quote.reloopMarginEur,
              }),
            }).catch(() => {});
            onAccept();
          }}
          className="mt-2 rounded-full bg-amber-600 px-3 py-1.5 font-semibold text-white transition hover:bg-amber-700"
        >
          Accept instant offer →
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={state === "loading"}
      className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
    >
      {state === "loading" ? "Getting your offer…" : "💸 Get instant cash offer"}
    </button>
  );
}

function ListingPanel({
  itemName,
  material,
  conditionScore,
  resaleLow,
  resaleHigh,
}: {
  itemName: string;
  material: string;
  conditionScore: number;
  resaleLow: number;
  resaleHigh: number;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [listing, setListing] = useState<ListingResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName, material, conditionScore, resaleLow, resaleHigh }),
      });
      const json = (await res.json()) as { listing: ListingResult };
      setListing(json.listing);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  async function copy() {
    if (!listing) return;
    const text = `${listing.title}\n\n${listing.description}\n\nPrice: €${listing.price_eur}\nCategory: ${listing.category}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  if (state === "done" && listing) {
    return (
      <div className="w-full rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs">
        <p className="font-semibold text-sky-900">{listing.title}</p>
        <p className="mt-1 text-sky-800/90">{listing.description}</p>
        <p className="mt-1 text-sky-700">
          €{listing.price_eur} · {listing.category}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={copy} className="rounded-full bg-sky-600 px-3 py-1 font-semibold text-white hover:bg-sky-700">
            {copied ? "Copied ✓" : "Copy listing"}
          </button>
          <a
            href={listing.marketplaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-sky-300 bg-white px-3 py-1 font-semibold text-sky-800 hover:bg-sky-100"
          >
            Open on Vinted ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={state === "loading"}
      className="rounded-full border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-50 disabled:opacity-60"
    >
      {state === "loading" ? "Writing your listing…" : "✍️ Write my listing"}
    </button>
  );
}

function PartsPanel({ itemName, brandModel }: { itemName: string; brandModel: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [part, setPart] = useState<PartResult | null>(null);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName, brandModel }),
      });
      const json = (await res.json()) as { part: PartResult };
      setPart(json.part);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  if (state === "done" && part) {
    return (
      <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs">
        <p className="font-semibold text-emerald-900">
          {part.part_name} — ≈ €{part.price_eur}
        </p>
        {part.note && <p className="mt-0.5 text-emerald-800/80">{part.note}</p>}
        <div className="mt-1 flex flex-wrap gap-2">
          {part.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={state === "loading"}
      className="rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60"
    >
      {state === "loading" ? "Finding the exact part…" : "🔩 Find the exact part"}
    </button>
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
