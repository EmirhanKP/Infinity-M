import { groundResale } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { itemName?: string; conditionNote?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { itemName = "item", conditionNote = "" } = body;
  const grounding = await groundResale(itemName, conditionNote);
  return Response.json({ grounding });
}
