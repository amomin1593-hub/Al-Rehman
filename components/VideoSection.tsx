import Link from "next/link";
import { embedUrl, type Video } from "@/lib/home";

/** Full-width silent looping video with a short caption. Hidden when no video is set. */
export default function VideoSection({ video }: { video: Video }) {
  if (!video.url) return null;
  const embed = embedUrl(video.url);
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="relative aspect-[4/5] w-full sm:aspect-video md:max-h-[85vh]">
        {embed ? (
          <iframe
            src={embed}
            title={video.title || "Video"}
            allow="autoplay; encrypted-media; picture-in-picture"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 border-0 sm:h-full sm:w-full"
          />
        ) : (
          <video
            src={video.url}
            poster={video.poster ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {(video.title || video.text) && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/10 to-transparent">
            <div className="container-x pb-10 md:pb-16">
              {video.eyebrow && <p className="text-[11px] uppercase tracking-[0.28em] text-paper/75">{video.eyebrow}</p>}
              {video.title && <h2 className="h-display mt-3 max-w-2xl text-[36px] md:text-[56px]">{video.title}</h2>}
              {video.text && <p className="mt-3 max-w-lg text-[15px] text-paper/80">{video.text}</p>}
              {video.cta && video.href && (
                <Link href={video.href} className="btn-light mt-7">{video.cta}</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
