import { getBrandData, issueBrandPassport } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getBrandData();
  return Response.json(data);
}

export async function POST(request: Request) {
  let body: {
    brand?: string;
    productName?: string;
    sku?: string;
    category?: string;
    material?: string;
    recyclability?: string;
    recycledContentPct?: number;
    repairabilityIndex?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const passport = await issueBrandPassport({
    brand: body.brand ?? "",
    productName: body.productName ?? "",
    sku: body.sku ?? "",
    category: body.category ?? "",
    material: body.material ?? "",
    recyclability: body.recyclability ?? "",
    recycledContentPct: Number(body.recycledContentPct) || 0,
    repairabilityIndex: Number(body.repairabilityIndex) || 0,
  });
  return Response.json({ passport });
}
