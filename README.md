# Reloop - Snap it. Score it. Loop it.

An AI circular-economy app for the EU. Snap any item with your phone and a
vision model returns a Loop Card that ranks the best circular action first:

Repair -> Resell -> Donate -> Recycle -> Bin

Each Loop Card includes one-tap actions, a resale price band, CO2 saved, Loop
Points, streaks, and a draft Digital Product Passport (DPP) that feeds the B2B
material-flow and brand dashboards.

Built for the Infinity hackathon. The consumer app targets SDG 12, 13 and 11;
the business layer monetizes Digital Product Passport issuance, end-of-life
data, and trade-in/resale routing.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The app runs fully in mock mode without any API key. The home-screen demo prop
buttons always return deterministic cards, so the demo works offline.

Node.js 20.9 or newer is required.

## Turn On Live AI

Create or edit `.env.local`:

```env
RELOOP_AI_MODE=live
OPENAI_API_KEY=sk-...
```

Restart `npm run dev`. Uploaded photos now go through OpenAI vision and
structured outputs. Demo prop buttons still return deterministic mock cards.

Useful optional overrides:

```env
RELOOP_SCAN_MODEL=gpt-5.4
RELOOP_REPAIR_MODEL=gpt-5.4-mini
RELOOP_RESALE_MODEL=gpt-5.4-mini
```

If any live call fails, the app falls back to mock data so the demo keeps
working.

## How The AI Works

- `/api/scan`: base64 image -> OpenAI vision -> strict JSON Loop Card schema.
- `/api/scan-multi`: detects multiple items in one pile photo.
- `/api/refine`: recomputes a card from user corrections such as exact model or
  damage details.
- `/api/verify-step`: checks guided repair progress photos.
- `/api/resale` and `/api/parts`: use web search grounding for resale comps and
  spare parts.
- `/api/ask`: answers circular-economy questions with source URLs.

All AI calls sit behind `lib/ai/index.ts`, which switches between `mock` and
`live` using `RELOOP_AI_MODE`.

## Architecture

```text
app/                 App Router pages and API route handlers
components/          CameraCapture, LoopCard, MultiScanView, dashboards, modals
lib/ai/              Loop Card schema, mock data, live OpenAI implementation
lib/store.ts         JSON-file store for scans, confirmations, streaks and DPPs
lib/municipality.ts  Local disposal ruleset
lib/dealLinks.ts     Deterministic deep links
```

Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4,
framer-motion, OpenAI API, and a local JSON store under `.data/`.

## Three-Minute Demo

1. Hook: "People want to do the right thing, but disposal rules are confusing.
   Reloop turns any item into a decision in three seconds."
2. Scan the cracked phone demo. Show Repair as best action, the part search,
   resale value, and CO2 saved.
3. Get and accept an instant cash offer so the revenue metrics move.
4. Scan the charger demo. Confirm the recycle action and show Loop Points.
5. Scan foam packaging. Show the honest Bin verdict and circular alternatives.
6. Open the DPP QR and the public passport page.
7. Open `/dashboard` and `/brand` to show material-flow data, DPP issuance,
   end-of-life intelligence, and the revenue model.
