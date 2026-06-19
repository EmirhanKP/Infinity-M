import { confirmAction } from "@/lib/store";
import type { ActionType } from "@/lib/ai/loopcard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    sessionId?: string;
    scanId?: string;
    actionType?: ActionType;
    co2SavedKg?: number;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sessionId = "anon", scanId = "unknown", actionType, co2SavedKg = 0 } = body;
  if (!actionType) {
    return Response.json({ error: "Missing actionType" }, { status: 400 });
  }

  const { confirm, streak } = await confirmAction({
    sessionId,
    scanId,
    actionType,
    co2SavedKg,
  });

  return Response.json({ confirm, streak });
}
