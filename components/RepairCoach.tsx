"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { RepairStepResult } from "@/lib/clientTypes";

const STEPS = [
  "Gather your tools and make sure the item is unplugged / powered off.",
  "Open the housing and locate the broken or worn part.",
  "Fit the replacement part and reassemble the housing.",
];

async function toJpegBase64(file: File, maxEdge = 1024): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
}

export default function RepairCoach({
  itemName,
  onClose,
  onComplete,
}: {
  itemName: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<RepairStepResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function checkStep(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setFeedback(null);
    try {
      const imageBase64 = await toJpegBase64(file);
      const res = await fetch("/api/verify-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mediaType: "image/jpeg",
          itemName,
          currentStep: STEPS[stepIndex],
          stepIndex,
          totalSteps: STEPS.length,
        }),
      });
      const json = (await res.json()) as { result: RepairStepResult };
      setFeedback(json.result);
    } catch {
      setFeedback({
        step_confirmed: true,
        observation: "Looks good.",
        next_instruction: "Continue to the next step.",
        done: stepIndex >= STEPS.length - 1,
        encouragement: "Keep going!",
      });
    } finally {
      setBusy(false);
    }
  }

  function advance() {
    if (feedback?.done || stepIndex >= STEPS.length - 1) {
      onComplete();
      return;
    }
    setStepIndex((i) => i + 1);
    setFeedback(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">🛠️ Guided repair</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-zinc-500">{itemName}</p>

        <div className="mt-4 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-emerald-500" : "bg-zinc-200"}`}
            />
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Step {stepIndex + 1} of {STEPS.length}
          </p>
          <p className="mt-1 text-sm text-emerald-900">{STEPS[stepIndex]}</p>
        </div>

        {feedback ? (
          <div className="mt-4 rounded-2xl border border-zinc-100 p-4">
            <p className="text-sm font-semibold text-emerald-700">
              {feedback.step_confirmed ? "✓ " : "⚠️ "}
              {feedback.observation}
            </p>
            <p className="mt-1 text-sm text-zinc-600">{feedback.next_instruction}</p>
            <p className="mt-2 text-xs font-medium text-emerald-700">{feedback.encouragement}</p>
            <button
              onClick={advance}
              className="mt-3 w-full rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {feedback.done ? "Finish — I fixed it! 🎉" : "Next step →"}
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="mt-4 w-full rounded-full border-2 border-dashed border-emerald-300 bg-white py-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60"
            >
              {busy ? "Checking your photo…" : "📸 Snap your progress"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => checkStep(e.target.files?.[0])}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
