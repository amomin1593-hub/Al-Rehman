"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, Truck, ShieldCheck, RotateCcw, Star, ChevronDown } from "lucide-react";
import { useStore } from "./StoreProvider";
import { QtyControl } from "./CartDrawer";
import ProductArt from "./ProductArt";
import { FINISH_HEX, productPhotos, type Product } from "@/lib/catalog";
import { useCatalog } from "./CatalogProvider";
import { pkr, waLink, site } from "@/lib/site";

const VIEW_TONES = ["", "#f3f1ec", "#d9d3c9", "#e6e8e7"];

export default function ProductDetail({ product: p }: { product: Product }) {
  const { add, wishlist, toggleWish } = useStore();
  const { getCategory, getCollection, getFinish } = useCatalog();
  const [finish, setFinish] = useState<string | null>(p.finishes[0] ?? null);
  const [qty, setQty] = useState(1);
  const photos = productPhotos(p);
  const startView = Math.max(0, photos.findIndex((x) => x.finish === (p.finishes[0] ?? null)));
  const [view, setView] = useState(photos.length ? startView : 0);
  const [openTab, setOpenTab] = useState<string | null>("Description");
  const fin = finish ? getFinish(finish) : undefined;
  const cat = getCategory(p.category) ?? { slug: p.category, name: p.category };
  const col = getCollection(p.collection) ?? { slug: p.collection, name: p.collection };
  const wished = wishlist.includes(p.id);

  const drawing = (tone: string, id: string) => (
    <ProductArt art={p.art} finish={fin?.hex ?? FINISH_HEX.chrome} tone={tone || p.tone} id={id} className="h-full w-full" />
  );
  // eslint-disable-next-line @next/next/no-img-element
  const photo = (url: string) => <img src={url} alt={p.name} className="h-full w-full bg-white object-contain" />;

  // picking a finish shows that finish's photo; picking a photo selects its finish
  const pickFinish = (f: string) => {
    setFinish(f);
    const i = photos.findIndex((x) => x.finish === f);
    if (i >= 0) setView(i);
  };
  const pickView = (i: number) => {
    setView(i);
    const f = photos[i]?.finish;
    if (f && p.finishes.includes(f)) setFinish(f);
  };

  const tabs: [string, React.ReactNode][] = [
    ["Description", <p key="d" className="leading-relaxed">{p.description}</p>],
    [
      "Specifications",
      <dl key="s" className="divide-y divide-line">
        {[["SKU", p.sku], ["Collection", col.name], ...Object.entries(p.specs)].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2.5 text-[14px]"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>,
    ],
    ["Delivery & returns", <p key="r" className="leading-relaxed">Free delivery in Gujranwala on orders over {pkr(site.freeShippingOver)}. Nationwide delivery in 2–5 working days. Unused items in original packaging can be exchanged within 7 days.</p>],
  ];

  return (
    <div className="container-x py-8 md:py-12">
      <nav className="mb-8 flex flex-wrap gap-2 text-[12px] text-muted">
        <Link href="/" className="hover:text-ink">Home</Link> /
        <Link href={`/shop/${cat.slug}`} className="hover:text-ink">{cat.name}</Link> /
        <span className="text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse gap-4 md:flex-row">
            <div className="flex gap-3 md:flex-col">
              {photos.length > 1 &&
                photos.map((ph, i) => (
                  <button key={ph.url + i} onClick={() => pickView(i)} title={ph.finish ? getFinish(ph.finish)?.name : undefined}
                    className={`h-20 w-20 shrink-0 overflow-hidden border bg-white transition ${view === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    {photo(ph.url)}
                  </button>
                ))}
              {photos.length === 0 &&
                VIEW_TONES.map((t, i) => (
                  <button key={i} onClick={() => setView(i)} className={`h-20 w-20 shrink-0 overflow-hidden border bg-white transition ${view === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}>
                    {drawing(t, `pd-t${i}-${finish}`)}
                  </button>
                ))}
            </div>
            <div className="relative aspect-square flex-1 overflow-hidden bg-white">
              {photos.length ? photo(photos[Math.min(view, photos.length - 1)].url) : drawing(VIEW_TONES[view], `pd-main-${view}-${finish}`)}
              {p.badge && <span className={`absolute left-4 top-4 px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${p.badge === "Sale" ? "bg-sale text-paper" : "bg-paper"}`}>{p.badge}</span>}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5 lg:pt-4">
          <Link href={`/collections/${col.slug}`} className="eyebrow hover:text-ink">{col.name} Collection</Link>
          <h1 className="h-display mt-3 text-[42px] md:text-[56px]">{p.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-[13px] text-muted">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} strokeWidth={1.2} className={i < Math.round(p.rating) ? "fill-ink text-ink" : ""} />
              ))}
            </span>
            {p.rating} · {p.reviews} reviews
          </div>

          <p className="mt-6 text-[24px]">
            {pkr(p.price)}
            {p.compare_at && <span className="ml-3 text-[17px] text-muted line-through">{pkr(p.compare_at)}</span>}
          </p>
          <p className="text-[12px] text-muted">Cash on delivery available</p>

          {p.finishes.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-[12px] uppercase tracking-[0.2em]">Finish: <span className="text-muted normal-case tracking-normal">{fin?.name}</span></p>
              <div className="flex gap-3">
                {p.finishes.map((f) => {
                  const ff = getFinish(f);
                  if (!ff) return null;
                  return (
                    <button key={f} onClick={() => pickFinish(f)} title={ff.name} aria-label={ff.name}
                      className={`h-10 w-10 rounded-full ring-offset-4 ring-offset-paper transition ${finish === f ? "ring-1 ring-ink" : "hover:ring-1 hover:ring-line"}`}
                      style={{ background: `linear-gradient(135deg, ${ff.hex}, #fff 150%)` }} />
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <QtyControl value={qty} onChange={(n) => setQty(Math.max(1, n))} />
            <button disabled={p.stock === 0} onClick={() => add(p.id, finish, qty)} className="btn-dark flex-1">
              {p.stock === 0 ? "Out of stock" : "Add to cart"}
            </button>
            <button onClick={() => toggleWish(p.id)} className="grid w-12 place-items-center border border-line hover:border-ink" aria-label="Wishlist">
              <Heart size={18} strokeWidth={1.3} className={wished ? "fill-ink" : ""} />
            </button>
          </div>
          <a href={waLink(`Assalam o Alaikum, I'm interested in ${p.name} (${p.sku})${fin ? ", finish: " + fin.name : ""}.`)} target="_blank" rel="noreferrer"
            className="btn-line mt-3 w-full">Order on WhatsApp</a>
          <p className={`mt-4 text-[13px] ${p.stock === 0 ? "text-sale" : p.stock < 10 ? "text-bronze-dark" : "text-muted"}`}>
            {p.stock === 0 ? "Currently out of stock. Ask us on WhatsApp for restock dates." : p.stock < 10 ? `Only ${p.stock} left in stock` : "In stock, ready to dispatch"}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-6 text-center text-[12px] text-muted">
            <div><Truck size={20} strokeWidth={1.1} className="mx-auto mb-2 text-ink" />Nationwide delivery</div>
            <div><ShieldCheck size={20} strokeWidth={1.1} className="mx-auto mb-2 text-ink" />{p.specs.Warranty ?? "Warranty"}</div>
            <div><RotateCcw size={20} strokeWidth={1.1} className="mx-auto mb-2 text-ink" />7-day exchange</div>
          </div>

          <div className="mt-2 divide-y divide-line">
            {tabs.map(([title, body]) => (
              <div key={title}>
                <button className="flex w-full items-center justify-between py-5 text-[12px] uppercase tracking-[0.2em]" onClick={() => setOpenTab(openTab === title ? null : title)}>
                  {title} <ChevronDown size={15} className={`transition-transform ${openTab === title ? "rotate-180" : ""}`} />
                </button>
                {openTab === title && <div className="pb-6 text-[15px] text-ink-soft">{body}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
