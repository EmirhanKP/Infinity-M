import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reloop - Snap it. Score it. Loop it.",
  description:
    "Snap any item and an AI Loop Card ranks the best circular action - repair, resell, donate, recycle or bin - with one-tap actions, rewards and a CO2-saved streak.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#101817",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
