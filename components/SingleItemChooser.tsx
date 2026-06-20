"use client";

import { motion } from "framer-motion";

export default function SingleItemChooser({
  choices,
  previewUrl,
  busy = false,
  onChoose,
  onRetake,
}: {
  choices: string[];
  previewUrl: string;
  busy?: boolean;
  onChoose: (item: string) => void;
  onRetake: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="w-full overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl"
    >
      <div className="border-b border-zinc-100 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Single item scan</p>
        <h2 className="mt-1 text-lg font-bold text-zinc-900">Which one object should Reloop score?</h2>
        <p className="mt-1 text-sm text-zinc-500">
          I found more than one item. Pick exactly one first, then the AI will create the loop recommendation for that item only.
        </p>
      </div>

      <div className="p-5">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 to-emerald-50">
          <div className="relative aspect-square w-full">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="uploaded items" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">uploaded photo</div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {choices.map((choice) => (
            <button
              key={choice}
              type="button"
              disabled={busy}
              onClick={() => onChoose(choice)}
              className="flex w-full items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-950 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60"
            >
              <span>{choice}</span>
              <span className="text-xs text-emerald-700">choose</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRetake}
          className="mt-4 w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50"
        >
          Retake with one object only
        </button>

        {busy && <p className="mt-3 text-center text-xs text-emerald-700">Creating the recommendation for your selected item...</p>}
      </div>
    </motion.div>
  );
}
