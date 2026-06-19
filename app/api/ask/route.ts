import { askScience } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { question?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { question = "" } = body;
  if (!question.trim()) return Response.json({ error: "Missing question" }, { status: 400 });
  const result = await askScience(question.trim());
  return Response.json({ result });
}
