import { getLoopCard } from "@/lib/ai";
import { getMunicipality } from "@/lib/municipality";
import { addScan } from "@/lib/store";
import { dealLinksFor } from "@/lib/dealLinks";
import type { ActionType } from "@/lib/ai/loopcard";

export const runtime = "nodejs";

function itemChoices(primary: string, others: string[]): string[] {
  const seen = new Set<string>();
  return [primary, ...others]
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

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
  const choices = itemChoices(card.item_name, card.other_items_detected ?? []);
  if (choices.length > 1) {
    return Response.json({
      kind: "choose-item",
      choices,
      source,
      municipality: rule.name,
    });
  }

  const scan = await addScan(sessionId, card);

  const links: Record<string, ReturnType<typeof dealLinksFor>> = {};
  for (const action of card.circular_actions) {
    links[action.type] = dealLinksFor(action.type as ActionType, card.item_name);
  }

  return Response.json({
    kind: "scan",
    scanId: scan.id,
    card,
    links,
    source,
    municipality: rule.name,
  });
}
