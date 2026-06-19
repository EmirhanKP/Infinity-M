"use client";

import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const duration = 700;
    let start: number | null = null;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <>{display.toFixed(decimals)}</>;
}

export interface StreakValues {
  loopPoints: number;
  weeklyCo2SavedKg: number;
  weeklyWasteDivertedKg: number;
  currentStreakDays: number;
}

export default function StreakBanner({ streak }: { streak: StreakValues }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#101817] p-3 shadow-lg">
      <Stat label="Loop Points" value={<AnimatedNumber value={streak.loopPoints} />} sub={`🔥 ${streak.currentStreakDays}-day streak`} />
      <Stat label="CO₂ saved / wk" value={<><AnimatedNumber value={streak.weeklyCo2SavedKg} decimals={1} /> kg</>} sub="vs buying new" />
      <Stat label="Waste diverted" value={<><AnimatedNumber value={streak.weeklyWasteDivertedKg} decimals={1} /> kg</>} sub="kept in the loop" />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
      <div className="text-[10px] font-medium uppercase tracking-wide text-white/60">{label}</div>
      <div className="text-xl font-bold tabular-nums leading-tight text-[#55E6A5]">{value}</div>
      <div className="text-[10px] text-white/50">{sub}</div>
    </div>
  );
}
