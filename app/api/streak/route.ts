import { getStreak } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") ?? "anon";
  const streak = await getStreak(sessionId);
  return Response.json({ streak });
}
