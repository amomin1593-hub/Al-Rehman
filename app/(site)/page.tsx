import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import ProductArt from "@/components/ProductArt";
import { SectionHead, SupportLinks, Newsletter } from "@/components/Blocks";
import { catalogHelpers } from "@/lib/catalog";
import { getCatalog, getHome } from "@/lib/server/db";

export default async function Home() {
  const [catalog, homeContent] = await Promise.all([getCatalog(), getHome()]);
  const { categories, collections, featured, heroOfCategory, heroOfCollection } = catalogHelpers(catalog);
  const essentials = featured().slice(0, 8);


  return (
    <>
      <HeroCarousel slides={homeContent.slides} />

      {/* Two large entry tiles */}
      <section className="container-x grid gap-5 py-20 md:grid-cols-2 md:py-28">
        {homeContent.tiles.map((t, i) => (
          <Link key={t.title} href={t.href} className="group relative block aspect-[4/5] overflow-hidden md:aspect-[5/6]">
            <div className="h-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]">
              {t.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.image} alt={t.title} className="h-full w-full object-cover" />
              ) : (
                <ProductArt art={t.art} finish={t.finish} tone={t.tone} id={`tile${i}`} className="h-full w-full" />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-8 pt-24 text-paper md:p-12 md:pt-32">
              <p className="text-[11px] uppercase tracking-[0.28em] text-paper/80">{t.eyebrow}</p>
              <h2 className="h-display mt-2 text-[48px] md:text-[64px]">{t.title}</h2>
              <p className="mt-2 max-w-sm text-[15px] text-paper/85">{t.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em]">
                Discover <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Choose your collection */}
      <section className="border-y border-line bg-white/40 py-20 md:py-24">
        <div className="container-x">
          <SectionHead eyebrow="Seven design families" title="Choose your collection" href="/collections" linkText="All collections" />
          <div className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible md:px-0">
            {collections.map((c) => {
              const p = heroOfCollection(c.slug);
              if (!p) return null;
              return (
                <Link key={c.slug} href={`/collections/${c.slug}`} className="group w-40 shrink-0 snap-start text-center md:w-auto">
                  <div className="mx-auto aspect-square overflow-hidden bg-white">
                    <div className="h-full transition-transform duration-700 group-hover:scale-105">
                      <ProductImage product={p} idSuffix="col" />
                    </div>
                  </div>
                  <p className="mt-4 font-display text-[24px]">{c.name}</p>
                  <p className="text-[12px] text-muted">{c.line}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Essentials */}
      <section className="container-x py-20 md:py-28">
        <SectionHead eyebrow="Best sellers" title="The essentials" href="/shop" />
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {essentials.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-14 text-center md:hidden">
          <Link href="/shop" className="btn-line">Show more</Link>
        </div>
      </section>

      {/* Brand statement */}
      <section className="bg-ink text-paper">
        <div className="container-x grid items-center gap-14 py-24 md:grid-cols-2 md:py-32">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-full border border-paper/10" />
            <div className="absolute inset-10 rounded-full border border-paper/10" />
            <Image src="/logo-light.png" alt="Al-Rehman Traders logo" fill loading="eager" sizes="400px" className="object-contain p-24 opacity-90" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-paper/60">Quality & Trust</p>
            <h2 className="h-display mt-4 text-[44px] md:text-[64px]">
              Quality you can feel, <em className="text-bronze">service</em> you can trust.
            </h2>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-paper/70">
              From a single basin tap to a complete bathroom, Al-Rehman Traders supplies homes, builders and plumbers with sanitary ware that is
              chosen for finish, durability and fair price. Visit us on Kangniwala Bypass, Gujranwala, or order online with delivery to your door.
            </p>
            <Link href="/about" className="btn-light mt-10">Our story</Link>
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="container-x py-20 md:py-28">
        <SectionHead eyebrow="Shop by category" title="Everything for the bath & kitchen" />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {categories.map((c) => {
            const hero = heroOfCategory(c.slug);
            return (
            <Link key={c.slug} href={`/shop/${c.slug}`} className="group">
              <div className="aspect-square overflow-hidden bg-white">
                <div className="h-full transition-transform duration-700 group-hover:scale-105">
                  {hero ? <ProductImage product={hero} idSuffix="cat" /> : <div className="h-full bg-sand" />}
                </div>
              </div>
              <p className="mt-4 text-[12px] uppercase tracking-[0.2em]">{c.name}</p>
              <p className="text-[13px] text-muted">{c.tagline}</p>
            </Link>
            );
          })}
        </div>
      </section>

      <section className="container-x pb-20 md:pb-28">
        <SupportLinks />
      </section>

      <Newsletter />
    </>
  );
}
