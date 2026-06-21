"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#55E6A5", "#2fd08c", "#16b377", "#facc15", "#38bdf8", "#fb7185"];

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

export default function Confetti({ onDone, count = 80 }: { onDone?: () => void; count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (seededUnit(i + 1) - 0.5) * 2 * 48,
        rot: seededUnit(i + 2) * 720 - 360,
        delay: seededUnit(i + 3) * 0.15,
        duration: 1.6 + seededUnit(i + 4) * 1.1,
        size: 7 + seededUnit(i + 5) * 8,
        color: COLORS[i % COLORS.length],
        rounded: seededUnit(i + 6) > 0.5,
        drift: (seededUnit(i + 7) - 0.5) * 30,
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
