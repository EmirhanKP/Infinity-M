import Link from "next/link";
import { getScanById } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await getScanById(id);

  if (!scan) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-zinc-800">Passport not found</h1>
        <p className="mt-2 text-sm text-zinc-500">This Digital Product Passport id doesn&apos;t exist.</p>
        <Link href="/" className="mt-4 inline-block text-emerald-600 underline">
          ← Reloop
        </Link>
      </div>
    );
  }

  const date = new Date(scan.createdAt).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Digital Product Passport · ESPR draft
          </p>
          <h1 className="mt-1 text-2xl font-bold">{scan.itemName}</h1>
          <p className="text-sm text-white/80">Passport ID: {scan.id}</p>
        </div>

        <dl className="divide-y divide-zinc-100 px-6 py-4 text-sm">
          <Row k="Material" v={scan.dppMaterial || scan.material} />
          <Row k="Recyclability" v={scan.dppRecyclability || "—"} />
          <Row k="Recycled content" v={`~${scan.dppRecycledContentPct}%`} />
          <Row k="Condition at end-of-life" v={`${scan.conditionScore}/10`} />
          <Row k="Recommended circular action" v={scan.bestActionType} />
          <Row k="CO₂ saved vs. new" v={`${scan.co2SavedKg} kg`} />
          {scan.recoverableSummary ? (
            <Row k="Recoverable materials" v={`${scan.recoverableSummary} (≈€${scan.recoverableValueEur})`} />
          ) : null}
          <Row k="Captured" v={date} />
        </dl>

        <div className="border-t border-zinc-100 bg-amber-50 px-6 py-3">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
            ● AI-estimated draft
          </span>
          <p className="mt-2 text-xs text-amber-900/80">
            Auto-generated from a consumer scan. Upgrades to &ldquo;document-backed&rdquo; when a spec sheet or
            mill certificate is attached. ESPR makes Digital Product Passports mandatory — batteries 2026,
            textiles 2027.
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-emerald-700/60">
        Powered by <Link href="/" className="font-semibold underline">Reloop</Link> · Snap it. Score it. Loop it.
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-2">
      <dt className="text-zinc-400">{k}</dt>
      <dd className="text-right font-medium text-zinc-800">{v}</dd>
    </div>
  );
}
