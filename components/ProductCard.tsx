"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useStore } from "./StoreProvider";
import ProductImage from "./ProductImage";
import type { Product } from "@/lib/catalog";
import { useCatalog } from "./CatalogProvider";
import { pkr } from "@/lib/site";

export default function ProductCard({ product: p }: { product: Product }) {
  const { add, wishlist, toggleWish } = useStore();
  const { getFinish } = useCatalog();
  const [finish, setFinish] = useState<string | null>(p.finishes[0] ?? null);
  const wished = wishlist.includes(p.id);
  const specs = Object.entries(p.specs).slice(0, 2);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-white">
        <Link href={`/product/${p.slug}`} aria-label={p.name} className="block h-full">
          <div className="h-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]">
            <ProductImage product={p} finish={finish ?? undefined} idSuffix="card" />
          </div>
        </Link>
        {p.badge && (
          <span className={`absolute left-3 top-3 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${p.badge === "Sale" ? "bg-sale text-paper" : "bg-paper text-ink"}`}>
            {p.badge}
          </span>
        )}
        <button
          onClick={() => toggleWish(p.id)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-paper/80 backdrop-blur transition hover:bg-paper"
        >
          <Heart size={16} strokeWidth={1.4} className={wished ? "fill-ink" : ""} />
        </button>
        {p.stock === 0 ? (
          <span className="absolute bottom-3 left-3 bg-paper/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted">Out of stock</span>
        ) : (
          <button
            onClick={() => add(p.id, finish)}
            className="btn-dark absolute inset-x-3 bottom-3 translate-y-3 py-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden"
          >
            Add to cart
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <Link href={`/product/${p.slug}`} className="text-[15px] font-normal leading-snug hover:text-bronze-dark">{p.name}</Link>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
          {specs.map(([k, v]) => (
            <span key={k}>{k}: {v}</span>
          ))}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <p className="text-[15px]">
            {pkr(p.price)}
            {p.compare_at && <span className="ml-2 text-[13px] text-muted line-through">{pkr(p.compare_at)}</span>}
          </p>
          {p.finishes.length > 0 && (
            <div className="flex gap-1.5">
              {p.finishes.map((f) => {
                const fin = getFinish(f);
                if (!fin) return null;
                return (
                  <button
                    key={f}
                    title={fin.name}
                    aria-label={fin.name}
                    onClick={() => setFinish(f)}
                    className={`h-4 w-4 rounded-full ring-offset-2 ring-offset-paper transition ${finish === f ? "ring-1 ring-ink" : ""}`}
                    style={{ background: `linear-gradient(135deg, ${fin.hex}, #fff 140%)` }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
