"use client";

import { useRef, useState } from "react";

// 1x1 transparent PNG — used by the demo quick-pick buttons, which drive the
// mock by `hint` and don't need a real photo.
const PLACEHOLDER_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export interface Capture {
  imageBase64: string;
  mediaType: string;
  previewUrl: string;
  hint?: string;
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

export default function CameraCapture({
  onCapture,
  busy,
}: {
  onCapture: (c: Capture) => void;
  busy: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const { base64, previewUrl } = await downscaleToJpegBase64(file);
      onCapture({ imageBase64: base64, mediaType: "image/jpeg", previewUrl });
    } catch {
      setError("Couldn't read that image. Try another photo.");
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className="group relative flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-emerald-300 bg-white/70 px-6 py-12 text-center shadow-sm transition hover:border-emerald-400 hover:bg-white disabled:opacity-60"
      >
        <span className="text-5xl transition group-hover:scale-110">📸</span>
        <span className="text-lg font-semibold text-emerald-900">Snap an item</span>
        <span className="max-w-xs text-sm text-emerald-700/80">
          Take or upload a photo — your camera turns clutter into a circular-economy decision in ~3 seconds.
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
        <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-emerald-700/70">
          or try a demo prop
        </p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {DEMO_PROPS.map((p) => (
            <button
              key={p.hint}
              type="button"
              disabled={busy}
              onClick={() =>
                onCapture({
                  imageBase64: PLACEHOLDER_PNG,
                  mediaType: "image/png",
                  previewUrl: "",
                  hint: p.hint,
                })
              }
              className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-50 disabled:opacity-60"
            >
              <span>{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
