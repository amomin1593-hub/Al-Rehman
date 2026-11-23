"use client";
import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";
import { useStore } from "./StoreProvider";
import { useCatalog } from "./CatalogProvider";
import { pkr, site } from "@/lib/site";
import ProductImage from "./ProductImage";

export function QtyControl({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center border border-line">
      <button className="grid h-9 w-9 place-items-center hover:bg-sand" onClick={() => onChange(value - 1)} aria-label="Decrease"><Minus size={13} /></button>
      <span className="w-8 text-center text-[14px]">{value}</span>
      <button className="grid h-9 w-9 place-items-center hover:bg-sand" onClick={() => onChange(value + 1)} aria-label="Increase"><Plus size={13} /></button>
    </div>
  );
}

export default function CartDrawer() {
  const { cart, drawer, setDrawer, subtotal, setQty, remove, count } = useStore();
  const { getFinish, getProductById } = useCatalog();
  const left = site.freeShippingOver - subtotal;

  return (
    <div className={`fixed inset-0 z-50 ${drawer ? "" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${drawer ? "opacity-100" : "opacity-0"}`} onClick={() => setDrawer(false)} />
      <aside className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper transition-transform duration-300 ${drawer ? "" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-6">
          <p className="text-[12px] uppercase tracking-[0.24em]">Your cart ({count})</p>
          <button onClick={() => setDrawer(false)} aria-label="Close cart"><X size={22} strokeWidth={1.3} /></button>
        </div>

        {cart.length > 0 && (
          <div className="border-b border-line px-6 py-4 text-[13px]">
            {left > 0 ? <p>Add <b className="font-normal">{pkr(left)}</b> more for free delivery</p> : <p>You have free delivery</p>}
            <div className="mt-2 h-[3px] bg-stone"><div className="h-full bg-bronze transition-all" style={{ width: `${Math.min(100, (subtotal / site.freeShippingOver) * 100)}%` }} /></div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="h-display text-3xl">Your cart is empty</p>
              <p className="mt-3 text-[14px] text-muted">Explore our collections and find your next piece.</p>
              <Link href="/shop" onClick={() => setDrawer(false)} className="btn-dark mt-8">Shop all</Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {cart.map((l) => {
                const p = getProductById(l.id);
                if (!p) return null;
                return (
                  <li key={l.id + (l.finish ?? "")} className="flex gap-4 py-5">
                    <Link href={`/product/${p.slug}`} onClick={() => setDrawer(false)} className="h-24 w-24 shrink-0 overflow-hidden">
                      <ProductImage product={p} finish={l.finish ?? undefined} idSuffix="cd" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <p className="text-[14px] leading-snug">{p.name}</p>
                        <p className="text-[14px] whitespace-nowrap">{pkr(p.price * l.qty)}</p>
                      </div>
                      {l.finish && <p className="mt-1 text-[12px] text-muted">{getFinish(l.finish)?.name}</p>}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QtyControl value={l.qty} onChange={(n) => setQty(l.id, l.finish, n)} />
                        <button className="text-[12px] text-muted underline-offset-4 hover:underline" onClick={() => remove(l.id, l.finish)}>Remove</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-line px-6 py-6">
            <div className="mb-5 flex justify-between text-[15px]">
              <span>Subtotal</span>
              <span>{pkr(subtotal)}</span>
            </div>
            <Link href="/checkout" onClick={() => setDrawer(false)} className="btn-dark w-full">Checkout</Link>
            <Link href="/cart" onClick={() => setDrawer(false)} className="mt-3 block text-center text-[12px] uppercase tracking-[0.2em] text-muted hover:text-ink">View cart</Link>
          </div>
        )}
      </aside>
    </div>
  );
}
