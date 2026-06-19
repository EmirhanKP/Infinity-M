import type { ActionType } from "./ai/loopcard";

export const ACTION_META: Record<
  ActionType,
  { label: string; verb: string; emoji: string; chip: string; ring: string; solid: string }
> = {
  repair: {
    label: "Repair",
    verb: "I repaired it",
    emoji: "🔧",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ring: "ring-emerald-300",
    solid: "bg-emerald-600 hover:bg-emerald-700",
  },
  resell: {
    label: "Resell",
    verb: "I listed it",
    emoji: "🏷️",
    chip: "bg-sky-100 text-sky-800 border-sky-200",
    ring: "ring-sky-300",
    solid: "bg-sky-600 hover:bg-sky-700",
  },
  donate: {
    label: "Donate / Reuse",
    verb: "I donated it",
    emoji: "🎁",
    chip: "bg-violet-100 text-violet-800 border-violet-200",
    ring: "ring-violet-300",
    solid: "bg-violet-600 hover:bg-violet-700",
  },
  recycle: {
    label: "Recycle",
    verb: "I recycled it",
    emoji: "♻️",
    chip: "bg-teal-100 text-teal-800 border-teal-200",
    ring: "ring-teal-300",
    solid: "bg-teal-600 hover:bg-teal-700",
  },
  bin: {
    label: "Bin (last resort)",
    verb: "I binned it",
    emoji: "🗑️",
    chip: "bg-zinc-100 text-zinc-700 border-zinc-200",
    ring: "ring-zinc-300",
    solid: "bg-zinc-600 hover:bg-zinc-700",
  },
};

export function effortDots(n: number): string {
  const clamped = Math.max(1, Math.min(5, n));
  return "●".repeat(clamped) + "○".repeat(5 - clamped);
}
