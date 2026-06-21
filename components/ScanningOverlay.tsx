"use client";

import { motion } from "framer-motion";

export default function ScanningOverlay({ previewUrl }: { previewUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-12">
      <div className="relative h-44 w-44 overflow-hidden rounded-3xl shadow-2xl">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="scanning" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-4xl">📦</div>
        )}

        <div className="scan-line" />
        <div className="shimmer absolute inset-0" />

        <span className="absolute left-2 top-2 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-[#55E6A5]" />
        <span className="absolute right-2 top-2 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-[#55E6A5]" />
        <span className="absolute bottom-2 left-2 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-[#55E6A5]" />
        <span className="absolute bottom-2 right-2 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-[#55E6A5]" />
      </div>

      <div className="flex items-center gap-2 text-emerald-700">
        <motion.span
          className="h-2.5 w-2.5 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.span
          className="text-sm font-medium"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          Reading & ranking circular actions…
        </motion.span>
      </div>
    </div>
  );
}
