"use client";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { QtyControl } from "@/components/CartDrawer";
import ProductImage from "@/components/ProductImage";
import { useCatalog } from "@/components/CatalogProvider";
import { pkr, site } from "@/lib/site";

export default function CartPage() {
  const { cart, subtotal, setQty, remove } = useStore();
  const { getFinish, getProductById } = useCatalog();
  const shipping = subtotal === 0 || subtotal >= site.freeShippingOver ? 0 : 450;

  return (
    <div className="container-x py-12 md:py-16">
      <p className="eyebrow mb-3">Your selection</p>
      <h1 className="h-display mb-12 text-[48px] md:text-[72px]">Cart</h1>

      {cart.length === 0 ? (
        <div className="border-t border-line py-24 text-center">
          <p className="h-display text-3xl">Your cart is empty.</p>
          <Link href="/shop" className="btn-dark mt-8">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-12">
          <ul className="divide-y divide-line border-y border-line lg:col-span-8">
            {cart.map((l) => {
              const p = getProductById(l.id);
              if (!p) return null;
              return (
                <li key={l.id + (l.finish ?? "")} className="flex gap-5 py-6">
                  <Link href={`/product/${p.slug}`} className="h-32 w-28 shrink-0 overflow-hidden md:h-40 md:w-36">
                    <ProductImage product={p} finish={l.finish ?? undefined} idSuffix="cp" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link href={`/product/${p.slug}`} className="text-[16px] hover:text-bronze-dark">{p.name}</Link>
                        <p className="mt-1 text-[13px] text-muted">{p.sku}{l.finish && ` · ${getFinish(l.finish)?.name}`}</p>
                      </div>
                      <p className="text-[16px]">{pkr(p.price * l.qty)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <QtyControl value={l.qty} onChange={(n) => setQty(l.id, l.finish, n)} />
                      <button onClick={() => remove(l.id, l.finish)} className="text-[12px] uppercase tracking-[0.2em] text-muted hover:text-ink">Remove</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <aside className="h-fit bg-sand p-8 lg:col-span-4">
            <p className="mb-6 text-[12px] uppercase tracking-[0.24em]">Order summary</p>
            <Row label="Subtotal" value={pkr(subtotal)} />
            <Row label="Delivery" value={shipping === 0 ? "Free" : pkr(shipping)} />
            <div className="my-5 border-t border-line" />
            <Row label="Total" value={pkr(subtotal + shipping)} big />
            <Link href="/checkout" className="btn-dark mt-8 w-full">Checkout</Link>
            <p className="mt-4 text-center text-[12px] text-muted">Cash on delivery · Bank transfer · JazzCash / Easypaisa</p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 ${big ? "text-[18px]" : "text-[14px]"}`}>
      <span className={big ? "" : "text-muted"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
