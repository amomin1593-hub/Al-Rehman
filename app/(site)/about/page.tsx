import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductArt from "@/components/ProductArt";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

// NOTE: placeholder copy - replace with your own story before launch.
export default function About() {
  return (
    <>
      <section className="container-x grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow mb-4">Our company</p>
          <h1 className="h-display text-[52px] md:text-[84px]">Built on quality and trust.</h1>
          <p className="mt-8 max-w-lg text-[17px] leading-relaxed text-ink-soft">
            {site.name} supplies all types of sanitary ware from Kangniwala Bypass, Gujranwala: sink bowls, kitchen faucets, Muslim showers,
            accessory sets and bathroom faucets for homes, builders and plumbers.
          </p>
        </div>
        <div className="relative aspect-square overflow-hidden">
          <ProductArt art="basin-rect" finish="#c8a46a" tone="#dcd5ca" id="about" className="h-full w-full" />
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-x grid gap-px bg-paper/10 md:grid-cols-3">
          {[
            ["Hand-picked", "Every product is chosen for its finish, durability and value."],
            ["Hand-made sizes", "Hand-made sink bowls in sizes that fit Pakistani vanities."],
            ["Always open", "Questions answered on WhatsApp, day or night."],
          ].map(([t, d]) => (
            <div key={t} className="bg-ink p-10 md:p-14">
              <h2 className="h-display text-[36px]">{t}</h2>
              <p className="mt-3 text-[15px] text-paper/65">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x flex flex-col items-center py-24 text-center">
        <Image src="/logo-dark.png" alt="" width={96} height={96} />
        <h2 className="h-display mt-8 max-w-2xl text-[40px] md:text-[56px]">Visit our showroom on Kangniwala Bypass.</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-dark">Shop online</Link>
          <Link href="/support#contact" className="btn-line">Contact us</Link>
        </div>
      </section>
    </>
  );
}
