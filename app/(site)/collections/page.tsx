import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { catalogHelpers } from "@/lib/catalog";
import { getCatalog } from "@/lib/server/db";

export const metadata: Metadata = { title: "Collections" };

export default async function Collections() {
  const { byCollection, collections } = catalogHelpers(await getCatalog());
  return (
    <div className="container-x pb-24">
      <div className="border-b border-line py-12 md:py-16">
        <p className="eyebrow mb-3">Design families</p>
        <h1 className="h-display text-[48px] md:text-[80px]">Collections</h1>
        <p className="mt-4 max-w-xl text-[16px] text-muted">
          Seven families, each with its own character. Match basins, taps, showers and accessories across one collection for a complete look.
        </p>
      </div>
      <div className="mt-4 divide-y divide-line">
        {collections.map((c, i) => {
          const items = byCollection(c.slug);
          return (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="group grid items-center gap-8 py-10 md:grid-cols-12">
              <span className="text-[12px] text-muted md:col-span-1">0{i + 1}</span>
              <div className="md:col-span-5">
                <h2 className="h-display text-[48px] transition-colors group-hover:text-bronze-dark md:text-[64px]">{c.name}</h2>
                <p className="mt-1 text-[15px] text-muted">{c.line} · {items.length} pieces</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em]">
                  Discover <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 md:col-span-6">
                {items.slice(0, 3).map((p) => (
                  <div key={p.id} className="aspect-square overflow-hidden bg-white">
                    <ProductImage product={p} idSuffix="cl" />
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
