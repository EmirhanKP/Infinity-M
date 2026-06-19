import { getLoopCard } from "@/lib/ai";
import { getMunicipality } from "@/lib/municipality";
import { addScan } from "@/lib/store";
import { dealLinksFor } from "@/lib/dealLinks";
import type { ActionType } from "@/lib/ai/loopcard";

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
  if (!imageBase64) {
    return Response.json({ error: "Missing imageBase64" }, { status: 400 });
  }

  const rule = getMunicipality(municipality);
  const { card, source } = await getLoopCard(imageBase64, rule, mediaType, hint);
  const scan = await addScan(sessionId, card, rule.code);

  const links: Record<string, ReturnType<typeof dealLinksFor>> = {};
  for (const action of card.circular_actions) {
    links[action.type] = dealLinksFor(action.type as ActionType, card.item_name);
  }

  return Response.json({
    scanId: scan.id,
    card,
    links,
    source,
    municipality: rule.name,
  });
}
