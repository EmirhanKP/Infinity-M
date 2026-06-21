import type { LoopCard } from "./loopcard";
import type { MunicipalityRule } from "../municipality";
import type {
  AskResult,
  ListingResult,
  MultiScanItem,
  PartResult,
  RepairStepResult,
  ResaleGrounding,
} from "../clientTypes";

export type DemoKey = "phone" | "charger" | "jar" | "toaster" | "styrofoam";

function localise(rule: MunicipalityRule, card: LoopCard): LoopCard {
  return {
    ...card,
    circular_actions: card.circular_actions.map((a) => {
      if (a.type === "recycle" && a.local_hint.includes("{city}")) {
        return { ...a, local_hint: a.local_hint.replace("{city}", rule.name) };
      }
      return a;
    }),
  };
}

const CARDS: Record<DemoKey, LoopCard> = {
  phone: {
    item_name: "Smartphone with cracked screen",
    material: "Aluminium frame + glass + lithium-ion battery + rare-earth electronics",
    brand_model_guess: "Apple iPhone (model not legible)",
    condition_score: 4,
    circular_actions: [
      {
        type: "repair",
        instructions:
          "Screen is cracked but the phone powers on — a screen replacement restores full value. Order a ~€25 screen kit or book a local repair shop (≈€60–90 done-for-you).",
        effort_1to5: 3,
        local_hint: "Search iFixit for your exact model's screen-replacement guide.",
      },
      {
        type: "resell",
        instructions:
          "If you won't repair it, sell as-is for parts/refurb — cracked phones still have strong resale value.",
        effort_1to5: 2,
        local_hint: "List on Back Market (refurb buyers) or Vinted; mention the cracked screen.",
      },
      {
        type: "recycle",
        instructions:
          "Only as a last resort: a working phone should never be recycled while it can be repaired or resold.",
        effort_1to5: 1,
        local_hint:
          "Any electronics retailer must take it back free under EU WEEE law — never the household bin (battery fire risk).",
      },
    ],
    resale_estimate_eur: { low: 60, high: 90 },
    co2_saved_kg: 32,
    recyclability_note:
      "High-value materials (gold, cobalt, aluminium) but disassembly is complex; reuse beats recycling here.",
    alternatives: [],
    recoverable_materials: {
      summary: "≈0.03 g gold, plus cobalt, copper, palladium & rare-earth magnets — true urban mining",
      est_value_eur: 2,
    },
    dpp_fields: {
      material: "Aluminium + glass + Li-ion + mixed electronics",
      recyclability: "Partially recyclable (specialist WEEE stream)",
      est_recycled_content_pct: 20,
    },
    data_basis: "ai_estimate",
    data_note: "AI estimate from the photo — tap “Not right?” and add the exact model for model-specific figures.",
    other_items_detected: [],
  },
  charger: {
    item_name: "Tangled phone charger / cable bundle",
    material: "Copper wire + PVC insulation + ABS plastic housing",
    brand_model_guess: "",
    condition_score: 6,
    circular_actions: [
      {
        type: "donate",
        instructions:
          "If it still works, a working charger is reusable — give it to a repair café, school, or buy-nothing group.",
        effort_1to5: 2,
        local_hint: "Drop at a Repair Café or list on a local buy-nothing group.",
      },
      {
        type: "recycle",
        instructions:
          "Dead or surplus cables are mixed e-waste — they recover copper, but they are NOT household plastic.",
        effort_1to5: 1,
        local_hint:
          "Drop at any electronics retailer (free WEEE take-back) or the Wertstoffhof — NOT the yellow/packaging bin.",
      },
    ],
    resale_estimate_eur: { low: 0, high: 5 },
    co2_saved_kg: 1.2,
    recyclability_note:
      "Copper is valuable and recyclable; the mixed plastics need the e-waste stream, not packaging recycling.",
    alternatives: [],
    recoverable_materials: {
      summary: "Recoverable copper in the wire — worth recycling for the metal",
      est_value_eur: 1,
    },
    dpp_fields: {
      material: "Copper + PVC + ABS",
      recyclability: "Recyclable via WEEE e-waste stream",
      est_recycled_content_pct: 10,
    },
    data_basis: "ai_estimate",
    data_note: "AI estimate from the photo — material breakdown is approximate.",
    other_items_detected: [],
  },
  jar: {
    item_name: "Empty glass jar with lid",
    material: "Soda-lime glass + steel lid",
    brand_model_guess: "",
    condition_score: 9,
    circular_actions: [
      {
        type: "donate",
        instructions:
          "Reuse first! A clean jar is perfect for storage, refills, or zero-waste shops — keep it in use before recycling.",
        effort_1to5: 1,
        local_hint: "Take to a refill/unverpackt store, or reuse at home for dry goods.",
      },
      {
        type: "recycle",
        instructions:
          "When you do recycle it, separate the metal lid from the glass so each goes to the right stream.",
        effort_1to5: 1,
        local_hint:
          "Glass goes in the container by colour (green/brown/clear Altglascontainer); the steel lid goes with metals/packaging.",
      },
    ],
    resale_estimate_eur: { low: 0, high: 0 },
    co2_saved_kg: 0.6,
    recyclability_note:
      "Glass is infinitely recyclable, but reuse avoids the remelt energy entirely — reuse beats recycle.",
    alternatives: [],
    recoverable_materials: {
      summary: "No precious metals — its value is in reuse, not recovery",
      est_value_eur: 0,
    },
    dpp_fields: {
      material: "Soda-lime glass + steel",
      recyclability: "Fully recyclable (colour-separated)",
      est_recycled_content_pct: 60,
    },
    data_basis: "ai_estimate",
    data_note: "AI estimate from the photo — glass figures are typical values.",
    other_items_detected: [],
  },
  toaster: {
    item_name: "Two-slice electric toaster (not heating)",
    material: "Steel housing + nichrome heating elements + electronics + plastic",
    brand_model_guess: "Bosch (logo partially visible)",
    condition_score: 5,
    circular_actions: [
      {
        type: "repair",
        instructions:
          "Often a snapped element, blown thermal fuse, or loose lever — a common, fixable fault. Try a repair café before replacing.",
        effort_1to5: 3,
        local_hint: "Bring it to a Repair Café; search iFixit for small-appliance teardown.",
      },
      {
        type: "recycle",
        instructions:
          "If genuinely beyond repair, it is small electrical e-waste — recover the steel and copper.",
        effort_1to5: 1,
        local_hint:
          "Free retailer take-back under EU WEEE / ElektroG, or the Wertstoffhof — not the residual bin.",
      },
    ],
    resale_estimate_eur: { low: 5, high: 15 },
    co2_saved_kg: 6,
    recyclability_note:
      "Mostly metal and therefore recyclable, but a €5 repair part keeps the whole appliance in use.",
    alternatives: [],
    recoverable_materials: {
      summary: "Steel housing, copper windings and nichrome elements — recyclable metals",
      est_value_eur: 1,
    },
    dpp_fields: {
      material: "Steel + nichrome + electronics + plastic",
      recyclability: "Recyclable via WEEE stream",
      est_recycled_content_pct: 30,
    },
    data_basis: "ai_estimate",
    data_note: "AI estimate from the photo — add the model/wattage for a precise repair cost.",
    other_items_detected: [],
  },
  styrofoam: {
    item_name: "Polystyrene foam packaging block",
    material: "Expanded polystyrene (EPS / Styrofoam)",
    brand_model_guess: "",
    condition_score: 2,
    circular_actions: [
      {
        type: "bin",
        instructions:
          "EPS foam has almost no reuse or repair path and is rarely recycled in practice — the honest verdict is disposal via the packaging stream.",
        effort_1to5: 1,
        local_hint:
          "Goes with lightweight packaging (yellow/Wertstoff), but EPS is rarely truly recycled — avoid buying it.",
      },
      {
        type: "recycle",
        instructions:
          "A few recycling centers accept clean EPS separately — check before assuming it's recyclable.",
        effort_1to5: 2,
        local_hint: "Ask your local Wertstoffhof whether they take clean Styropor / EPS.",
      },
    ],
    resale_estimate_eur: { low: 0, high: 0 },
    co2_saved_kg: 0.1,
    recyclability_note:
      "EPS is technically recyclable but economically rarely is — the real win is avoiding it at the design/purchase stage.",
    alternatives: [
      {
        name: "Molded-pulp or mushroom-foam packaging",
        why: "Home-compostable protective packaging that replaces EPS entirely.",
      },
      {
        name: "Products shipped in recycled-cardboard inserts",
        why: "Choose brands using paper-based protection — it actually gets recycled in the paper stream.",
      },
    ],
    recoverable_materials: {
      summary: "No recoverable material value — the win is avoiding it at purchase",
      est_value_eur: 0,
    },
    dpp_fields: {
      material: "Expanded polystyrene (EPS)",
      recyclability: "Technically recyclable, practically landfilled",
      est_recycled_content_pct: 0,
    },
    data_basis: "ai_estimate",
    data_note: "AI estimate from the photo — EPS has no recoverable value to refine.",
    other_items_detected: [],
  },
};

