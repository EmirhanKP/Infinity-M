import { getDashboard } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const data = await getDashboard();
  return Response.json(data);
}
