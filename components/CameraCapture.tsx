"use client";

import { useRef, useState } from "react";

const PLACEHOLDER_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export type ScanMode = "single" | "pile";

export interface Capture {
  imageBase64: string;
  mediaType: string;
  previewUrl: string;
  hint?: string;
  mode: ScanMode;
}

const DEMO_PROPS: { hint: string; label: string; emoji: string }[] = [
  { hint: "phone", label: "Cracked phone", emoji: "📱" },
  { hint: "charger", label: "Tangled charger", emoji: "🔌" },
  { hint: "jar", label: "Glass jar", emoji: "🫙" },
  { hint: "toaster", label: "Dead toaster", emoji: "🍞" },
  { hint: "styrofoam", label: "Foam packaging", emoji: "📦" },
];

async function downscaleToJpegBase64(file: File, maxEdge = 1024): Promise<{ base64: string; previewUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  return { base64: dataUrl.split(",")[1], previewUrl: dataUrl };
}

export default function CameraCapture({ onCapture }: { onCapture: (c: Capture) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ScanMode>("single");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const { base64, previewUrl } = await downscaleToJpegBase64(file);
      onCapture({ imageBase64: base64, mediaType: "image/jpeg", previewUrl, mode });
    } catch {
      setError("Couldn't read that image. Try another photo.");
    }
  }

  return (
    <div className="w-full">
      <div className="mb-3 grid grid-cols-2 rounded-2xl bg-emerald-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode("single")}
          aria-pressed={mode === "single"}
          className={`rounded-xl px-4 py-2 transition ${mode === "single" ? "bg-white text-emerald-900 shadow-sm" : "text-emerald-800/70"}`}
        >
          One item
        </button>
        <button
          type="button"
          onClick={() => setMode("pile")}
          aria-pressed={mode === "pile"}
          className={`rounded-xl px-4 py-2 transition ${mode === "pile" ? "bg-white text-emerald-900 shadow-sm" : "text-emerald-800/70"}`}
        >
          Several items
        </button>
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-emerald-300 bg-white/90 px-6 py-10 text-center shadow-sm transition hover:border-emerald-500 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-4xl transition group-hover:scale-105">
          📸
        </span>
        <span className="text-lg font-bold text-emerald-950">
          {mode === "pile" ? "Photograph several items" : "Take or choose a photo"}
        </span>
        <span className="max-w-xs text-sm leading-relaxed text-zinc-600">
          {mode === "pile"
            ? "Use one clear photo of a drawer, table or pile. You can review every detected item separately."
            : "For the most accurate result, show one item clearly and include any visible brand or model name."}
        </span>
        <span className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm">
          Open camera or files
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

      <div className="mt-6">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
          No photo ready? Try an example
        </p>
        {mode === "pile" ? (
          <button
            type="button"
            onClick={() =>
              onCapture({ imageBase64: PLACEHOLDER_PNG, mediaType: "image/png", previewUrl: "", hint: "pile", mode: "pile" })
            }
            className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            🗄️ Try a five-item drawer
          </button>
        ) : (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {DEMO_PROPS.map((p) => (
              <button
                key={p.hint}
                type="button"
                onClick={() =>
                  onCapture({ imageBase64: PLACEHOLDER_PNG, mediaType: "image/png", previewUrl: "", hint: p.hint, mode: "single" })
                }
                className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-50"
              >
                <span>{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