const ORDER: DemoKey[] = ["phone", "charger", "jar", "toaster", "styrofoam"];

function hashPick(imageBase64: string): DemoKey {
  let sum = 0;
  for (let i = 0; i < imageBase64.length; i += 997) {
    sum = (sum + imageBase64.charCodeAt(i)) % 100000;
  }
  return ORDER[sum % ORDER.length];
}

function keyFromLabel(label: string): DemoKey | null {
  const s = label.toLowerCase();
  if (/(phone|smartphone|iphone|tablet|laptop|screen)/.test(s)) return "phone";
  if (/(charger|cable|adapter|wire|usb)/.test(s)) return "charger";
  if (/(jar|glass|bottle)/.test(s)) return "jar";
  if (/(toaster|kettle|appliance)/.test(s)) return "toaster";
  if (/(foam|styrofoam|polystyrene|eps|packaging)/.test(s)) return "styrofoam";
  return null;
}

export function mockLoopCard(
  imageBase64: string,
  rule: MunicipalityRule,
  hint?: string | null,
): LoopCard {
  const key = (hint && (ORDER as string[]).includes(hint) ? hint : hashPick(imageBase64)) as DemoKey;
  return localise(rule, CARDS[key]);
}

export function mockRefine(card: LoopCard, correction: string): LoopCard {
  const { low, high } = card.resale_estimate_eur;
  const mid = high > 0 ? Math.round((low + high) / 2) : 0;
  const focusedItem = correction.match(/^Focus only on the (.+?) in this photo/i)?.[1]?.trim();
  if (focusedItem) {
    const key = keyFromLabel(focusedItem);
    const base = key ? CARDS[key] : card;
    return {
      ...base,
      item_name: focusedItem,
      data_basis: "ai_estimate",
      data_note: `AI estimate focused on "${focusedItem}" from the selected photo.`,
      other_items_detected: [],
      dpp_fields: {
        material: base.dpp_fields.material || base.material || focusedItem,
        recyclability: base.dpp_fields.recyclability || base.recyclability_note || "AI-estimated from selected item",
        est_recycled_content_pct: base.dpp_fields.est_recycled_content_pct ?? 0,
      },
    };
  }
  return {
    ...card,
    item_name: correction ? `${card.item_name} (${correction})` : card.item_name,
    brand_model_guess: correction || card.brand_model_guess,
    resale_estimate_eur: mid > 0 ? { low: Math.round(mid * 0.9), high: Math.round(mid * 1.1) } : card.resale_estimate_eur,
    data_basis: "model_matched",
    data_note: `Matched to "${correction}" - figures now use this model's known specifications.`,
    other_items_detected: [],
  };
}

