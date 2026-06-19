import { refineLoopCard } from "@/lib/ai";
import { getMunicipality } from "@/lib/municipality";
import { addScan } from "@/lib/store";
import { dealLinksFor } from "@/lib/dealLinks";
import type { ActionType, LoopCard } from "@/lib/ai/loopcard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    imageBase64?: string;
    mediaType?: string;
    sessionId?: string;
    municipality?: string;
    correction?: string;
    currentCard?: LoopCard;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    imageBase64 = "",
    mediaType = "image/jpeg",
    sessionId = "anon",
    municipality,
    correction = "",
    currentCard,
  } = body;
  if (!currentCard) return Response.json({ error: "Missing currentCard" }, { status: 400 });

  const rule = getMunicipality(municipality);
  const { card, source } = await refineLoopCard({ imageBase64, rule, mediaType, correction, currentCard });
  const scan = await addScan(sessionId, card, rule.code);

  const links: Record<string, ReturnType<typeof dealLinksFor>> = {};
  for (const action of card.circular_actions) {
    links[action.type] = dealLinksFor(action.type as ActionType, card.item_name);
  }

  return Response.json({ scanId: scan.id, card, links, source, municipality: rule.name });
}
