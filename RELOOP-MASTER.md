# Reloop Master Document

Snap it. Score it. Loop it.

This document is the full English operating narrative for Reloop. It explains
what the product is, why it matters, how the demo works, how the business makes
money, and how to answer the most likely jury or stakeholder questions.

## 1. What Reloop Is

Reloop is an AI-powered circular-economy app for the European market. A user
takes a photo of an everyday item and receives a Loop Card: a ranked set of
actions for that specific item and visible condition. The ranking follows the
EU waste hierarchy and prefers repair, resale, donation and reuse over recycling
or disposal whenever possible.

Each Loop Card includes the item name, material, visible condition, best action,
concrete instructions, resale value, estimated CO2 saved, recoverable materials,
and a draft Digital Product Passport. The app also rewards confirmed action with
Loop Points and streak progress.

The consumer experience feels simple, but the business value is in the data:
each scan creates end-of-life evidence that brands, municipalities and producer
responsibility systems need.

## 2. The Problem

The economy is still mostly linear: take, make, waste. That creates three clear
pain points.

Consumers are confused. Most people want to do the right thing, but disposal,
repair, resale and recycling rules are scattered across local websites, bins,
shops and platforms. Confusion usually defaults to the bin.

Valuable materials are lost. Electronics, textiles, furniture and packaging
often contain recoverable value, but much of it is discarded before reuse,
repair or proper recycling is considered.

Brands are becoming accountable. EU rules around Digital Product Passports,
Extended Producer Responsibility and eco-modulation require better product and
end-of-life evidence. Brands need to know what happens downstream, but they
usually do not have that data.

Reloop turns the moment of uncertainty into a decision and turns the decision
into useful evidence.

## 3. Guiding Principle

The product follows the waste hierarchy:

Prevent/Reuse -> Repair -> Resell -> Donate -> Recycle -> Dispose

This is not just a message. It is encoded in the model prompt and in the UI. The
first action on the Loop Card is the recommended verdict, highlighted as the
Best Loop.

## 4. Screens And Features

The home screen contains the Reloop brand, the streak banner, links to Learn,
B2B and Brands, and a scan area. Users can choose Single item or Whole pile.
Images are downscaled in the browser before being sent to the API.

Single-item scan produces one Loop Card. Demo props return deterministic cards
for stage reliability. Uploaded photos go through live AI when enabled.

Whole-pile scan identifies multiple objects in one photo, draws bounding boxes,
and gives each item its own recommended action.

The Loop Card contains:

- item name, material and optional brand/model guess,
- condition score,
- transparency banner,
- review/refine controls,
- CO2 saved and resale value,
- best-first action cards,
- repair, resale, trade-in and listing tools where relevant,
- urban-mining and recoverable-material notes,
- draft Digital Product Passport fields,
- QR access to a public passport page.

The Repair Coach provides three guided steps, asks for a progress photo, and
uses AI verification in live mode. In mock mode it returns deterministic success
feedback.

The Impact Translator turns weekly savings into tangible comparisons such as
kilometers not driven, phone charges, trees and bottles diverted. It can create
a shareable impact card.

The Learn page explains circular-economy basics, shows sourced facts, links to
resources and lets users ask questions.

The Dashboard aggregates scans into circular decisions, material flow, total CO2
saved, waste diverted, routed GMV, revenue and sample DPP drafts.

The Brand Console issues document-backed Digital Product Passports, shows
passport QR codes, end-of-life intelligence, compliance deadlines and pricing.

## 5. Demo Props

Cracked phone: repair is best. The card shows a cracked-screen smartphone, a
repair kit around EUR25, resale EUR60-90 and 32 kg CO2 saved.

Tangled charger: recycle or reuse through the correct electronics route, not
household packaging waste.

Glass jar: reuse first, recycle later through glass and metal streams.

Dead toaster: repair first when plausible, then recycle through electrical
take-back.

Foam packaging: honest Bin verdict when reuse and recycling are unrealistic,
plus circular alternatives for next purchase.

## 6. Technology

Reloop uses Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4,
framer-motion, OpenAI and a local JSON store.

`lib/ai/loopcard.ts` defines the shared Loop Card schema and prompt.
`lib/ai/mock.ts` provides deterministic demo cards.
`lib/ai/live.ts` provides OpenAI vision, structured outputs and web-search
grounding.
`lib/ai/index.ts` switches between mock and live mode and falls back to mock if
live AI fails.

Environment variables:

```env
RELOOP_AI_MODE=mock
OPENAI_API_KEY=
RELOOP_SCAN_MODEL=gpt-5.4-mini
RELOOP_REPAIR_MODEL=gpt-5.4-mini
RELOOP_RESALE_MODEL=gpt-5.4-mini
```

## 7. Business Model

Reloop is a consumer app in front and a B2B/B2G data business behind it.

Revenue lines:

- DPP-as-a-Service: passport issuance, hosting and API access for brands.
- End-of-life intelligence: aggregate downstream material and action data.
- Trade-in and resale take-rate: instant offers and routed resale flows.
- Municipal deployments: white-label citizen engagement and material-flow
  dashboards.

The app creates the data flywheel. The dashboards and passport infrastructure
are the paid products.

## 8. Why Now

Digital Product Passports, EPR, eco-modulation and right-to-repair rules are
making product and downstream evidence more valuable. Brands will need proof,
not just product specs. Reloop creates proof from real consumer decisions.

## 9. Moat

The scan is not the moat. The moat is cross-channel end-of-life intelligence:
the item, condition, material, recommended action, confirmed action and
downstream path. Marketplaces only see their channel. Recycling guides only see
local rules. DPP software often lacks consumer downstream data. Reloop connects
all three.

## 10. Pitch Flow

1. Hold up a real object and ask: repair, sell, recycle or bin?
2. Introduce the line: Snap it. Score it. Loop it.
3. Demo the cracked phone and explain why repair is best.
4. Show the instant cash offer and revenue moment.
5. Demo the charger and confirm an action so points move.
6. Show the DPP QR and public passport.
7. Switch to Brand Console and explain the business: every scan becomes data.
8. Close on Reloop as the data layer of the circular economy.

## 11. Test Plan

Use `TEST_EVERYTHING.md` for the detailed test checklist. Before any live
presentation, verify:

- mock demo props,
- one real uploaded photo in live mode,
- DPP QR on a phone using the network IP,
- dashboard counters after confirmations,
- Brand Console passport issuance,
- fallback behavior when live AI is unavailable.

## 12. Glossary

DPP: Digital Product Passport, a product-level data record for material,
recyclability, repairability and related fields.

ESPR: Ecodesign for Sustainable Products Regulation.

EPR: Extended Producer Responsibility, where producers carry responsibility for
collection and end-of-life treatment.

Eco-modulation: fee differentiation based on product circularity, recyclability
or repairability.

WEEE: Waste Electrical and Electronic Equipment.

PRO: Producer Responsibility Organisation.

Take-rate: the share Reloop keeps from routed trade-in or resale transactions.