export function mockRepairStep(stepIndex: number, totalSteps: number): RepairStepResult {
  const done = stepIndex >= totalSteps - 1;
  return {
    step_confirmed: true,
    observation: "Looks right — the part is seated correctly and aligned.",
    next_instruction: done
      ? "That's the last step. Power it on and test — nice work, you just kept this out of the bin."
      : "Great. Now move to the next step and snap another photo when you're done.",
    done,
    encouragement: done ? "Repair complete! 🎉" : "You're doing great — keep going.",
  };
}

export function mockAsk(question: string): AskResult {
  void question;
  return {
    answer:
      "Keeping a product in use — repairing, reusing or reselling it — almost always beats recycling, because every recycling loop still loses some material and energy. That's exactly why the EU waste hierarchy ranks prevention and reuse above recycling. And because roughly 80% of a product's lifetime environmental impact is decided at the design stage, the biggest wins come from keeping well-made things in circulation for longer.",
    sources: [
      {
        label: "Ellen MacArthur Foundation — Circular economy explained",
        url: "https://www.ellenmacarthurfoundation.org/topics/circular-economy-introduction/overview",
      },
      {
        label: "UN Global E-waste Monitor 2024",
        url: "https://globalewaste.org/",
      },
    ],
  };
}

export function mockMultiScan(): MultiScanItem[] {
  return [
    {
      label: "Smartphone (cracked)",
      material: "Aluminium + glass + Li-ion",
      condition_score: 4,
      box: { x: 0.06, y: 0.1, w: 0.34, h: 0.42 },
      best_action: "repair",
      instruction: "Screen kit ~€25 restores full value.",
      local_hint: "iFixit guide for your model.",
      co2_saved_kg: 32,
      resale_low: 60,
      resale_high: 90,
    },
    {
      label: "Tangled charger",
      material: "Copper + PVC",
      condition_score: 6,
      box: { x: 0.46, y: 0.06, w: 0.3, h: 0.3 },
      best_action: "recycle",
      instruction: "Mixed e-waste — retailer take-back.",
      local_hint: "Not the yellow bin — WEEE take-back.",
      co2_saved_kg: 1.2,
      resale_low: 0,
      resale_high: 5,
    },
    {
      label: "Glass jar",
      material: "Soda-lime glass",
      condition_score: 9,
      box: { x: 0.62, y: 0.46, w: 0.26, h: 0.44 },
      best_action: "donate",
      instruction: "Reuse for storage or refill shop.",
      local_hint: "Refill/unverpackt store.",
      co2_saved_kg: 0.6,
      resale_low: 0,
      resale_high: 0,
    },
    {
      label: "AA batteries",
      material: "Alkaline / zinc",
      condition_score: 2,
      box: { x: 0.1, y: 0.62, w: 0.22, h: 0.2 },
      best_action: "recycle",
      instruction: "Never in household waste — fire risk.",
      local_hint: "Battery collection box at any supermarket.",
      co2_saved_kg: 0.4,
      resale_low: 0,
      resale_high: 0,
    },
    {
      label: "Cotton t-shirt",
      material: "Cotton",
      condition_score: 7,
      box: { x: 0.34, y: 0.5, w: 0.26, h: 0.4 },
      best_action: "donate",
      instruction: "Wearable — donate or resell, don't bin.",
      local_hint: "Textile container / charity (EU textile EPR).",
      co2_saved_kg: 4,
      resale_low: 3,
      resale_high: 12,
    },
  ];
}

