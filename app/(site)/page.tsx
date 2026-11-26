import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import ProductArt from "@/components/ProductArt";
import { SectionHead, SupportLinks, Newsletter } from "@/components/Blocks";
import { catalogHelpers, photoScore } from "@/lib/catalog";
import { storyOf, videoOf } from "@/lib/home";
import VideoSection from "@/components/VideoSection";
import { getCatalog, getHome } from "@/lib/server/db";
import { pkr } from "@/lib/site";

export default async function Home() {
  const [catalog, homeContent] = await Promise.all([getCatalog(), getHome()]);
  const { categories, collections, featured, heroOfCategory, heroOfCollection } = catalogHelpers(catalog);
  // --- fill the home page with products, real uploaded photos first ---
  type P = (typeof catalog.products)[number];
  const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const ranked = [...catalog.products].sort((a, b) => photoScore(b) - photoScore(a) || b.id - a.id);
  const withPhoto = ranked.filter((p) => photoScore(p) > 0);
  const used = new Set<number>();
  const take = (list: P[], n: number) => { const out = list.filter((p) => !used.has(p.id)).slice(0, n); out.forEach((p) => used.add(p.id)); return out; };
  // Best sellers: starred products first, topped up with your newest photographed items
  const essentials = take([...featured().sort((a, b) => photoScore(b) - photoScore(a)), ...withPhoto], 8);
  // New arrivals: the most recently added products
  const newArrivals = take([...withPhoto].sort((a, b) => b.id - a.id), 8);
  // More to explore: a different random mix on every visit
  const explore = take(shuffle(withPhoto), 12);
  // dark "Quality & Trust" section: 4 photographed products (may repeat ones above)
  const spot = shuffle(withPhoto.filter((p) => photoScore(p) === 2).length >= 4 ? withPhoto.filter((p) => photoScore(p) === 2) : withPhoto).slice(0, 4);
  const story = storyOf(homeContent);
  const video = videoOf(homeContent);


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

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="border-t border-line bg-white/40 py-20 md:py-28">
          <div className="container-x">
            <SectionHead eyebrow="Just in" title="New arrivals" href="/shop" linkText="Shop all" />
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Brand statement + featured products */}
      {spot.length > 0 && (
        <section className="bg-ink text-paper">
          <div className="container-x grid items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20">
            <div className={`grid gap-3 ${spot.length > 1 ? "grid-cols-2" : "mx-auto w-full max-w-md grid-cols-1"}`}>
              {spot.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                  <div className="aspect-square overflow-hidden bg-white">
                    <div className="h-full transition-transform duration-700 group-hover:scale-[1.04]">
                      <ProductImage product={p} idSuffix="spot" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-3 text-[12px] md:text-[13px]">
                    <span className="truncate text-paper/85 group-hover:text-paper">{p.name}</span>
                    <span className="shrink-0 text-paper/55">{pkr(p.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div>
              {story.eyebrow && <p className="text-[11px] uppercase tracking-[0.28em] text-paper/60">{story.eyebrow}</p>}
              <h2 className="h-display mt-4 text-[36px] md:text-[50px]">
                {story.title.split(/(\*[^*]+\*)/).map((part, i) =>
                  part.startsWith("*") && part.endsWith("*") ? <em key={i} className="text-bronze">{part.slice(1, -1)}</em> : part
                )}
              </h2>
              {story.text && <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/70">{story.text}</p>}
              {story.cta && <Link href={story.href || "/shop"} className="btn-light mt-8">{story.cta}</Link>}
            </div>
          </div>
        </section>
      )}

      <VideoSection video={video} />

      {/* More to explore: random mix */}
      {explore.length > 0 && (
        <section className="container-x py-20 md:py-28">
          <SectionHead eyebrow="Discover" title="More to explore" href="/shop" linkText={`All ${catalog.products.length} products`} />
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {explore.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-14 text-center">
            <Link href="/shop" className="btn-line">Shop all {catalog.products.length} products</Link>
          </div>
        </section>
      )}

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
