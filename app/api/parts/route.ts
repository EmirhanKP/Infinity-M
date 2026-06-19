import { sourceParts } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { itemName?: string; brandModel?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { itemName = "item", brandModel = "" } = body;
  const part = await sourceParts(itemName, brandModel);
  return Response.json({ part });
}