export function mockListing(itemName: string, low: number, high: number): ListingResult {
  const price = high > 0 ? Math.round((low + high) / 2) : 15;
  return {
    title: `${itemName} — good condition, ready to loop ♻️`,
    description: `Selling my ${itemName.toLowerCase()}. Works well, normal signs of use. Giving it a second life instead of landfill — collection or shipping possible. Priced to move. #circular #secondhand`,
    price_eur: price,
    category: "Electronics & Tech",
    marketplaceUrl: `https://www.vinted.de/items/new?search_text=${encodeURIComponent(itemName)}`,
  };
}

export function mockParts(itemName: string): PartResult {
  return {
    part_name: `Replacement part / repair kit for ${itemName}`,
    price_eur: 25,
    note: "Typical screen/spare-part kit price for this class of device.",
    links: [
      { label: "iFixit repair kit", url: `https://www.ifixit.com/Search?query=${encodeURIComponent(itemName)}` },
      { label: "Spare parts on Amazon", url: `https://www.amazon.de/s?k=${encodeURIComponent(itemName + " replacement part")}` },
      { label: "Compatible parts on eBay", url: `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(itemName + " ersatzteil")}` },
    ],
  };
}

export function mockResale(itemName: string): ResaleGrounding {
  return {
    low: 55,
    high: 95,
    links: [
      { label: "Similar listings on Back Market", url: "https://www.backmarket.de/" },
      { label: "Comparable sold items on Vinted", url: "https://www.vinted.de/" },
    ],
    note: `Estimated from comparable secondhand listings for "${itemName}". Live comps would tighten this band.`,
  };
}
