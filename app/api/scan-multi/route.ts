import { getMultiScan } from "@/lib/ai";
import { getMunicipality } from "@/lib/municipality";
import { addScanLite } from "@/lib/store";
import { dealLinksFor } from "@/lib/dealLinks";
import type { MultiScanItem } from "@/lib/clientTypes";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    imageBase64?: string;
    mediaType?: string;
    sessionId?: string;
    municipality?: string;
    hint?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imageBase64, mediaType = "image/jpeg", sessionId = "anon", municipality, hint } = body;
  if (!imageBase64) return Response.json({ error: "Missing imageBase64" }, { status: 400 });

  const rule = getMunicipality(municipality);
  const { items, source } = await getMultiScan(imageBase64, rule, mediaType, hint);

  const enriched: (MultiScanItem & { links: ReturnType<typeof dealLinksFor> })[] = [];
  for (const item of items) {
    const rec = await addScanLite(sessionId, item);
    enriched.push({ ...item, scanId: rec.id, links: dealLinksFor(item.best_action, item.label) });
  }

  return Response.json({ items: enriched, source, municipality: rule.name });
}
