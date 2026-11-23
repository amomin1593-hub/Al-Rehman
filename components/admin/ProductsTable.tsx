"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, ExternalLink, Minus, Star } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { api, PageTitle, Status, useStatus } from "./ui";
import type { Catalog, Product } from "@/lib/catalog";
import { pkr } from "@/lib/site";

export default function ProductsTable({ catalog, initialFilter }: { catalog: Catalog; initialFilter: "all" | "low" }) {
  const router = useRouter();
  const [rows, setRows] = useState(catalog.products);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [stock, setStock] = useState<"all" | "low" | "out">(initialFilter);
  const { state, run } = useStatus();

  const shown = useMemo(
    () =>
      rows.filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (stock === "all" || (stock === "out" ? p.stock === 0 : p.stock < 10)) &&
          (!q || (p.name + p.sku).toLowerCase().includes(q.toLowerCase()))
      ),
    [rows, q, cat, stock]
  );

  const patch = (id: number, fields: Partial<Product>) => {
    setRows((r) => r.map((p) => (p.id === id ? { ...p, ...fields } : p)));
    run(() => api("/api/admin/products", "PATCH", { id, ...fields }).then(() => router.refresh()));
  };

  const remove = (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setRows((r) => r.filter((x) => x.id !== p.id));
    run(() => api(`/api/admin/products?id=${p.id}`, "DELETE").then(() => router.refresh()), "Deleted");
  };

  const catName = (s: string) => catalog.categories.find((c) => c.slug === s)?.name ?? s;

  return (
    <>
      <PageTitle
        title="Products & stock"
        sub={`${rows.length} products · edit price and stock right in the table, changes save automatically`}
        action={
          <Link href="/admin/products/new" className="btn-dark py-3">
            <Plus size={15} /> Add product
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 border border-line bg-white px-3">
          <Search size={15} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU" className="w-full min-w-40 py-2.5 text-[14px] outline-none" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="border border-line bg-white px-3 py-2.5 text-[14px]">
          <option value="all">All categories</option>
          {catalog.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <div className="flex border border-line bg-white text-[13px]">
          {(["all", "low", "out"] as const).map((s) => (
            <button key={s} onClick={() => setStock(s)} className={`px-3 py-2.5 ${stock === s ? "bg-ink text-paper" : "hover:bg-sand"}`}>
              {s === "all" ? "All" : s === "low" ? "Low stock" : "Out of stock"}
            </button>
          ))}
        </div>
        <Status state={state} />
      </div>

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full min-w-[860px] text-[14px]">
          <thead className="border-b border-line bg-sand/60 text-left text-[11px] uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-3 py-3 font-normal">Category</th>
              <th className="px-3 py-3 font-normal">Price (Rs)</th>
              <th className="px-3 py-3 font-normal">Stock</th>
              <th className="px-3 py-3 text-center font-normal">Featured</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((p) => (
              <tr key={p.id} className="hover:bg-paper/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.id}`} className="h-12 w-12 shrink-0 overflow-hidden bg-white">
                      <ProductImage product={p} idSuffix="adm" />
                    </Link>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.id}`} className="block truncate hover:text-bronze-dark">{p.name}</Link>
                      <span className="text-[12px] text-muted">{p.sku}{p.badge ? ` · ${p.badge}` : ""}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-muted">{catName(p.category)}</td>
                <td className="px-3 py-3">
                  <NumberCell value={p.price} onSave={(v) => patch(p.id, { price: v })} width="w-24" />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => patch(p.id, { stock: Math.max(0, p.stock - 1) })} className="grid h-8 w-7 place-items-center border border-line hover:bg-sand" aria-label="Less"><Minus size={12} /></button>
                    <NumberCell value={p.stock} onSave={(v) => patch(p.id, { stock: v })} width="w-14" />
                    <button onClick={() => patch(p.id, { stock: p.stock + 1 })} className="grid h-8 w-7 place-items-center border border-line hover:bg-sand" aria-label="More"><Plus size={12} /></button>
                    <span className={`ml-2 h-2 w-2 rounded-full ${p.stock === 0 ? "bg-sale" : p.stock < 10 ? "bg-bronze" : "bg-[#5b8a52]"}`} title={p.stock === 0 ? "Out of stock" : p.stock < 10 ? "Low stock" : "In stock"} />
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <button onClick={() => patch(p.id, { featured: !p.featured })} aria-label="Toggle featured" title="Show on home page">
                    <Star size={17} strokeWidth={1.3} className={p.featured ? "fill-bronze text-bronze" : "text-muted"} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/products/${p.id}`} className="grid h-8 w-8 place-items-center hover:bg-sand" title="Edit"><Pencil size={15} /></Link>
                    <a href={`/product/${p.slug}`} target="_blank" className="grid h-8 w-8 place-items-center hover:bg-sand" title="View in store"><ExternalLink size={15} /></a>
                    <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center text-sale hover:bg-sand" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted">No products match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-muted">Total stock value of shown products: {pkr(shown.reduce((s, p) => s + p.price * p.stock, 0))}</p>
    </>
  );
}

function NumberCell({ value, onSave, width }: { value: number; onSave: (v: number) => void; width: string }) {
  const [v, setV] = useState(String(value));
  const [last, setLast] = useState(value);
  if (value !== last) {
    setLast(value);
    setV(String(value));
  }
  const commit = () => {
    const n = Math.max(0, Math.round(Number(v) || 0));
    if (n !== value) onSave(n);
    else setV(String(value));
  };
  return (
    <input
      inputMode="numeric"
      value={v}
      onChange={(e) => setV(e.target.value.replace(/[^0-9]/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className={`${width} border border-line px-2 py-1.5 text-center outline-none focus:border-ink`}
    />
  );
}
