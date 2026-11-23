"use client";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { api, PageTitle, Status, useStatus } from "./ui";
import { pkr } from "@/lib/site";
import type { Order } from "@/lib/server/db";

const fmt = (d: string) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const wa = (phone: string) => "https://wa.me/" + phone.replace(/[^0-9]/g, "").replace(/^0/, "92");

export default function OrdersAdmin({ orders: initial, statuses }: { orders: Order[]; statuses: string[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const { state, run } = useStatus();

  const setStatus = (id: string, status: string) => {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    run(() => api("/api/admin/orders", "PATCH", { id, status }).then(() => router.refresh()));
  };
  const shown = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <PageTitle title="Orders" sub={`${orders.length} orders from the checkout`} action={<Status state={state} />} />
      <div className="mb-4 flex flex-wrap gap-2 text-[13px]">
        {["All", ...statuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`border px-3 py-1.5 ${filter === s ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink"}`}>
            {s} {s !== "All" && <span className="opacity-60">({orders.filter((o) => o.status === s).length})</span>}
          </button>
        ))}
      </div>
      {orders.length === 0 ? (
        <div className="border border-dashed border-line bg-white py-20 text-center text-muted">No orders yet. When customers check out, their orders appear here.</div>
      ) : (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[760px] text-[14px]">
            <thead className="border-b border-line bg-sand/60 text-left text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-3 py-3 font-normal">Customer</th>
                <th className="px-3 py-3 font-normal">Items</th>
                <th className="px-3 py-3 font-normal">Total</th>
                <th className="px-3 py-3 font-normal">Payment</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((o) => (
                <Fragment key={o.id}>
                  <tr className="cursor-pointer hover:bg-paper/60" onClick={() => setOpen(open === o.id ? null : o.id)}>
                    <td className="px-4 py-3">{o.id}<div className="text-[12px] text-muted">{fmt(o.created_at)}</div></td>
                    <td className="px-3 py-3">{o.customer.name}<div className="text-[12px] text-muted">{o.customer.city}</div></td>
                    <td className="px-3 py-3 text-muted">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                    <td className="px-3 py-3">{pkr(o.total)}</td>
                    <td className="px-3 py-3 text-muted">{o.payment}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="border border-line bg-white px-2 py-1.5 text-[13px]">
                        {statuses.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {open === o.id && (
                    <tr className="bg-paper/60">
                      <td colSpan={6} className="px-4 py-5">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="text-[13px] leading-relaxed">
                            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Deliver to</p>
                            <p>{o.customer.name}</p>
                            <p>{o.customer.address}</p>
                            <p>{o.customer.city}, {o.customer.province}</p>
                            {o.customer.email && <p className="text-muted">{o.customer.email}</p>}
                            {o.customer.notes && <p className="mt-2 italic text-muted">“{o.customer.notes}”</p>}
                            <div className="mt-3 flex gap-2">
                              <a href={`tel:${o.customer.phone}`} className="flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 hover:border-ink"><Phone size={13} /> {o.customer.phone}</a>
                              <a href={wa(o.customer.phone)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 border border-line bg-white px-3 py-1.5 hover:border-ink"><MessageCircle size={13} /> WhatsApp</a>
                            </div>
                          </div>
                          <ul className="space-y-1 text-[13px]">
                            <li className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted">Items</li>
                            {o.items.map((i, k) => (
                              <li key={k} className="flex justify-between gap-4">
                                <span>{i.qty} × {i.name}{i.finish ? ` (${i.finish})` : ""}</span>
                                <span>{pkr(i.qty * i.price)}</span>
                              </li>
                            ))}
                            <li className="flex justify-between border-t border-line pt-1 text-muted"><span>Delivery</span><span>{o.shipping ? pkr(o.shipping) : "Free"}</span></li>
                            <li className="flex justify-between font-medium"><span>Total</span><span>{pkr(o.total)}</span></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
