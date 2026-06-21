"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { StreakValues } from "@/lib/clientTypes";

export default function ImpactCard({ streak, onClose }: { streak: StreakValues; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const S = 1080;
    canvas.width = S;
    canvas.height = S;

    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, "#101817");
    g.addColorStop(1, "#16352a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);

    ctx.textAlign = "center";

    ctx.fillStyle = "#55E6A5";
    ctx.font = "700 64px sans-serif";
    ctx.fillText("reloop", S / 2, 150);
    ctx.font = "400 34px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Snap it. Score it. Loop it.", S / 2, 205);

    const stat = (label: string, value: string, y: number) => {
      ctx.fillStyle = "#55E6A5";
      ctx.font = "800 120px sans-serif";
      ctx.fillText(value, S / 2, y);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "500 38px sans-serif";
      ctx.fillText(label, S / 2, y + 58);
    };

    stat("CO₂ saved this week", `${streak.weeklyCo2SavedKg} kg`, 430);
    stat("waste diverted from landfill", `${streak.weeklyWasteDivertedKg} kg`, 660);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 52px sans-serif";
    ctx.fillText(`${streak.loopPoints} Loop Points · 🔥 ${streak.currentStreakDays}-day streak`, S / 2, 860);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "400 34px sans-serif";
    ctx.fillText("I'm keeping my stuff in the loop. Beat me 👇", S / 2, 960);

    setPreview(canvas.toDataURL("image/png"));
  }, [streak]);

  function download() {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = "reloop-impact.png";
    a.click();
  }

  async function share() {
    try {
      const blob = await (await fetch(preview)).blob();
      const file = new File([blob], "reloop-impact.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "My Reloop impact", text: "Keeping my stuff in the loop ♻️" });
        return;
      }
    } catch {
      download();
      return;
    }
    download();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl"
      >
        <h3 className="mb-3 text-center text-lg font-bold text-emerald-900">Share your impact</h3>
        <canvas ref={canvasRef} className="hidden" />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="impact card" className="w-full rounded-2xl shadow-md" />
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={share} className="rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Share
          </button>
          <button onClick={download} className="rounded-full border border-emerald-200 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50">
            Download
          </button>
        </div>
        <button onClick={onClose} className="mt-2 w-full py-2 text-xs text-zinc-400 hover:text-zinc-600">
          Close
        </button>
      </motion.div>
    </div>
  );
}
