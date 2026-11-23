"use client";
// Customer profile / account area. All data comes from data/profile.json (dummy) for now.
// Replace with Supabase auth + queries on `profiles`, `orders`, `addresses`, `wishlist` later.
import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, Package, Heart, MapPin, Settings, LogOut, ChevronDown, Award, ArrowRight } from "lucide-react";
import { useStore } from "./StoreProvider";
import ProductCard from "./ProductCard";
import ProductImage from "./ProductImage";
import { profile } from "@/lib/profile";
import { useCatalog } from "./CatalogProvider";
import { pkr } from "@/lib/site";

type Tab = "overview" | "orders" | "wishlist" | "addresses" | "settings";
type Order = (typeof profile.orders)[number];

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Account settings", icon: Settings },
];

const STAGES = ["Processing", "Shipped", "Out for delivery", "Delivered"];

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function AccountView({ initialTab = "overview" }: { initialTab?: string }) {
  const [tab, setTab] = useState<Tab>((TABS.some((t) => t.id === initialTab) ? initialTab : "overview") as Tab);
  const { wishlist } = useStore();
  const u = profile.user;

  return (
    <div className="container-x py-12 md:py-16">
      {/* Profile header */}
      <div className="flex flex-col gap-8 border-b border-line pb-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-ink font-display text-[30px] text-paper md:h-24 md:w-24 md:text-[36px]">
            {u.avatar_initials}
          </div>
          <div>
            <p className="eyebrow mb-2">My account</p>
            <h1 className="h-display text-[40px] md:text-[56px]">Welcome, {u.name.split(" ")[0]}</h1>
            <p className="mt-1 text-[14px] text-muted">Member since {fmtDate(u.member_since)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start border border-bronze/40 bg-white/50 px-5 py-3 md:self-auto">
          <Award size={22} strokeWidth={1.2} className="text-bronze" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-bronze-dark">{u.tier}</p>
            <p className="text-[14px]">{profile.stats.reward_points.toLocaleString()} reward points</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
        {/* Sidebar */}
        <nav className="-mx-5 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:px-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-3 px-4 py-3 text-left text-[14px] transition lg:border-l-2 ${
                tab === id ? "bg-sand text-ink lg:border-ink" : "text-muted hover:text-ink lg:border-transparent"
              }`}
            >
              <Icon size={17} strokeWidth={1.3} />
              {label}
              {id === "wishlist" && <span className="ml-auto text-[12px] text-muted">{wishlist.length}</span>}
              {id === "orders" && <span className="ml-auto text-[12px] text-muted">{profile.orders.length}</span>}
            </button>
          ))}
          <button className="mt-0 flex shrink-0 items-center gap-3 px-4 py-3 text-[14px] text-muted hover:text-ink lg:mt-6 lg:border-l-2 lg:border-transparent">
            <LogOut size={17} strokeWidth={1.3} /> Sign out
          </button>
        </nav>

        <div className="min-w-0 anim-in" key={tab}>
          {tab === "overview" && <Overview go={setTab} />}
          {tab === "orders" && <Orders />}
          {tab === "wishlist" && <Wishlist />}
          {tab === "addresses" && <Addresses />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

function PanelTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="h-display text-[34px] md:text-[42px]">{title}</h2>
      {sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "Delivered" ? "bg-[#e3ebe1] text-[#3f5d3a]" : status === "Shipped" ? "bg-[#e2e8ee] text-[#3a5068]" : "bg-[#f1e8da] text-[#7d6340]";
  return <span className={`inline-block px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${color}`}>{status}</span>;
}

function Tracker({ status }: { status: string }) {
  const at = STAGES.indexOf(status);
  return (
    <div className="grid grid-cols-4 gap-2">
      {STAGES.map((s, i) => (
        <div key={s}>
          <div className={`h-[3px] ${i <= at ? "bg-ink" : "bg-stone"}`} />
          <p className={`mt-2 text-[11px] uppercase tracking-[0.14em] ${i <= at ? "text-ink" : "text-muted/70"}`}>{s}</p>
        </div>
      ))}
    </div>
  );
}

const orderTotal = (o: Order) => o.subtotal + o.shipping;

function Overview({ go }: { go: (t: Tab) => void }) {
  const { products, getProductById } = useCatalog();
  const latest = profile.orders[0];
  const { wishlist } = useStore();
  const stats = [
    { label: "Orders placed", value: profile.orders.length, tab: "orders" as Tab },
    { label: "Saved items", value: wishlist.length, tab: "wishlist" as Tab },
    { label: "Saved addresses", value: profile.addresses.length, tab: "addresses" as Tab },
    { label: "Total spent", value: pkr(profile.orders.reduce((s, o) => s + orderTotal(o), 0)), tab: "orders" as Tab },
  ];
  const picks = products.filter((p) => p.featured && !wishlist.includes(p.id)).slice(0, 3);

  return (
    <div className="space-y-14">
      <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {stats.map((s) => (
          <button key={s.label} onClick={() => go(s.tab)} className="bg-paper p-6 text-left transition hover:bg-sand">
            <p className="font-display text-[34px] leading-none">{s.value}</p>
            <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-muted">{s.label}</p>
          </button>
        ))}
      </div>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h3 className="text-[12px] uppercase tracking-[0.24em]">Latest order</h3>
          <button onClick={() => go("orders")} className="text-[12px] uppercase tracking-[0.2em] text-muted hover:text-ink">All orders</button>
        </div>
        <div className="border border-line bg-white/50 p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[16px]">Order {latest.id}</p>
              <p className="text-[13px] text-muted">Placed {fmtDate(latest.date)} · {latest.items.length} item{latest.items.length > 1 ? "s" : ""} · {pkr(orderTotal(latest))}</p>
            </div>
            <StatusPill status={latest.status} />
          </div>
          <Tracker status={latest.status} />
          <div className="mt-8 flex gap-3">
            {latest.items.map((it) => {
              const p = getProductById(it.product_id);
              return p ? (
                <Link key={it.product_id} href={`/product/${p.slug}`} className="h-20 w-20 overflow-hidden">
                  <ProductImage product={p} finish={it.finish ?? undefined} idSuffix="ov" />
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-line p-6 md:p-8">
          <h3 className="mb-4 text-[12px] uppercase tracking-[0.24em]">Profile</h3>
          <p className="text-[15px]">{profile.user.name}</p>
          <p className="text-[14px] text-muted">{profile.user.email}</p>
          <p className="text-[14px] text-muted">{profile.user.phone}</p>
          <button onClick={() => go("settings")} className="mt-5 text-[12px] uppercase tracking-[0.2em] underline underline-offset-4">Edit</button>
        </div>
        <div className="border border-line p-6 md:p-8">
          <h3 className="mb-4 text-[12px] uppercase tracking-[0.24em]">Default address</h3>
          <AddressLines a={profile.addresses[0]} />
          <button onClick={() => go("addresses")} className="mt-5 text-[12px] uppercase tracking-[0.2em] underline underline-offset-4">Manage</button>
        </div>
      </div>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h3 className="text-[12px] uppercase tracking-[0.24em]">Picked for you</h3>
          <Link href="/shop" className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-muted hover:text-ink">Shop all <ArrowRight size={13} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3">
          {picks.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}

function Orders() {
  const { getProductById, getFinish } = useCatalog();
  const [open, setOpen] = useState<string | null>(profile.orders[0].id);
  return (
    <div>
      <PanelTitle title="Orders" sub="Track deliveries and view past purchases." />
      <div className="divide-y divide-line border-y border-line">
        {profile.orders.map((o) => {
          const isOpen = open === o.id;
          return (
            <div key={o.id}>
              <button onClick={() => setOpen(isOpen ? null : o.id)} className="grid w-full grid-cols-2 items-center gap-4 py-6 text-left md:grid-cols-[1.2fr_1fr_1fr_1fr_24px]">
                <span>
                  <span className="block text-[15px]">{o.id}</span>
                  <span className="text-[13px] text-muted">{fmtDate(o.date)}</span>
                </span>
                <span className="text-right md:text-left"><StatusPill status={o.status} /></span>
                <span className="hidden text-[14px] text-muted md:block">{o.payment}</span>
                <span className="hidden text-[15px] md:block">{pkr(orderTotal(o))}</span>
                <ChevronDown size={16} className={`hidden transition-transform md:block ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="anim-in pb-8">
                  <div className="mb-8 max-w-2xl"><Tracker status={o.status} /></div>
                  <ul className="space-y-4">
                    {o.items.map((it) => {
                      const p = getProductById(it.product_id);
                      return (
                        <li key={it.product_id} className="flex items-center gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden">{p && <ProductImage product={p} finish={it.finish ?? undefined} idSuffix={"o" + o.id} />}</div>
                          <div className="flex-1">
                            {p ? <Link href={`/product/${p.slug}`} className="text-[14px] hover:text-bronze-dark">{it.name}</Link> : <p className="text-[14px]">{it.name}</p>}
                            <p className="text-[12px] text-muted">Qty {it.qty}{it.finish && ` · ${getFinish(it.finish)?.name}`}</p>
                          </div>
                          <p className="text-[14px]">{pkr(it.price * it.qty)}</p>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-sand p-5 text-[14px]">
                    <span className="text-muted">Subtotal {pkr(o.subtotal)} · Delivery {o.shipping ? pkr(o.shipping) : "Free"}</span>
                    <span>Total {pkr(orderTotal(o))}</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="btn-line py-2.5">Download invoice</button>
                    {o.status === "Delivered" && <button className="btn-line py-2.5">Buy again</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Wishlist() {
  const { wishlist } = useStore();
  const { getProductById } = useCatalog();
  const items = wishlist.map((id) => getProductById(id)).filter((p) => p !== undefined);
  return (
    <div>
      <PanelTitle title="Wishlist" sub={`${items.length} saved item${items.length === 1 ? "" : "s"}`} />
      {items.length === 0 ? (
        <div className="border border-dashed border-line py-20 text-center">
          <p className="h-display text-3xl">Nothing saved yet.</p>
          <Link href="/shop" className="btn-dark mt-8">Explore the store</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

type Address = (typeof profile.addresses)[number];
function AddressLines({ a }: { a: Address }) {
  return (
    <div className="text-[14px] leading-relaxed text-ink-soft">
      <p className="text-ink">{a.name}</p>
      <p>{a.line1}</p>
      <p>{a.city}, {a.province}</p>
      <p className="text-muted">{a.phone}</p>
    </div>
  );
}

function Addresses() {
  return (
    <div>
      <PanelTitle title="Addresses" sub="Where we deliver your orders." />
      <div className="grid gap-5 md:grid-cols-2">
        {profile.addresses.map((a) => (
          <div key={a.id} className={`relative border p-6 md:p-8 ${a.default ? "border-ink" : "border-line"}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[12px] uppercase tracking-[0.22em]">{a.label}</p>
              {a.default && <span className="bg-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-paper">Default</span>}
            </div>
            <AddressLines a={a} />
            <div className="mt-6 flex gap-5 text-[12px] uppercase tracking-[0.18em] text-muted">
              <button className="hover:text-ink">Edit</button>
              {!a.default && <button className="hover:text-ink">Set as default</button>}
              <button className="hover:text-ink">Remove</button>
            </div>
          </div>
        ))}
        <button className="flex min-h-[220px] flex-col items-center justify-center border border-dashed border-line text-muted transition hover:border-ink hover:text-ink">
          <span className="font-display text-[40px] leading-none">+</span>
          <span className="mt-2 text-[12px] uppercase tracking-[0.2em]">Add new address</span>
        </button>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({ whatsapp: true, email: true, sms: false });
  const u = profile.user;
  return (
    <div className="space-y-14">
      <form onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
        <PanelTitle title="Account settings" sub="Update your personal details." />
        <div className="grid max-w-2xl gap-4 md:grid-cols-2">
          <Field label="Full name"><input className="field" defaultValue={u.name} /></Field>
          <Field label="Phone"><input className="field" defaultValue={u.phone} /></Field>
          <Field label="Email" wide><input className="field" type="email" defaultValue={u.email} /></Field>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button className="btn-dark">Save changes</button>
          {saved && <span className="anim-in text-[13px] text-muted">Saved</span>}
        </div>
      </form>

      <section className="max-w-2xl">
        <h3 className="mb-5 text-[12px] uppercase tracking-[0.24em]">Notifications</h3>
        <div className="divide-y divide-line border-y border-line">
          {([
            ["whatsapp", "Order updates on WhatsApp"],
            ["email", "New arrivals & offers by email"],
            ["sms", "SMS delivery alerts"],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex cursor-pointer items-center justify-between py-4 text-[14px]">
              {label}
              <button type="button" role="switch" aria-checked={prefs[k]} onClick={() => setPrefs({ ...prefs, [k]: !prefs[k] })}
                className={`relative h-6 w-11 rounded-full transition ${prefs[k] ? "bg-ink" : "bg-stone"}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-paper transition-all ${prefs[k] ? "left-6" : "left-1"}`} />
              </button>
            </label>
          ))}
        </div>
      </section>

      <section className="max-w-2xl">
        <h3 className="mb-5 text-[12px] uppercase tracking-[0.24em]">Password</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Current password"><input className="field" type="password" /></Field>
          <Field label="New password"><input className="field" type="password" /></Field>
        </div>
        <button type="button" className="btn-line mt-6">Update password</button>
      </section>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-2 block text-[12px] uppercase tracking-[0.18em] text-muted">{label}</span>
      {children}
    </label>
  );
}
