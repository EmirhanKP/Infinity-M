"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "qrcode";

export default function DppQrModal({
  scanId,
  pathPrefix = "/dpp/",
  onClose,
}: {
  scanId: string;
  pathPrefix?: string;
  onClose: () => void;
}) {
  const [qr, setQr] = useState<string>("");
  const url = `${pathPrefix}${scanId}`;

  useEffect(() => {
    const origin = window.location.origin;
    const passportUrl = `${origin}${pathPrefix}${scanId}`;
    QRCode.toDataURL(passportUrl, { width: 320, margin: 1, color: { dark: "#064e3b", light: "#ffffff" } })
      .then(setQr)
      .catch(() => {});
  }, [scanId, pathPrefix]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl"
      >
        <h3 className="text-lg font-bold text-emerald-900">Digital Product Passport</h3>
        <p className="mt-1 text-xs text-zinc-500">Scan with any phone to open the passport.</p>
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="DPP QR code" className="mx-auto mt-4 h-56 w-56 rounded-2xl border border-zinc-100" />
        ) : (
          <div className="mx-auto mt-4 h-56 w-56 animate-pulse rounded-2xl bg-zinc-100" />
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block break-all text-xs text-emerald-600 underline"
        >
          {url}
        </a>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}
