"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductArt from "./ProductArt";
import type { Slide } from "@/lib/home";

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [i]);

  return (
    <section className="relative h-[calc(100svh-113px)] min-h-[560px] max-h-[860px] overflow-hidden" aria-roledescription="carousel">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
          style={{ background: s.tone }}
          aria-hidden={idx !== i}
        >
          {s.image ? (
            <div className={`absolute inset-0 ${idx === i ? "anim-zoom" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt="" className="h-full w-full object-cover object-[78%_50%]" />
              <div className="absolute inset-0 bg-gradient-to-r from-paper/85 via-paper/40 to-transparent" />
            </div>
          ) : (
            <div className={`absolute right-0 top-0 h-[64%] w-full md:inset-y-0 md:h-full md:w-[62%] ${idx === i ? "anim-zoom" : ""}`}>
              <ProductArt art={s.art} finish={s.finish} tone={s.tone} id={`hero${idx}`} className="h-full w-full" bare />
            </div>
          )}
          <div className="container-x relative flex h-full items-end pb-24 md:items-center md:pb-0">
            {idx === i && (
              <div key={i} className="anim-in max-w-xl bg-paper/70 p-6 backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-none">
                <p className="eyebrow mb-5 text-ink-soft">{s.label}</p>
                <h1 className="h-display text-[44px] md:text-[76px] lg:text-[88px]">{s.title}</h1>
                <p className="mt-5 max-w-md text-[16px] text-ink-soft">{s.text}</p>
                <Link href={s.href} className="btn-dark mt-8">{s.cta}</Link>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="container-x absolute inset-x-0 bottom-8 flex items-center gap-6">
        {slides.map((s, idx) => (
          <button key={idx} onClick={() => setI(idx)} className="group flex flex-col gap-2 text-left" aria-label={`Slide ${idx + 1}: ${s.label}`}>
            <span className="relative block h-px w-12 bg-ink/20 md:w-24">
              <span className={`absolute inset-y-0 left-0 bg-ink ${idx === i ? "w-full transition-[width] duration-[6500ms] ease-linear" : "w-0"}`} />
            </span>
            <span className={`hidden text-[10px] uppercase tracking-[0.2em] md:block ${idx === i ? "text-ink" : "text-ink/40"}`}>{s.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
