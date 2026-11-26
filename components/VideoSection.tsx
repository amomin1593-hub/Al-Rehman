"use client";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { embedUrl, SHAPE_RATIO, type Video } from "@/lib/home";

/**
 * Silent looping video, always shown WHOLE: never cropped, never covered by text.
 * The frame takes the real shape of the video (measured for uploaded files,
 * or the "Video shape" chosen in admin for YouTube / Vimeo links) and is
 * limited by the screen height so it fits on laptops and phones.
 *  - Desktop: text on the left, video on the right.
 *  - Phone:   video full width, text underneath.
 * If a separate phone video is set, phones get that one instead.
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

  const usingPhoneVideo = Boolean(isPhone && video.mobileUrl);
  const src = isPhone ? video.mobileUrl || video.url : video.url || video.mobileUrl || "";
  const embed = src ? embedUrl(src) : null;

  // Shape: admin choice wins for the main video; otherwise guess (Shorts = tall) until the file tells us.
  const chosen = !usingPhoneVideo && video.shape && video.shape !== "auto" ? SHAPE_RATIO[video.shape] : null;
  const guess = chosen ?? (/shorts\//.test(src) || usingPhoneVideo ? 9 / 16 : 16 / 9);
  const [measured, setMeasured] = useState<number | null>(null);
  useEffect(() => setMeasured(null), [src]);
  const ratio = chosen ?? measured ?? guess;

  if (!video.url && !video.mobileUrl) return null;

  const wide = ratio >= 1.3;
  const hasCaption = Boolean(video.eyebrow || video.title || video.text || video.cta);

  const caption = hasCaption && (
    <div className="px-6 py-8 md:px-0 md:py-0">
      {video.eyebrow && <p className="text-[11px] uppercase tracking-[0.28em] text-paper/75">{video.eyebrow}</p>}
      {video.title && <h2 className="h-display mt-3 max-w-xl text-[30px] md:text-[40px] lg:text-[48px]">{video.title}</h2>}
      {video.text && <p className="mt-3 max-w-md text-[15px] text-paper/80">{video.text}</p>}
      {video.cta && video.href && (
        <Link href={video.href} className="btn-light mt-6">
          {video.cta}
        </Link>
      )}
    </div>
  );

  const media =
    isPhone === null ? (
      video.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={video.poster} alt="" className="absolute inset-0 h-full w-full object-contain" />
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
      <video
        key={src}
        src={src}
        poster={video.poster ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (v.videoWidth && v.videoHeight) setMeasured(v.videoWidth / v.videoHeight);
        }}
        className="absolute inset-0 h-full w-full object-contain"
      />
    );

  // Frame with the video's own shape; never wider than its column, never taller than maxH.
  const frame = (maxH: string): CSSProperties => ({
    aspectRatio: String(ratio),
    width: `min(100%, calc(${maxH} * ${ratio}))`,
  });

  return (
    <section className="bg-ink text-paper">
      {/* phone: whole video full width, text underneath */}
      <div className="md:hidden">
        <div className="relative mx-auto overflow-hidden bg-black" style={frame("75svh")}>
          {isPhone !== false && media}
        </div>
        {caption}
      </div>

      {/* tablet & desktop: text left, whole video right */}
      <div className="hidden md:block">
        <div
          className={`container-x grid items-center gap-10 py-14 lg:gap-14 lg:py-20 ${
            hasCaption ? (wide ? "md:grid-cols-[1fr_2fr]" : "md:grid-cols-2") : ""
          }`}
        >
          {caption}
          <div className="relative mx-auto overflow-hidden rounded-sm bg-black" style={frame("72vh")}>
            {isPhone !== true && media}
          </div>
        </div>
      </div>
    </section>
  );
}
