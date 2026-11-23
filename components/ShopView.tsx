"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/catalog";
import { useCatalog } from "./CatalogProvider";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  items: Product[];
  hideCategory?: boolean;
  hideCollection?: boolean;
  crumbs?: { href: string; label: string }[];
};

const sorts = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
} as const;

export default function ShopView({ eyebrow, title, intro, items, hideCategory, hideCollection, crumbs = [] }: Props) {
  const { categories, collections, finishes } = useCatalog();
  const [cat, setCat] = useState<string[]>([]);
  const [col, setCol] = useState<string[]>([]);
  const [fin, setFin] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<keyof typeof sorts>("featured");
  const [open, setOpen] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const shown = useMemo(() => {
    let r = items.filter(
      (p) =>
        (!cat.length || cat.includes(p.category)) &&
        (!col.length || col.includes(p.collection)) &&
        (!fin.length || p.finishes.some((f) => fin.includes(f))) &&
        (!inStock || p.stock > 0)
    );
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    if (sort === "featured") r = [...r].sort((a, b) => Number(b.featured) - Number(a.featured));
    return r;
  }, [items, cat, col, fin, inStock, sort]);

  const active = cat.length + col.length + fin.length + (inStock ? 1 : 0);
  const reset = () => { setCat([]); setCol([]); setFin([]); setInStock(false); };

  const presentCats = categories.filter((c) => items.some((p) => p.category === c.slug));
  const presentCols = collections.filter((c) => items.some((p) => p.collection === c.slug));
  const presentFins = finishes.filter((f) => items.some((p) => p.finishes.includes(f.slug)));

  const filters = (
    <div className="space-y-10">
      {!hideCategory && presentCats.length > 1 && (
        <FilterGroup title="Category">
          {presentCats.map((c) => (
            <Check key={c.slug} label={c.name} checked={cat.includes(c.slug)} onChange={() => toggle(cat, setCat, c.slug)} />
          ))}
        </FilterGroup>
      )}
      {!hideCollection && presentCols.length > 1 && (
        <FilterGroup title="Collection">
          {presentCols.map((c) => (
            <Check key={c.slug} label={c.name} checked={col.includes(c.slug)} onChange={() => toggle(col, setCol, c.slug)} />
          ))}
        </FilterGroup>
      )}
      {presentFins.length > 0 && (
        <FilterGroup title="Finish">
          {presentFins.map((f) => (
            <Check key={f.slug} label={f.name} swatch={f.hex} checked={fin.includes(f.slug)} onChange={() => toggle(fin, setFin, f.slug)} />
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Availability">
        <Check label="In stock only" checked={inStock} onChange={() => setInStock((v) => !v)} />
      </FilterGroup>
      {active > 0 && (
        <button onClick={reset} className="text-[12px] uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-ink">Clear all</button>
      )}
    </div>
  );

  return (
    <div className="container-x pb-24">
      <div className="border-b border-line py-12 md:py-16">
        <nav className="mb-6 flex gap-2 text-[12px] text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          {crumbs.map((c) => (
            <span key={c.href} className="flex gap-2">/ <Link href={c.href} className="hover:text-ink">{c.label}</Link></span>
          ))}
        </nav>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="h-display text-[48px] md:text-[80px]">{title}</h1>
        {intro && <p className="mt-4 max-w-xl text-[16px] text-muted">{intro}</p>}
      </div>

      <div className="sticky top-[76px] z-20 flex items-center justify-between border-b border-line bg-paper/95 py-4 backdrop-blur">
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] lg:hidden">
          <SlidersHorizontal size={15} strokeWidth={1.4} /> Filters {active > 0 && `(${active})`}
        </button>
        <p className="hidden text-[13px] text-muted lg:block">{shown.length} products</p>
        <label className="flex items-center gap-3 text-[13px]">
          <span className="hidden text-muted sm:inline">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof sorts)} className="cursor-pointer bg-transparent outline-none">
            {Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <div>
          {shown.length === 0 ? (
            <div className="py-24 text-center">
              <p className="h-display text-3xl">No products match these filters.</p>
              <button onClick={reset} className="btn-line mt-8">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 xl:grid-cols-3">
              {shown.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* mobile filter sheet */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <div className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper transition-transform duration-300 ${open ? "" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-line p-5">
            <p className="text-[12px] uppercase tracking-[0.24em]">Filters</p>
            <button onClick={() => setOpen(false)} aria-label="Close filters"><X size={22} strokeWidth={1.3} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{filters}</div>
          <div className="border-t border-line p-5">
            <button onClick={() => setOpen(false)} className="btn-dark w-full">Show {shown.length} products</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-[11px] uppercase tracking-[0.24em]">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange, swatch }: { label: string; checked: boolean; onChange: () => void; swatch?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[14px]">
      <span className={`grid h-4 w-4 place-items-center border ${checked ? "border-ink bg-ink" : "border-line bg-white"}`}>
        {checked && <span className="h-1.5 w-1.5 bg-paper" />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      {swatch && <span className="h-3.5 w-3.5 rounded-full" style={{ background: `linear-gradient(135deg, ${swatch}, #fff 140%)` }} />}
      <span className={checked ? "" : "text-ink-soft"}>{label}</span>
    </label>
  );
}
