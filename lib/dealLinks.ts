import type { ActionType } from "./ai/loopcard";
import type { DeepLink } from "./clientTypes";

const VINTED_AFFILIATE = process.env.AFFILIATE_VINTED_ID;
const BACKMARKET_AFFILIATE = process.env.AFFILIATE_BACKMARKET_ID;

function q(s: string): string {
  return encodeURIComponent(s.trim());
}

export function dealLinksFor(actionType: ActionType, itemName: string): DeepLink[] {
  switch (actionType) {
    case "repair":
      return [
        { label: "Find a repair guide (iFixit)", url: `https://www.ifixit.com/Search?query=${q(itemName)}` },
        { label: "Find a Repair Café near you", url: "https://www.repaircafe.org/en/visit/" },
      ];
    case "resell":
      return [
        {
          label: "List on Vinted",
          url: `https://www.vinted.de/catalog?search_text=${q(itemName)}${VINTED_AFFILIATE ? `&ref=${q(VINTED_AFFILIATE)}` : ""}`,
        },
        {
          label: "Sell on Back Market",
          url: `https://www.backmarket.de/de-de/search?q=${q(itemName)}${BACKMARKET_AFFILIATE ? `&utm_source=${q(BACKMARKET_AFFILIATE)}` : ""}`,
        },
      ];
    case "donate":
      return [
        { label: "Find a donation point", url: `https://www.google.com/maps/search/${q("donate " + itemName + " near me")}` },
        { label: "Reuse / give away locally", url: "https://www.nebenan.de/" },
      ];
    case "recycle":
      return [
        { label: "Find a drop-off / Wertstoffhof", url: `https://www.google.com/maps/search/${q("Wertstoffhof recycling near me")}` },
      ];
    case "bin":
    default:
      return [
        { label: "Find correct disposal", url: `https://www.google.com/maps/search/${q("waste disposal " + itemName + " near me")}` },
      ];
  }
}
