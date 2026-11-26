"use client";
import Link from "next/link";
import { useEffect, useState, type SyntheticEvent } from "react";
import ProductArt from "./ProductArt";
import type { Slide } from "@/lib/home";

/**
 * Desktop: full-width photo at its own shape, text on the left.
 * Phone & tablet: the WHOLE photo (or the optional phone photo) at its real shape, text underneath.
 * Nothing is cropped or shifted on small screens.
 */
export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  // Real shape (width / height) of each slide's photos, measured when they load.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const measure = (key: string) => (e: SyntheticEvent<HTMLImageElement>) => {
    const im = e.currentTarget;
    if (im.naturalWidth && im.naturalHeight) {
      const r = im.naturalWidth / im.naturalHeight;
      setRatios((old) => (old[key] === r ? old : { ...old, [key]: r }));
    }
  };
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [i, slides.length]);
  const go = (d: number) => setI((v) => (v + d + slides.length) % slides.length);
  const s = slides[i] ?? slides[0];
  if (!s) return null;
  const phoneImg = (sl: Slide) => sl.imageMobile || sl.image;
  // Phone frame = shape of the current photo, so the WHOLE banner shows (default: wide banner 1902×827).
  const phoneRatio = (phoneImg(s) && ratios[`m${i}`]) || (phoneImg(s) ? 2.3 : 4 / 5);
  const deskRatio = (s.image && ratios[`d${i}`]) || 2.3;

  const art = (sl: Slide, idx: number, mobile: boolean) => (
    <ProductArt art={sl.art} finish={sl.finish} tone={sl.tone} id={`hero${mobile ? "m" : ""}${idx}`} className="h-full w-full" bare />
  );

  const dots = (
    <div className="flex items-center gap-4 lg:gap-6">
      {slides.map((sl, idx) => (
        <button key={idx} onClick={() => setI(idx)} className="flex flex-col gap-2 py-2 text-left" aria-label={`Slide ${idx + 1}: ${sl.label}`}>
          <span className="relative block h-px w-10 bg-ink/20 lg:w-24">
            <span className={`absolute inset-y-0 left-0 bg-ink ${idx === i ? "w-full transition-[width] duration-[6500ms] ease-linear" : "w-0"}`} />
          </span>
          <span className={`hidden text-[10px] uppercase tracking-[0.2em] lg:block ${idx === i ? "text-ink" : "text-ink/40"}`}>{sl.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <section aria-roledescription="carousel">
      {/* ---------- Phone ---------- */}
      <div
        className="lg:hidden"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          setTouchX(null);
        }}
      >
        <div className="relative w-full overflow-hidden transition-[aspect-ratio] duration-500" style={{ aspectRatio: String(phoneRatio), maxHeight: "80svh" }}>
          {slides.map((sl, idx) => {
            const img = phoneImg(sl);
            return (
              <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`} style={{ background: sl.tone }} aria-hidden={idx !== i}>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" onLoad={measure(`m${idx}`)} className="h-full w-full object-contain" />
                ) : (
                  art(sl, idx, true)
                )}
              </div>
            );
          })}
        </div>
        <div key={i} className="anim-in container-x bg-paper pb-6 pt-7">
          <p className="eyebrow mb-3 text-ink-soft">{s.label}</p>
          <h1 className="h-display text-[34px] leading-[1.05] sm:text-[44px]">{s.title}</h1>
          {s.text && <p className="mt-3 text-[15px] text-ink-soft">{s.text}</p>}
          <div className="mt-6 flex items-center justify-between gap-4">
            <Link href={s.href} className="btn-dark">{s.cta}</Link>
            {slides.length > 1 && dots}
          </div>
        </div>
      </div>

      {/* ---------- Tablet & desktop ---------- */}
      <div
        className="relative hidden w-full overflow-hidden lg:block"
        style={{ aspectRatio: String(deskRatio), maxHeight: "min(calc(100svh - 113px), 860px)", minHeight: 440 }}
      >
        {slides.map((sl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={{ background: sl.tone }}
            aria-hidden={idx !== i}
          >
            {sl.image ? (
              <div className={`absolute inset-0 ${idx === i ? "anim-zoom" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sl.image} alt="" onLoad={measure(`d${idx}`)} className="h-full w-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-r from-paper/85 via-paper/35 to-transparent" />
              </div>
            ) : (
              <div className={`absolute inset-y-0 right-0 w-[62%] ${idx === i ? "anim-zoom" : ""}`}>{art(sl, idx, false)}</div>
            )}
            <div className="container-x relative flex h-full items-center">
              {idx === i && (
                <div key={i} className="anim-in max-w-xl">
                  <p className="eyebrow mb-5 text-ink-soft">{sl.label}</p>
                  <h1 className="h-display text-[56px] xl:text-[80px]">{sl.title}</h1>
                  {sl.text && <p className="mt-5 max-w-md text-[16px] text-ink-soft">{sl.text}</p>}
                  <Link href={sl.href} className="btn-dark mt-8">{sl.cta}</Link>
                </div>
              )}
            </div>
          </div>
        ))}
        {slides.length > 1 && <div className="container-x absolute inset-x-0 bottom-6">{dots}</div>}
      </div>
    </section>
  );
}
