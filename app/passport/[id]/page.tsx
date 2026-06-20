import Link from "next/link";
import { getBrandPassportById } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getBrandPassportById(id);

  if (!p) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-zinc-800">Passport not found</h1>
        <p className="mt-2 text-sm text-zinc-500">This Digital Product Passport id doesn&apos;t exist.</p>
        <Link href="/brand" className="mt-4 inline-block text-emerald-600 underline">
          ← Reloop for Brands
        </Link>
      </div>
    );
  }

  const date = new Date(p.createdAt).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Digital Product Passport · ESPR
          </p>
          <h1 className="mt-1 text-2xl font-bold">{p.productName}</h1>
          <p className="text-sm text-white/80">
            {p.brand}
            {p.sku ? ` · SKU ${p.sku}` : ""}
          </p>
          <p className="text-xs text-white/70">Passport ID: {p.id}</p>
        </div>

        <dl className="divide-y divide-zinc-100 px-6 py-4 text-sm">
          <Row k="Category" v={p.category || "—"} />
          <Row k="Material" v={p.material || "—"} />
          <Row k="Recyclability" v={p.recyclability || "—"} />
          <Row k="Recycled content" v={`${p.recycledContentPct}%`} />
          <Row k="Repairability index" v={`${p.repairabilityIndex}/10`} />
          <Row k="Issued" v={date} />
        </dl>

        <div className="border-t border-zinc-100 bg-emerald-50 px-6 py-3">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
            ● Document-backed · issued by manufacturer
          </span>
          <p className="mt-2 text-xs text-emerald-900/80">
            Issued via Reloop&apos;s DPP-as-a-Service. Updates with real end-of-life data as units are scanned by
            consumers. ESPR makes Digital Product Passports mandatory — batteries 2027, textiles &amp; more to follow.
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link href="/brand" className="text-sm text-emerald-700 underline">
          Reloop for Brands →
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-zinc-400">{k}</dt>
      <dd className="text-right font-medium text-zinc-700">{v}</dd>
    </div>
  );
}
