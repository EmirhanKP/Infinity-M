# Reloop Test Everything Checklist

Use this checklist to validate every major feature before a demo.

## 0. Start

1. Install Node.js 20.9 or newer.
2. Run:

```bash
npm install
npm run dev
```

3. Open http://localhost:3000.

For phone camera and QR testing, use the network URL printed by `npm run dev`
instead of localhost. The laptop and phone must be on the same Wi-Fi network.

## 1. Modes

Mock mode is the default and needs no API key. All demo buttons work
deterministically.

Live mode uses OpenAI:

```env
RELOOP_AI_MODE=live
OPENAI_API_KEY=sk-...
```

Restart the dev server after changing `.env.local`.

## 2. Home And Branding

- [ ] Logo, wordmark and "Snap it. Score it. Loop it." are visible.
- [ ] Navigation links to Learn, B2B and Brands are visible.
- [ ] Streak banner animates Loop Points, CO2 saved and waste diverted.
- [ ] Tapping the streak banner opens the Impact Translator.

## 3. Single-Item Scan

- [ ] Mode toggle is set to Single item.
- [ ] Each demo prop opens a Loop Card after the scan animation.
- [ ] Uploading or taking a custom photo opens a Loop Card.
- [ ] The card shows item name, material, condition, CO2 saved and resale value.

## 4. Review And Refine

- [ ] Transparency banner labels estimates or matched data.
- [ ] Review & refine expands.
- [ ] Exact model input works.
- [ ] Condition buttons work.
- [ ] Damage chips work.
- [ ] Rescore updates the card and shows feedback.

## 5. Action Hierarchy

- [ ] Actions are ranked best-first.
- [ ] Best action has a Best Loop badge.
- [ ] Every action has instructions, effort dots and a local hint.
- [ ] External links open in a new tab.
- [ ] Confirming an action awards Loop Points.

## 6. Repair Features

- [ ] Start guided repair opens the Repair Coach.
- [ ] Repair Coach shows three steps and a progress bar.
- [ ] Snap your progress accepts a photo.
- [ ] Feedback appears after each step.
- [ ] Finish awards Loop Points.
- [ ] Find the exact part returns a part, price and links.

## 7. Resale Features

- [ ] Get instant cash offer returns an offer.
- [ ] Accepting the offer confirms the action and updates revenue data.
- [ ] Get live resale comps returns a price band and links.
- [ ] Write my listing creates title, description, price and category.
- [ ] Copy listing writes to the clipboard.
- [ ] Open on Vinted opens a marketplace link.

## 8. Digital Product Passport

- [ ] Loop Card footer shows draft DPP fields.
- [ ] Show DPP QR opens a QR modal.
- [ ] The public `/dpp/<id>` page opens.
- [ ] Phone QR scan works from the network URL.

## 9. Whole-Pile Scan

- [ ] Mode toggle switches to Whole pile.
- [ ] Scan a full junk drawer returns multiple items.
- [ ] Bounding boxes appear on the image.
- [ ] Tapping a box highlights the list item.
- [ ] Review & options opens the full single-item card for one pile item.
- [ ] Confirming a pile item awards Loop Points.

## 10. Impact Translator

- [ ] Modal opens from the streak banner.
- [ ] Scale selector changes from Just you to street and city scale.
- [ ] Equivalence numbers animate.
- [ ] Share my impact opens the Impact Card.
- [ ] Download saves the generated image.

## 11. Learn Page

- [ ] Fact cards and source links render.
- [ ] How Reloop works section renders.
- [ ] Ask the science accepts text input.
- [ ] Suggested questions work.
- [ ] Watch and Read links open externally.

## 12. B2B Dashboard

- [ ] KPIs load and animate.
- [ ] Circular decisions chart renders.
- [ ] Material flow renders.
- [ ] Routed GMV and Reloop revenue update after accepted offers.
- [ ] Sample DPP cards render with confidence labels.

## 13. Brand Console

- [ ] Brand form accepts product data.
- [ ] Issuing a passport creates a document-backed passport.
- [ ] Passport QR modal opens.
- [ ] Public `/passport/<id>` page opens.
- [ ] End-of-life intelligence renders.
- [ ] Compliance and pricing panels render.

## 14. Smoke Test

1. Scan Cracked phone.
2. Review/refine with `iPhone 13 Pro`.
3. Find a part.
4. Get and accept an instant cash offer.
5. Show the DPP QR.
6. Scan a full junk drawer.
7. Ask a Learn question.
8. Open Dashboard and Brand Console.

If all steps pass, the app is demo-ready.

## 15. Known Follow-Ups

- Test several real photos in live mode before any presentation.
- Confirm the selected OpenAI models are available for the key.
- Use the network URL for phone QR and camera demos.
- Replace the JSON store with a database before production or multi-user use.
- Add more municipality rules beyond the current default ruleset.
