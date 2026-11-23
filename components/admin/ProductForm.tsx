"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, ExternalLink } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import { api, Card, Field, ImageField, inputCls, PageTitle, Status, useStatus } from "./ui";
import type { Catalog, Product } from "@/lib/catalog";

const ARTS = ["basin-round", "basin-rect", "basin-oval", "faucet-basin", "faucet-tall", "faucet-pillar", "faucet-kitchen", "faucet-kitchen-pull", "bidet-spray", "shower-head", "shower-column", "accessory-set", "towel-rail"];
const BADGES = ["", "New", "Sale", "Best seller"];

type Form = Omit<Product, "id" | "slug" | "price" | "compare_at" | "stock"> & {
  slug: string;
  price: string;
  compare_at: string;
  stock: string;
};

export default function ProductForm({ catalog, product }: { catalog: Catalog; product?: Product }) {
  const router = useRouter();
  const isNew = !product;
  const { state, run, busy } = useStatus();
  const [f, setF] = useState<Form>(() => ({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    category: product?.category ?? catalog.categories[0].slug,
    collection: product?.collection ?? catalog.collections[0].slug,
    price: String(product?.price ?? ""),
    compare_at: product?.compare_at ? String(product.compare_at) : "",
    stock: String(product?.stock ?? 0),
    finishes: product?.finishes ?? ["chrome"],
    specs: product?.specs ?? { Material: "", Warranty: "" },
    art: product?.art ?? "faucet-basin",
    tone: product?.tone ?? "#ece8e1",
    badge: product?.badge ?? null,
    rating: product?.rating ?? 5,
    reviews: product?.reviews ?? 0,
    featured: product?.featured ?? false,
    description: product?.description ?? "",
    image_url: product?.image_url ?? null,
  }));
  const [specRows, setSpecRows] = useState<[string, string][]>(Object.entries(f.specs));

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const finishHex = catalog.finishes.find((x) => x.slug === f.finishes[0])?.hex;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const specs = Object.fromEntries(specRows.filter(([k]) => k.trim()).map(([k, v]) => [k.trim(), v]));
    const body = {
      ...f,
      specs,
      price: Number(f.price) || 0,
      compare_at: f.compare_at ? Number(f.compare_at) : null,
      stock: Number(f.stock) || 0,
      badge: f.badge || null,
    };
    await run(async () => {
      if (isNew) {
        const { product: created } = await api<{ ok: boolean; product: Product }>("/api/admin/products", "POST", body);
        router.push(`/admin/products/${created.id}`);
      } else {
        const { product: updated } = await api<{ ok: boolean; product: Product }>("/api/admin/products", "PATCH", { id: product!.id, ...body });
        set("slug", updated.slug);
        router.refresh();
      }
    }, isNew ? "Product created" : "Saved");
  };

  const remove = async () => {
    if (!product || !confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const ok = await run(() => api(`/api/admin/products?id=${product.id}`, "DELETE"), "Deleted");
    if (ok) router.push("/admin/products");
  };

  return (
    <form onSubmit={save}>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink">
        <ArrowLeft size={14} /> All products
      </Link>
      <PageTitle
        title={isNew ? "New product" : f.name || "Edit product"}
        sub={isNew ? "Fill in the details and save." : `ID ${product!.id} · /product/${f.slug}`}
        action={
          !isNew && (
            <a href={`/product/${f.slug}`} target="_blank" className="flex items-center gap-2 text-[13px] text-muted hover:text-ink">
              View in store <ExternalLink size={14} />
            </a>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product name" wide>
                <input required className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Noor Basin Mixer" />
              </Field>
              <Field label="Category">
                <select className={inputCls} value={f.category} onChange={(e) => set("category", e.target.value)}>
                  {catalog.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Collection">
                <select className={inputCls} value={f.collection} onChange={(e) => set("collection", e.target.value)}>
                  {catalog.collections.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="SKU" hint={isNew ? "Leave empty to create one automatically" : undefined}>
                <input className={inputCls} value={f.sku} onChange={(e) => set("sku", e.target.value)} />
              </Field>
              <Field label="Web address (slug)" hint="Leave empty to use the name">
                <input className={inputCls} value={f.slug} onChange={(e) => set("slug", e.target.value)} />
              </Field>
              <Field label="Description" wide>
                <textarea rows={4} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Price & stock">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Price (Rs)">
                <input required inputMode="numeric" className={inputCls} value={f.price} onChange={(e) => set("price", e.target.value.replace(/[^0-9]/g, ""))} />
              </Field>
              <Field label="Old price (Rs)" hint="Optional. Shown crossed out">
                <input inputMode="numeric" className={inputCls} value={f.compare_at} onChange={(e) => set("compare_at", e.target.value.replace(/[^0-9]/g, ""))} />
              </Field>
              <Field label="Stock (units)" hint="0 = out of stock">
                <input inputMode="numeric" className={inputCls} value={f.stock} onChange={(e) => set("stock", e.target.value.replace(/[^0-9]/g, ""))} />
              </Field>
              <Field label="Badge">
                <select className={inputCls} value={f.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)}>
                  {BADGES.map((b) => <option key={b} value={b}>{b || "None"}</option>)}
                </select>
              </Field>
              <label className="flex items-center gap-3 self-end pb-3 text-[14px]">
                <input type="checkbox" className="h-4 w-4 accent-ink" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />
                Show on home page (featured)
              </label>
            </div>
          </Card>

          <Card title="Finishes">
            <div className="flex flex-wrap gap-2">
              {catalog.finishes.map((fin) => {
                const on = f.finishes.includes(fin.slug);
                return (
                  <button
                    type="button"
                    key={fin.slug}
                    onClick={() => set("finishes", on ? f.finishes.filter((x) => x !== fin.slug) : [...f.finishes, fin.slug])}
                    className={`flex items-center gap-2 border px-3 py-2 text-[13px] ${on ? "border-ink bg-sand" : "border-line"}`}
                  >
                    <span className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(135deg, ${fin.hex}, #fff 140%)` }} />
                    {fin.name}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card
            title="Specifications"
            action={
              <button type="button" onClick={() => setSpecRows((r) => [...r, ["", ""]])} className="flex items-center gap-1 text-[12px] text-muted hover:text-ink">
                <Plus size={13} /> Add row
              </button>
            }
          >
            <div className="space-y-2">
              {specRows.map(([k, v], i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls} placeholder="e.g. Size" value={k} onChange={(e) => setSpecRows((r) => r.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} />
                  <input className={inputCls} placeholder="e.g. 50x40 cm" value={v} onChange={(e) => setSpecRows((r) => r.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} />
                  <button type="button" onClick={() => setSpecRows((r) => r.filter((_, j) => j !== i))} className="px-2 text-muted hover:text-sale" aria-label="Remove row"><Trash2 size={15} /></button>
                </div>
              ))}
              {specRows.length === 0 && <p className="text-[13px] text-muted">No specifications.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Photo">
            <ImageField
              folder="products"
              aspect="aspect-[3/2]"
              value={f.image_url}
              onChange={(url) => set("image_url", url)}
              fallback={<ProductArt art={f.art} finish={finishHex} tone={f.tone} id="form-art" className="h-full w-full" />}
            />
            <p className="mt-3 text-[12px] text-muted">JPG, PNG or WebP up to 8 MB. Landscape 3:2 photos on a white background look best (e.g. 1536×1024). Without a photo, the drawing below is shown.</p>
            <div className="mt-4">
              <Field label="Drawing (when no photo)">
                <select className={inputCls} value={f.art} onChange={(e) => set("art", e.target.value)}>
                  {ARTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          <div className="sticky top-6 space-y-3 border border-line bg-white p-5">
            <button disabled={busy} className="btn-dark w-full">{isNew ? "Create product" : "Save changes"}</button>
            <div className="min-h-5 text-center"><Status state={state} /></div>
            {!isNew && (
              <button type="button" onClick={remove} className="flex w-full items-center justify-center gap-2 py-2 text-[13px] text-sale hover:underline">
                <Trash2 size={14} /> Delete product
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
