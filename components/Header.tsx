"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useStore } from "./StoreProvider";
import { useCatalog } from "./CatalogProvider";
import { pkr, site } from "@/lib/site";
import ProductImage from "./ProductImage";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <Image src={light ? "/logo-light.png" : "/logo-dark.png"} alt="" width={40} height={40} priority className="h-9 w-9 md:h-10 md:w-10" />
      <span className="leading-none">
        <span className="block font-display text-[22px] font-medium tracking-[0.04em] md:text-[24px]">Al-Rehman</span>
        <span className="mt-0.5 block text-[9px] uppercase tracking-[0.42em] opacity-70">Traders · Sanitary</span>
      </span>
    </span>
  );
}

export default function Header({ announcement }: { announcement: string }) {
  const { categories, collections, products, heroOfCategory } = useCatalog();
  const { count, subtotal, setDrawer } = useStore();
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const path = usePathname();

  useEffect(() => {
    setMega(false);
    setMobile(false);
    setSearch(false);
  }, [path]);

  const results =
    q.trim().length > 1
      ? products.filter((p) => (p.name + " " + p.category + " " + p.sku).toLowerCase().includes(q.toLowerCase())).slice(0, 6)
      : [];

  return (
    <>
      <div className="bg-ink text-paper/80">
        <div className="container-x flex h-9 items-center justify-between text-[11px] tracking-[0.14em] uppercase">
          <span className="truncate">{announcement}</span>
          <span className="hidden gap-2 md:flex">
            Call / WhatsApp
            {site.phones.map((p, i) => (
              <a key={p.raw} href={`tel:+${p.raw}`} className="hover:text-paper">{i > 0 && "· "}{p.label}</a>
            ))}
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur" onMouseLeave={() => setMega(false)}>
        <div className="container-x flex h-[76px] items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" aria-label="Open menu" onClick={() => setMobile(true)}>
              <Menu size={22} strokeWidth={1.4} />
            </button>
            <Link href="/" aria-label={`${site.name} home`}>
              <Logo />
            </Link>
          </div>

          <nav className="hidden items-center gap-10 text-[12px] uppercase tracking-[0.2em] lg:flex">
            <button className={`flex items-center gap-1.5 py-7 uppercase tracking-[0.2em] ${mega ? "text-bronze" : ""}`} onMouseEnter={() => setMega(true)} onClick={() => setMega((v) => !v)}>
              Collections <ChevronDown size={13} className={`transition-transform ${mega ? "rotate-180" : ""}`} />
            </button>
            <Link href="/shop" className="link-u" onMouseEnter={() => setMega(false)}>Shop all</Link>
            <Link href="/support" className="link-u" onMouseEnter={() => setMega(false)}>Support</Link>
            <Link href="/about" className="link-u" onMouseEnter={() => setMega(false)}>About</Link>
          </nav>

          <div className="flex items-center gap-5 md:gap-6">
            <button aria-label="Search" onClick={() => setSearch(true)}>
              <Search size={19} strokeWidth={1.4} />
            </button>
            <Link href="/account" aria-label="My account" className="hidden sm:block">
              <User size={19} strokeWidth={1.4} />
            </Link>
            <button onClick={() => setDrawer(true)} className="flex items-center gap-2.5" aria-label="Open cart">
              <ShoppingBag size={19} strokeWidth={1.4} />
              <span className="hidden text-[13px] tracking-wide md:inline">
                {pkr(subtotal)} ({count})
              </span>
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] text-paper md:hidden">{count}</span>
            </button>
            <span className="hidden border-l border-line pl-5 text-[11px] uppercase tracking-[0.2em] text-muted xl:block">Pakistan · PKR</span>
          </div>
        </div>

        {/* Mega menu */}
        <div className={`absolute inset-x-0 top-full border-b border-line bg-paper transition-all duration-300 ${mega ? "visible opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
          <div className="container-x grid grid-cols-12 gap-10 py-10">
            <div className="col-span-3">
              <p className="eyebrow mb-5">Categories</p>
              <ul className="space-y-3 font-display text-[22px]">
                {categories.map((c) => (
                  <li key={c.slug}><Link className="link-u" href={`/shop/${c.slug}`}>{c.name}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-span-3">
              <p className="eyebrow mb-5">Collections</p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] tracking-wide">
                {collections.map((c) => (
                  <li key={c.slug}><Link className="link-u" href={`/collections/${c.slug}`}>{c.name}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-span-6 grid grid-cols-3 gap-4">
              {categories.slice(0, 3).map((c) => {
                const p = heroOfCategory(c.slug);
                if (!p) return null;
                return (
                  <Link key={c.slug} href={`/shop/${c.slug}`} className="group">
                    <div className="aspect-square overflow-hidden bg-white">
                      <div className="h-full transition-transform duration-700 group-hover:scale-105">
                        <ProductImage product={p} idSuffix="mega" />
                      </div>
                    </div>
                    <p className="mt-3 text-[12px] uppercase tracking-[0.2em]">{c.name}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobile ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-ink/40 transition-opacity ${mobile ? "opacity-100" : "opacity-0"}`} onClick={() => setMobile(false)} />
        <aside className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper transition-transform duration-300 ${mobile ? "" : "-translate-x-full"}`}>
          <div className="flex h-[76px] items-center justify-between border-b border-line px-5">
            <Logo />
            <button onClick={() => setMobile(false)} aria-label="Close menu"><X size={22} strokeWidth={1.4} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-8">
            <p className="eyebrow mb-4">Categories</p>
            <ul className="mb-10 space-y-3 font-display text-[26px]">
              {categories.map((c) => (
                <li key={c.slug}><Link href={`/shop/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
            <p className="eyebrow mb-4">Collections</p>
            <ul className="mb-10 grid grid-cols-2 gap-3 text-[15px]">
              {collections.map((c) => (
                <li key={c.slug}><Link href={`/collections/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
            <ul className="space-y-4 text-[12px] uppercase tracking-[0.2em]">
              <li><Link href="/shop">Shop all</Link></li>
              <li><Link href="/account">My account</Link></li>
              <li><Link href="/support">Support</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Search overlay */}
      <div className={`fixed inset-0 z-50 bg-paper transition-opacity duration-300 ${search ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="container-x pt-8">
          <div className="flex justify-end">
            <button onClick={() => setSearch(false)} aria-label="Close search"><X size={26} strokeWidth={1.2} /></button>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <p className="eyebrow mb-4">Search the store</p>
            <input
              autoFocus={search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Basin mixer, Muslim shower, sink bowl…"
              className="w-full border-b border-ink bg-transparent pb-4 font-display text-4xl outline-none placeholder:text-muted/50 md:text-5xl"
            />
            <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3">
              {results.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="group">
                  <div className="aspect-square overflow-hidden bg-white"><ProductImage product={p} idSuffix="s" /></div>
                  <p className="mt-2 text-[14px]">{p.name}</p>
                  <p className="text-[13px] text-muted">{pkr(p.price)}</p>
                </Link>
              ))}
            </div>
            {q.length > 1 && results.length === 0 && <p className="text-muted">No products match “{q}”.</p>}
            {q.length <= 1 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c.slug} href={`/shop/${c.slug}`} className="border border-line px-4 py-2 text-[13px] hover:border-ink">{c.name}</Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
