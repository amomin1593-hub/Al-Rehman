import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { dbStatus, getCatalog, listOrders } from "@/lib/server/db";
import { safe } from "@/lib/server/safe";
import AdminProblem, { dbHint } from "@/components/admin/AdminProblem";
import { PageTitle, Card } from "@/components/admin/ui";
import DbStatus from "@/components/admin/DbStatus";
import { pkr } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const status = await dbStatus();
  const empty = { products: [], categories: [], collections: [], finishes: [] };
  const [[catRes, catErr], [ordRes, ordErr]] = status.ok
    ? await Promise.all([safe(getCatalog()), safe(listOrders())])
    : [[empty, null], [[], null]] as const;
  const cat = catRes ?? empty;
  const orders = ordRes ?? [];
  const loadError = catErr || ordErr;
  const p = cat.products;
  const out = p.filter((x) => x.stock === 0);
  const low = p.filter((x) => x.stock > 0 && x.stock < 10);
  const units = p.reduce((s, x) => s + x.stock, 0);
  const value = p.reduce((s, x) => s + x.stock * x.price, 0);
  const open = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");

  const stats = [
    { label: "Products", value: p.length, href: "/admin/products" },
    { label: "Units in stock", value: units.toLocaleString(), href: "/admin/products" },
    { label: "Stock value", value: pkr(value), href: "/admin/products" },
    { label: "Open orders", value: open.length, href: "/admin/orders" },
  ];

  return (
    <>
      <PageTitle title="Dashboard" sub="An overview of your store." />
      <DbStatus status={status} />
      {loadError && <div className="mb-8"><AdminProblem title="Some data couldn't be loaded" message={loadError} hint={dbHint} /></div>}
      <div className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white p-6 transition hover:bg-sand">
            <p className="font-display text-[32px] leading-none">{s.value}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title={`Needs restocking (${out.length + low.length})`} action={<Link href="/admin/products?filter=low" className="text-[12px] text-muted hover:text-ink">Manage</Link>}>
          {out.length + low.length === 0 ? (
            <p className="text-[14px] text-muted">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-line">
              {[...out, ...low].slice(0, 8).map((x) => (
                <li key={x.id} className="flex items-center justify-between py-2.5 text-[14px]">
                  <Link href={`/admin/products/${x.id}`} className="hover:text-bronze-dark">{x.name}</Link>
                  <span className={`flex items-center gap-1.5 ${x.stock === 0 ? "text-sale" : "text-bronze-dark"}`}>
                    {x.stock === 0 && <AlertTriangle size={13} />} {x.stock === 0 ? "Out of stock" : `${x.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent orders" action={<Link href="/admin/orders" className="text-[12px] text-muted hover:text-ink">All orders</Link>}>
          {orders.length === 0 ? (
            <p className="text-[14px] text-muted">No orders yet. Orders placed at checkout will appear here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2.5 text-[14px]">
                  <span>{o.id} <span className="text-muted">· {o.customer.name}</span></span>
                  <span className="text-muted">{o.status} · {pkr(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Add a product", "/admin/products/new"],
          ["Bulk import from a spreadsheet", "/admin/import"],
          ["Change home page banners", "/admin/home"],
          ["Update prices & stock", "/admin/products"],
        ].map(([t, h]) => (
          <Link key={h} href={h} className="group flex items-center justify-between border border-line bg-white px-5 py-4 text-[14px] hover:border-ink">
            {t} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </>
  );
}
