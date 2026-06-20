import { quoteTradeIn } from "@/lib/tradein";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    itemName?: string;
    material?: string;
    conditionScore?: number;
    resaleLow?: number;
    resaleHigh?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const {
    itemName = "item",
    material = "",
    conditionScore = 5,
    resaleLow = 0,
    resaleHigh = 0,
  } = body;
  const quote = quoteTradeIn({ itemName, material, conditionScore, resaleLow, resaleHigh });
  return Response.json({ quote });
}
