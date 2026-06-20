"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";

// Lightweight confetti burst — no dependency, pure framer-motion. Mount it when
// you want a celebration; it fires once and calls onDone so the parent can
// unmount it.
const COLORS = ["#55E6A5", "#2fd08c", "#16b377", "#facc15", "#38bdf8", "#fb7185"];

export default function Confetti({ onDone, count = 80 }: { onDone?: () => void; count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 2 * 48, // vw spread, both directions
        rot: Math.random() * 720 - 360,
        delay: Math.random() * 0.15,
        duration: 1.6 + Math.random() * 1.1,
        size: 7 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        rounded: Math.random() > 0.5,
        drift: (Math.random() - 0.5) * 30,
      })),
    [count],
  );

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ top: "38%", left: "50%", opacity: 1, scale: 1 }}
          animate={{
            top: "108%",
            left: `calc(50% + ${p.x + p.drift}vw)`,
            opacity: [1, 1, 0],
            rotate: p.rot,
            scale: [1, 1.1, 0.85],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * (p.rounded ? 1 : 0.5),
            backgroundColor: p.color,
            borderRadius: p.rounded ? "9999px" : "2px",
          }}
        />
      ))}
    </div>
  );
}
