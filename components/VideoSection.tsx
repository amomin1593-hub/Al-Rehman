"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { embedUrl, type Video } from "@/lib/home";

/**
 * Silent looping video.
 * Desktop: wide video with the text over it.
 * Phone:   the whole video is shown (nothing cropped), text underneath.
 *          If a separate phone video is set (tall, e.g. 1080×1920), phones get that one instead.
 */
export default function VideoSection({ video }: { video: Video }) {
  const [isPhone, setIsPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setIsPhone(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  if (!video.url && !video.mobileUrl) return null;
  const src = isPhone ? video.mobileUrl || video.url : video.url || video.mobileUrl || "";
  const tall = Boolean(isPhone && video.mobileUrl);
  const embed = src ? embedUrl(src) : null;

  const caption = (overlay: boolean) =>
    (video.title || video.text || video.cta) && (
      <div className={overlay ? "container-x pb-14" : "container-x py-8"}>
        {video.eyebrow && <p className="text-[11px] uppercase tracking-[0.28em] text-paper/75">{video.eyebrow}</p>}
        {video.title && <h2 className={`h-display mt-3 max-w-2xl ${overlay ? "text-[52px]" : "text-[32px]"}`}>{video.title}</h2>}
        {video.text && <p className="mt-3 max-w-lg text-[15px] text-paper/80">{video.text}</p>}
        {video.cta && video.href && <Link href={video.href} className="btn-light mt-6">{video.cta}</Link>}
      </div>
    );

  const media = isPhone === null ? (
    video.poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={video.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
    ) : null
  ) : embed ? (
    <iframe
      key={src}
      src={embed}
      title={video.title || "Video"}
      allow="autoplay; encrypted-media; picture-in-picture"
      className="pointer-events-none absolute inset-0 h-full w-full border-0"
    />
  ) : (
    <video key={src} src={src} poster={video.poster ?? undefined} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
  );

  return (
    <section className="bg-ink text-paper">
      {/* phone: video then text */}
      <div className="md:hidden">
        <div className={`relative w-full overflow-hidden ${tall ? "mx-auto aspect-[9/16] max-h-[80svh]" : "aspect-video"}`}>{isPhone !== false && media}</div>
        {caption(false)}
      </div>
      {/* desktop: text over the video */}
      <div className="relative hidden aspect-video max-h-[85vh] w-full overflow-hidden md:block">
        {isPhone !== true && media}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent">{caption(true)}</div>
      </div>
    </section>
  );
}
