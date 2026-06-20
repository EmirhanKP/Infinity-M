# Reloop Playbook

## Elevator Pitch

People want to dispose of things responsibly, but the rules are fragmented and
confusing. Reloop turns any household item into a clear circular-economy
decision in three seconds: snap it, score it, and loop it.

The consumer app is the front door. Each scan creates end-of-life data that
brands, municipalities and EPR systems need for Digital Product Passports,
eco-modulation, take-back programs and real downstream reporting.

## Product Thesis

Reloop is not a recycling helper. Recycling is only one step in the EU waste
hierarchy, and usually not the best one. Reloop pushes users upward:

Prevent/Reuse -> Repair -> Resell -> Donate -> Recycle -> Dispose

The first action on every Loop Card is the recommended verdict. The app keeps
value in products for as long as possible and turns that behavior into useful
data.

## App Flow

1. Snap a single item or a whole pile.
2. The AI identifies the item, material, visible condition and likely brand or
   model.
3. Reloop ranks circular actions best-first.
4. The user acts through repair guidance, resale tools, trade-in offers, donation
   or recycling links.
5. The user earns Loop Points and streak progress.
6. Every scan drafts a Digital Product Passport and feeds aggregate dashboards.

## Key Features

- Single-item scan with deterministic demo props.
- Whole-pile scan with bounding boxes and item-by-item actions.
- Loop Cards with condition score, CO2 saved, resale value, local hints,
  recoverable materials and DPP fields.
- Review and refine controls for exact model and damage details.
- Guided repair coach with photo verification.
- Spare-part lookup, resale comps, AI-generated marketplace listing and instant
  trade-in offer.
- DPP QR modal and public passport pages.
- Impact translator and shareable impact card.
- B2B material-flow dashboard.
- Brand console for document-backed passport issuance and end-of-life
  intelligence.

## Technology

- Next.js 16 App Router and React 19.
- TypeScript and Tailwind CSS v4.
- OpenAI live mode with vision, structured outputs and web search.
- Offline mock mode for deterministic demos.
- Local JSON persistence in `.data/`.

The live contract is defined in `lib/ai/loopcard.ts`. Mock and live
implementations both return the same schema, so UI behavior stays identical.

## Business Model

Reloop has three main revenue lines:

- DPP-as-a-Service for brands: per-passport issuance and hosted QR/NFC passport
  pages.
- End-of-life intelligence: aggregate downstream data for brands, PROs,
  municipalities and EPR reporting.
- Take-rate on trade-in and resale routing: Reloop can own the transaction
  instead of only linking to marketplaces.

The consumer app is the data engine. The paid product is the compliance and
intelligence layer built from that behavior.

## Why Now

EU regulation is moving toward mandatory Digital Product Passports and stronger
Extended Producer Responsibility. Brands need repairability, recyclability,
material and downstream evidence, but they rarely know what happens after a
consumer stops using a product. Reloop creates that missing evidence at the
discard moment.

## Moat

Anyone can send a photo to a model. The moat is verified, cross-channel
end-of-life data:

- what users actually scanned,
- what condition products were in,
- which circular action was recommended,
- what action users confirmed,
- which materials and categories appear downstream.

That dataset becomes more valuable with every scan and is exactly the kind of
evidence brands and municipalities cannot easily generate themselves.

## Demo Script

1. Start on `/` and show the streak banner.
2. Tap `Cracked phone`. Explain why Repair beats Recycle.
3. Show part lookup and the instant cash offer.
4. Accept the offer so Loop Points and revenue metrics move.
5. Tap `Tangled charger`. Confirm the recycle path and local hint.
6. Tap `Foam packaging`. Show the honest Bin verdict and alternatives nudge.
7. Show the DPP QR and open the public passport page.
8. Open `/dashboard`: material flow, decisions, DPP drafts and revenue.
9. Open `/brand`: issue a document-backed passport and show end-of-life
   intelligence.

## Objection Handling

Does a green consumer app make money?
The consumer app is not the whole business. It is the acquisition and data
engine. Revenue comes from DPPs, EOL intelligence, municipal dashboards and
trade-in take-rate.

Are AI estimates good enough for compliance?
Consumer scans are transparently labeled as AI estimates. The paid brand console
issues document-backed passports. Reloop sells the path from estimate to proof.

What if marketplaces build this?
Marketplaces only see their own channel. Reloop sees the discard moment across
repair, resale, donation, recycling and disposal.

How do you get enough users?
Municipality pilots can create distribution quickly while giving cities a
measurable citizen engagement and recycling tool.

## Cheat Sheet

- Tagline: Snap it. Score it. Loop it.
- Core principle: push users up the waste hierarchy.
- Data flywheel: scans -> decisions -> confirmations -> aggregate EOL proof.
- Demo phone values: repair kit around EUR25, resale EUR60-90, 32 kg CO2 saved.
- Main buyer: brands, municipalities, PROs and EPR systems.
- One-line close: Reloop is the missing data layer of the circular economy.
