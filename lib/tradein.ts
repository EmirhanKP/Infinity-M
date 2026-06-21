import type { TradeInQuote } from "./clientTypes";

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

export function quoteTradeIn(args: {
  itemName: string;
  material: string;
  conditionScore: number;
  resaleLow: number;
  resaleHigh: number;
}): TradeInQuote {
  const { itemName, material } = args;
  const condition = Math.max(0, Math.min(10, args.conditionScore));
  const { category, partner, logistics } = route(material, itemName);

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
      reloopMarginEur: 0,
      note: "No secondhand market value — better donated or recycled than sold.",
    };
  }

  const mid = (args.resaleLow + args.resaleHigh) / 2;
  const payoutRate = 0.55 + (condition / 10) * 0.17;
  const instant = Math.max(1, Math.round(mid * payoutRate));
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
    reloopMarginEur: margin,
    note: `Instant cash, zero hassle — we collect it, refurbish/resell it via our ${partner}, and keep it in the loop.`,
  };
}
