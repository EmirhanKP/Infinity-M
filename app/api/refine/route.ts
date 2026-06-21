import { refineLoopCard } from "@/lib/ai";
import { getMunicipality } from "@/lib/municipality";
import { addScan } from "@/lib/store";
import { dealLinksFor } from "@/lib/dealLinks";
import type { ActionType, LoopCard } from "@/lib/ai/loopcard";

export const runtime = "nodejs";

function withDraftDpp(card: LoopCard): LoopCard {
  const material = card.dpp_fields?.material?.trim() || card.material?.trim() || card.item_name;
  const recyclability =
    card.dpp_fields?.recyclability?.trim() ||
    card.recyclability_note?.trim() ||
    "AI-estimated from selected item";

  return {
    ...card,
    recyclability_note: card.recyclability_note?.trim() || recyclability,
    dpp_fields: {
      material,
      recyclability,
      est_recycled_content_pct: Math.max(0, Math.min(100, Math.round(card.dpp_fields?.est_recycled_content_pct ?? 0))),
    },
  };
}

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
  const result = await refineLoopCard({ imageBase64, rule, mediaType, correction, currentCard });
  const card = withDraftDpp(result.card);
  const source = result.source;
  const scan = await addScan(sessionId, card);

  const links: Record<string, ReturnType<typeof dealLinksFor>> = {};
  for (const action of card.circular_actions) {
    links[action.type] = dealLinksFor(action.type as ActionType, card.item_name);
  }

  return Response.json({ scanId: scan.id, card, links, source, municipality: rule.name });
}
