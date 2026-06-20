import type { TradeInQuote } from "./clientTypes";

// Reloop's instant-buyback / trade-in economics. This is the revenue primitive
// behind the #2 money stream: instead of just affiliate-linking the user OUT to
// Vinted/Back Market (a few % at best), Reloop makes an INSTANT cash offer,
// routes the item to a refurb/resale partner, and captures the spread + a
// service fee. Deterministic (no LLM) so the number is reliable on stage.

const SERVICE_FEE_PCT = 15; // Reloop's transparent service fee on the resale value

// Partner routing + logistics by material family. Each family maps to the
// reverse-logistics partner Reloop actually settles the item with.
function route(material: string, itemName: string): { category: string; partner: string; logistics: string } {
  const s = `${material} ${itemName}`.toLowerCase();
  if (s.includes("li-ion") || s.includes("phone") || s.includes("laptop") || s.includes("electronic") || s.includes("battery"))
    return { category: "Electronics", partner: "Back Market refurbisher network", logistics: "Free prepaid shipping label" };
  if (s.includes("cotton") || s.includes("textile") || s.includes("wool") || s.includes("shirt") || s.includes("jacket") || s.includes("polyester"))
    return { category: "Textiles", partner: "momox / reGAIN reuse partner", logistics: "Free prepaid shipping bag" };
  if (s.includes("wood") || s.includes("chair") || s.includes("table") || s.includes("sofa") || s.includes("furniture"))
    return { category: "Furniture", partner: "Local marketplace + courier partner", logistics: "Free doorstep pickup" };
  if (s.includes("toaster") || s.includes("kettle") || s.includes("appliance") || s.includes("steel") || s.includes("metal"))
    return { category: "Small appliances", partner: "Refurbish & resell partner", logistics: "Free prepaid shipping label" };
  return { category: "General resale", partner: "Reloop resale partner", logistics: "Free prepaid shipping label" };
}

/**
 * Turn a resale band + condition into an instant-cash offer and surface the
 * margin Reloop earns on the transaction (the business case, not shown 1:1 to
 * the consumer but exposed for the dashboard / pitch).
 */
export function quoteTradeIn(args: {
  itemName: string;
  material: string;
  conditionScore: number; // 0-10
  resaleLow: number;
  resaleHigh: number;
}): TradeInQuote {
  const { itemName, material } = args;
  const condition = Math.max(0, Math.min(10, args.conditionScore));
  const { category, partner, logistics } = route(material, itemName);

  // No resale value → not eligible for instant buyback (steer to donate/recycle).
  if (args.resaleHigh <= 0) {
    return {
      eligible: false,
      category,
      partner,
      logistics: "",
      payout: "",
      instantOfferEur: 0,
      sellYourselfLow: 0,
      sellYourselfHigh: 0,
      marketValueEur: 0,
      serviceFeePct: SERVICE_FEE_PCT,
      reloopMarginEur: 0,
      note: "No secondhand market value — better donated or recycled than sold.",
    };
  }

  const mid = (args.resaleLow + args.resaleHigh) / 2;
  // Convenience discount: instant cash is worth less than the patience of a
  // self-listing. Better condition = a higher payout rate (0.55 → 0.72).
  const payoutRate = 0.55 + (condition / 10) * 0.17;
  const instant = Math.max(1, Math.round(mid * payoutRate));
  // The partner settles at ~92% of mid-market; Reloop keeps the spread.
  const market = Math.round(mid * 0.92);
  const margin = Math.max(0, market - instant);

  return {
    eligible: true,
    category,
    partner,
    logistics,
    payout: "Bank transfer or PayPal within 48h",
    instantOfferEur: instant,
    sellYourselfLow: args.resaleLow,
    sellYourselfHigh: args.resaleHigh,
    marketValueEur: market,
    serviceFeePct: SERVICE_FEE_PCT,
    reloopMarginEur: margin,
    note: `Instant cash, zero hassle — we collect it, refurbish/resell it via our ${partner}, and keep it in the loop.`,
  };
}
