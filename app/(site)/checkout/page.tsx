"use client";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { useCatalog } from "@/components/CatalogProvider";
import ProductImage from "@/components/ProductImage";
import { pkr, site, waLink } from "@/lib/site";

const payments = [
  { id: "Cash on Delivery", note: "Pay when your order arrives" },
  { id: "Bank Transfer", note: "Account details sent on WhatsApp" },
  { id: "JazzCash / Easypaisa", note: "Mobile wallet transfer" },
];
const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"];

export default function Checkout() {
  const { cart, subtotal, clear } = useStore();
  const { getFinish, getProductById } = useCatalog();
  const [pay, setPay] = useState(payments[0].id);
  const [placed, setPlaced] = useState<{ id: string; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const shipping = subtotal >= site.freeShippingOver ? 0 : 450;

  if (placed)
    return (
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-ink text-paper"><Check size={28} strokeWidth={1.5} /></span>
        <p className="eyebrow mt-8">Order {placed.id}</p>
        <h1 className="h-display mt-3 text-[48px] md:text-[64px]">Thank you for your order.</h1>
        <p className="mt-4 max-w-md text-muted">We’ll call or WhatsApp you shortly to confirm delivery. Total: {pkr(placed.total)}.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={waLink(`Assalam o Alaikum, I just placed order ${placed.id}.`)} target="_blank" rel="noreferrer" className="btn-dark">Message us on WhatsApp</a>
          <Link href="/shop" className="btn-line">Keep shopping</Link>
        </div>
      </div>
    );

  if (cart.length === 0)
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="h-display text-[48px]">Your cart is empty.</h1>
        <Link href="/shop" className="btn-dark mt-8">Shop all</Link>
      </div>
    );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: Object.fromEntries(["name", "phone", "email", "address", "city", "province", "notes"].map((k) => [k, f.get(k)])),
          items: cart.map((l) => ({ id: l.id, qty: l.qty, finish: l.finish })),
          payment: pay,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not place the order");
      setPlaced({ id: data.id, total: data.total });
      clear();
      window.scrollTo(0, 0);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x py-12 md:py-16">
      <p className="eyebrow mb-3">Secure checkout</p>
      <h1 className="h-display mb-12 text-[48px] md:text-[72px]">Checkout</h1>
      <form className="grid gap-12 lg:grid-cols-12" onSubmit={submit}>
        <div className="space-y-12 lg:col-span-7">
          <Step n={1} title="Contact">
            <div className="grid gap-4 md:grid-cols-2">
              <input name="name" className="field" placeholder="Full name" required autoComplete="name" />
              <input name="phone" className="field" placeholder="Phone / WhatsApp" required autoComplete="tel" inputMode="tel" />
              <input name="email" className="field md:col-span-2" type="email" placeholder="Email (optional)" autoComplete="email" />
            </div>
          </Step>
          <Step n={2} title="Delivery address">
            <div className="grid gap-4 md:grid-cols-2">
              <input name="address" className="field md:col-span-2" placeholder="House, street, area" required autoComplete="street-address" />
              <input name="city" className="field" placeholder="City" required autoComplete="address-level2" />
              <select name="province" className="field" defaultValue="Punjab">
                {PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </select>
              <textarea name="notes" className="field md:col-span-2" rows={3} placeholder="Delivery notes (optional)" />
            </div>
          </Step>
          <Step n={3} title="Payment">
            <div className="space-y-3">
              {payments.map((p) => (
                <label key={p.id} className={`flex cursor-pointer items-center gap-4 border p-5 transition ${pay === p.id ? "border-ink bg-white/60" : "border-line"}`}>
                  <input type="radio" name="pay" className="accent-ink" checked={pay === p.id} onChange={() => setPay(p.id)} />
                  <span className="flex-1">
                    <span className="block text-[15px]">{p.id}</span>
                    <span className="text-[13px] text-muted">{p.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </Step>
        </div>

        <aside className="h-fit bg-sand p-8 lg:sticky lg:top-28 lg:col-span-5">
          <p className="mb-6 text-[12px] uppercase tracking-[0.24em]">Your order</p>
          <ul className="space-y-4">
            {cart.map((l) => {
              const p = getProductById(l.id);
              if (!p) return null;
              return (
                <li key={l.id + (l.finish ?? "")} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden">
                    <ProductImage product={p} finish={l.finish ?? undefined} idSuffix="co" />
                  </div>
                  <div className="flex-1 text-[14px]">
                    <p>{p.name}</p>
                    <p className="text-[12px] text-muted">Qty {l.qty}{l.finish && ` · ${getFinish(l.finish)?.name}`}</p>
                  </div>
                  <p className="text-[14px]">{pkr(p.price * l.qty)}</p>
                </li>
              );
            })}
          </ul>
          <div className="my-6 border-t border-line" />
          <div className="space-y-2 text-[14px]">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{pkr(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{shipping ? pkr(shipping) : "Free"}</span></div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-[18px]"><span>Total</span><span>{pkr(subtotal + shipping)}</span></div>
          {err && <p className="mt-4 text-[13px] text-sale">{err}</p>}
          <button disabled={busy} className="btn-dark mt-6 w-full">{busy ? "Placing order…" : "Place order"}</button>
        </aside>
      </form>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-4 border-b border-line pb-4">
        <span className="font-display text-[28px] text-muted">0{n}</span>
        <h2 className="text-[12px] uppercase tracking-[0.24em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
