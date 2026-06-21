import { recordTradeIn } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    itemName?: string;
    category?: string;
    instantOfferEur?: number;
    marketValueEur?: number;
    reloopMarginEur?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const record = await recordTradeIn({
    itemName: body.itemName ?? "item",
    category: body.category ?? "General resale",
    instantOfferEur: Number(body.instantOfferEur) || 0,
    marketValueEur: Number(body.marketValueEur) || 0,
    reloopMarginEur: Number(body.reloopMarginEur) || 0,
  });
  return Response.json({ record });
}
