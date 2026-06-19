# Reloop — Snap it. Score it. Loop it.

An AI circular-economy app for the EU. Snap any item with your phone and a
**vision LLM returns a "Loop Card"** that ranks the best circular action
*best-first* along the EU waste hierarchy — **Repair → Resell → Donate →
Recycle → Bin** — with one-tap actions, a resale price band, CO₂ saved, gamified
Loop Points / streaks, and an auto-filled draft **Digital Product Passport
(DPP)** that feeds a B2B material-flow dashboard.

Built for the Infinity hackathon. Consumer front end (SDG 12 / 13 / 11),
monetised by a B2B DPP/data back end riding the EU ESPR regulation wave
(Digital Product Passports mandatory: batteries 2026, textiles 2027).

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

The app runs **fully in mock mode with no API key** — every screen, the Loop
Cards, the reward loop, the repair coach, and the dashboard all work offline.
Use the **demo prop buttons** on the home screen for guaranteed, deterministic
cards (great for a stage demo).

> Node.js ≥ 20.9 is required. A portable copy was installed at
> `C:\Users\<you>\AppData\Local\nodejs-portable` if you don't have Node on PATH.

## Turning on real AI

1. Put your Anthropic key in `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   RELOOP_AI_MODE=live
   ```
2. Restart `npm run dev`. Uploaded photos now go to Claude vision; the demo prop
   buttons still serve the deterministic cards.

The default scan model is `claude-fable-5` (vision + structured JSON output).
Fable 5 requires 30-day data retention — if your org/key can't use it, set
`RELOOP_SCAN_MODEL=claude-opus-4-8`. If any live call fails it transparently
falls back to a mock card, so the demo never breaks.

## How the AI works

- **Snap → Loop Card** (`/api/scan`): base64 photo → Claude (`claude-fable-5`,
  vision) constrained to a strict JSON schema (`output_config.format`) → a
  ranked Loop Card. The system prompt encodes the EU Waste Framework Directive
  hierarchy + a Munich municipality ruleset so `local_hint` is concrete.
- **Alternatives nudge**: when the verdict is `bin`, the same JSON returns 2
  buy-circular suggestions (a design-for-circularity teaching moment).
- **Repair coach** (`/api/verify-step`): multi-step vision verification on
  `claude-haiku-4-5` — snap a progress photo, get the next step.
- **Resale grounding** (`/api/resale`): confidence-gated `web_search` for live
  Vinted/Back Market comps.
- **DPP / dashboard** (`/dashboard`): every scan emits draft DPP fields that
  aggregate into anonymized material-flow data — the B2B revenue hook.

Everything sits behind one interface (`lib/ai/index.ts`) with a `mock` and a
`live` implementation chosen by `RELOOP_AI_MODE`, so the contract is identical.

## Architecture

```
app/                 page.tsx (snap→card→reward loop), dashboard/, api/* route handlers
components/           CameraCapture, LoopCard, StreakBanner, RepairCoach
lib/ai/               loopcard.ts (schema+prompt), mock.ts, live.ts, index.ts (mode switch)
lib/store.ts          JSON-file store (scans, confirms, streaks, DPP aggregates)
lib/municipality.ts   hardcoded Munich ruleset (productionizes to per-city config)
lib/dealLinks.ts      deterministic deep links (Vinted/Back Market/iFixit/Maps)
```

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
framer-motion · Anthropic Claude API. Persistence is a JSON file under `.data/`
(zero-config; swap for Postgres later).

## 3-minute demo script

1. **Hook** — "Citizens want to do the right thing but the rules are confusing,
   so the default is the bin. Reloop turns any item into a decision in 3s."
2. **Cracked phone** → REPAIR best (€25 kit, resale €60–90, saves 32 kg CO₂).
   "It pushes UP the hierarchy to repair/resell — competitors stop at recycle."
3. **Charger** → RECYCLE: retailer take-back, *not* the yellow bin. Confirm →
   Loop Points + streak tick up.
4. **Foam packaging** → BIN verdict → alternatives nudge ("next time: molded-pulp
   packaging").
5. **`/dashboard`** — "Every scan auto-fills a DPP + feeds anonymized
   material-flow data. ESPR makes DPPs mandatory — we're the consumer on-ramp."
6. **Close** — freemium + affiliate fees + B2B DPP API. "Snap it. Score it. Loop it."
