"use client";

import CountUp from "./CountUp";

export interface StreakValues {
  loopPoints: number;
  weeklyCo2SavedKg: number;
  weeklyWasteDivertedKg: number;
  currentStreakDays: number;
}

export default function StreakBanner({ streak }: { streak: StreakValues }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#101817] p-3 shadow-lg">
      <Stat label="Loop Points" value={<CountUp value={streak.loopPoints} />} sub={`🔥 ${streak.currentStreakDays}-day streak`} />
      <Stat label="CO₂ saved / wk" value={<CountUp value={streak.weeklyCo2SavedKg} decimals={1} suffix=" kg" />} sub="vs buying new" />
      <Stat label="Waste diverted" value={<CountUp value={streak.weeklyWasteDivertedKg} decimals={1} suffix=" kg" />} sub="kept in the loop" />
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
