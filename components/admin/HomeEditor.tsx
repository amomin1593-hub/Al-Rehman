"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, ExternalLink, Upload } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import { api, Card, Field, ImageField, inputCls, PageTitle, Status, uploadBigFile, useStatus } from "./ui";
import { embedUrl, storyOf, videoOf, type HomeContent, type Slide, type Story, type Tile, type Video, type VideoShape } from "@/lib/home";

const blankSlide: Slide = {
  label: "New collection",
  title: "Your headline here.",
  text: "A short line about this slide.",
  cta: "Shop now",
  href: "/shop",
  image: null,
  art: "faucet-basin",
  finish: "#c9ccd0",
  tone: "#dcd6cc",
};

export default function HomeEditor({ initial }: { initial: HomeContent }) {
  const router = useRouter();
  const [h, setH] = useState<HomeContent>(initial);
  const { state, run, busy } = useStatus();
  const [dirty, setDirty] = useState(false);

  const update = (next: HomeContent) => {
    setH(next);
    setDirty(true);
  };
  const setSlide = (i: number, patch: Partial<Slide>) => update({ ...h, slides: h.slides.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const story = storyOf(h);
  const video = videoOf(h);
  const setStory = (patch: Partial<Story>) => update({ ...h, story: { ...story, ...patch } });
  const setVideo = (patch: Partial<Video>) => update({ ...h, video: { ...video, ...patch } });
  const setTile = (i: number, patch: Partial<Tile>) => update({ ...h, tiles: h.tiles.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  const move = (i: number, d: -1 | 1) => {
    const s = [...h.slides];
    const j = i + d;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]];
    update({ ...h, slides: s });
  };

  const save = () =>
    run(async () => {
      await api("/api/admin/home", "PUT", h);
      setDirty(false);
      router.refresh();
    });

  return (
    <>
      <PageTitle
        title="Home page"
        sub="Banner slides, the two big tiles and the top announcement bar."
        action={
          <a href="/" target="_blank" className="flex items-center gap-2 text-[13px] text-muted hover:text-ink">
            View home page <ExternalLink size={14} />
          </a>
        }
      />

      <div className="space-y-6 pb-28">
        <Card title="Announcement bar">
          <input className={inputCls} value={h.announcement} onChange={(e) => update({ ...h, announcement: e.target.value })} />
        </Card>

        <Card
          title={`Banner slides (${h.slides.length})`}
          action={
            <button type="button" onClick={() => update({ ...h, slides: [...h.slides, { ...blankSlide }] })} className="flex items-center gap-1 text-[12px] text-muted hover:text-ink">
              <Plus size={13} /> Add slide
            </button>
          }
        >
          <div className="space-y-6">
            {h.slides.map((s, i) => (
              <div key={i} className="grid gap-5 border-b border-line pb-6 last:border-0 last:pb-0 md:grid-cols-[300px_1fr]">
                <div>
                  <ImageField
                    folder="home"
                    aspect="aspect-video"
                    value={s.image}
                    onChange={(url) => setSlide(i, { image: url })}
                    fallback={<ProductArt art={s.art} finish={s.finish} tone={s.tone} id={`he${i}`} className="h-full w-full" />}
                  />
                  <p className="mt-2 text-[12px] text-muted">Wide photo, at least 1920×1080. Text sits on the left.</p>
                  <div className="mt-4 flex items-start gap-3">
                    <div className="w-24 shrink-0">
                      <ImageField folder="home" aspect="aspect-[4/5]" value={s.imageMobile ?? null} onChange={(url) => setSlide(i, { imageMobile: url })} />
                    </div>
                    <p className="text-[12px] leading-relaxed text-muted">
                      <b className="font-normal text-ink">Phone photo (optional).</b> Tall photo for phones, e.g. 1080×1350. Without it, phones show the whole wide photo with the text underneath.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between md:col-span-2">
                    <span className="text-[12px] uppercase tracking-[0.18em]">Slide {i + 1}</span>
                    <span className="flex gap-1">
                      <IconBtn onClick={() => move(i, -1)} label="Move up" disabled={i === 0}><ArrowUp size={14} /></IconBtn>
                      <IconBtn onClick={() => move(i, 1)} label="Move down" disabled={i === h.slides.length - 1}><ArrowDown size={14} /></IconBtn>
                      <IconBtn
                        onClick={() => h.slides.length > 1 && confirm("Remove this slide?") && update({ ...h, slides: h.slides.filter((_, j) => j !== i) })}
                        label="Remove slide"
                        disabled={h.slides.length === 1}
                        danger
                      >
                        <Trash2 size={14} />
                      </IconBtn>
                    </span>
                  </div>
                  <Field label="Small label"><input className={inputCls} value={s.label} onChange={(e) => setSlide(i, { label: e.target.value })} /></Field>
                  <Field label="Button text"><input className={inputCls} value={s.cta} onChange={(e) => setSlide(i, { cta: e.target.value })} /></Field>
                  <Field label="Headline" wide><input className={inputCls} value={s.title} onChange={(e) => setSlide(i, { title: e.target.value })} /></Field>
                  <Field label="Text" wide><input className={inputCls} value={s.text} onChange={(e) => setSlide(i, { text: e.target.value })} /></Field>
                  <Field label="Button link" hint="e.g. /shop/kitchen-faucets or /collections/safa" wide>
                    <input className={inputCls} value={s.href} onChange={(e) => setSlide(i, { href: e.target.value })} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quality & Trust section (dark)">
          <p className="mb-4 text-[13px] text-muted">Shows up to 4 of your featured products (tick ★ in Products & stock) next to this text. Wrap a word in *stars* to show it in gold italics.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Small label"><input className={inputCls} value={story.eyebrow} onChange={(e) => setStory({ eyebrow: e.target.value })} /></Field>
            <Field label="Button text"><input className={inputCls} value={story.cta} onChange={(e) => setStory({ cta: e.target.value })} /></Field>
            <Field label="Headline" wide><input className={inputCls} value={story.title} onChange={(e) => setStory({ title: e.target.value })} /></Field>
            <Field label="Text (keep it short)" wide><input className={inputCls} value={story.text} onChange={(e) => setStory({ text: e.target.value })} /></Field>
            <Field label="Button link" wide><input className={inputCls} value={story.href} onChange={(e) => setStory({ href: e.target.value })} /></Field>
          </div>
        </Card>

        <Card title="Video section">
          <VideoEditor video={video} setVideo={setVideo} />
        </Card>

        <Card title="Big tiles (under the banner)">
          <div className="grid gap-8 md:grid-cols-2">
            {h.tiles.map((t, i) => (
              <div key={i} className="space-y-3">
                <ImageField
                  folder="home"
                  aspect="aspect-[5/6]"
                  value={t.image}
                  onChange={(url) => setTile(i, { image: url })}
                  fallback={<ProductArt art={t.art} finish={t.finish} tone={t.tone} id={`ht${i}`} className="h-full w-full" />}
                />
                <Field label="Small label"><input className={inputCls} value={t.eyebrow} onChange={(e) => setTile(i, { eyebrow: e.target.value })} /></Field>
                <Field label="Title"><input className={inputCls} value={t.title} onChange={(e) => setTile(i, { title: e.target.value })} /></Field>
                <Field label="Text"><input className={inputCls} value={t.text} onChange={(e) => setTile(i, { text: e.target.value })} /></Field>
                <Field label="Link"><input className={inputCls} value={t.href} onChange={(e) => setTile(i, { href: e.target.value })} /></Field>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-5 py-4 md:px-10">
          <Status state={state} />
          {dirty && state.kind !== "busy" && <span className="text-[13px] text-muted">Unsaved changes</span>}
          <button onClick={save} disabled={busy || !dirty} className="btn-dark py-3">Save home page</button>
        </div>
      </div>
    </>
  );
}

function IconBtn({ children, onClick, label, disabled, danger }: { children: React.ReactNode; onClick: () => void; label: string; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
      className={`grid h-8 w-8 place-items-center border border-line disabled:opacity-30 ${danger ? "text-sale" : ""} hover:bg-sand`}>
      {children}
    </button>
  );
}

function VideoEditor({ video, setVideo }: { video: Video; setVideo: (p: Partial<Video>) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const mobileInput = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const embed = video.url ? embedUrl(video.url) : null;

  const upload = async (file: File, field: "url" | "mobileUrl" = "url") => {
    setErr("");
    setPct(0);
    try {
      setVideo({ [field]: await uploadBigFile(file, "home", setPct) });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setPct(null);
    }
  };

  return (
    <div className="grid gap-5 md:grid-cols-[320px_1fr]">
      <div>
        <div className="relative aspect-video w-full overflow-hidden border border-dashed border-line bg-sand">
          {video.url ? (
            embed ? (
              <iframe src={embed} title="Video preview" className="h-full w-full border-0" allow="autoplay; encrypted-media" />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={video.url} poster={video.poster ?? undefined} muted loop autoPlay playsInline className="h-full w-full bg-black object-contain" />
            )
          ) : (
            <div className="grid h-full place-items-center px-4 text-center text-[13px] text-muted">No video. The section is hidden on the site.</div>
          )}
          {pct !== null && (
            <div className="absolute inset-0 grid place-items-center bg-paper/80 text-[13px]">
              <div className="w-3/4">
                <div className="h-1.5 bg-stone"><div className="h-full bg-ink transition-all" style={{ width: `${pct}%` }} /></div>
                <p className="mt-2 text-center">Uploading video… {pct}%</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" disabled={pct !== null} onClick={() => input.current?.click()} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-[12px] hover:border-ink disabled:opacity-50">
            <Upload size={14} /> {video.url ? "Replace video" : "Upload video"}
          </button>
          {video.url && (
            <button type="button" onClick={() => setVideo({ url: "" })} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-[12px] text-sale hover:border-sale">
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
        {err && <p className="mt-1 text-[12px] text-sale">{err}</p>}
        <p className="mt-2 text-[12px] leading-relaxed text-muted">MP4 up to 50 MB, landscape, 10–30 seconds works best. It plays silently on a loop. Or paste a YouTube link instead.</p>
        <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload(f); }} />
      </div>
      <div className="grid content-start gap-3 md:grid-cols-2">
        <Field label="…or paste a YouTube / Vimeo / video link" wide>
          <input className={inputCls} placeholder="https://www.youtube.com/watch?v=..." value={video.url} onChange={(e) => setVideo({ url: e.target.value.trim() })} />
        </Field>
        <Field label="Video shape" wide>
          <select className={inputCls} value={video.shape ?? "auto"} onChange={(e) => setVideo({ shape: e.target.value as VideoShape })}>
            <option value="auto">Automatic (uploaded files are measured; YouTube = wide, Shorts = tall)</option>
            <option value="wide">Wide 16:9 (landscape)</option>
            <option value="square">Square 1:1</option>
            <option value="portrait">Portrait 4:5</option>
            <option value="tall">Tall 9:16 (filmed upright on a phone)</option>
          </select>
          <span className="mt-1 block text-[11px] text-muted">If the video looks small or has black bars on the site, pick the shape it was filmed in.</span>
        </Field>
        <div className="border border-line bg-paper/60 p-3 md:col-span-2">
          <p className="text-[12px] leading-relaxed text-muted">
            <b className="font-normal text-ink">Phone video (optional).</b> A tall video (9:16, e.g. 1080×1920) just for phones. Without it, phones show the whole wide video with the text underneath.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" disabled={pct !== null} onClick={() => mobileInput.current?.click()} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-[12px] hover:border-ink disabled:opacity-50">
              <Upload size={14} /> {video.mobileUrl ? "Replace phone video" : "Upload phone video"}
            </button>
            {video.mobileUrl && (
              <button type="button" onClick={() => setVideo({ mobileUrl: "" })} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-[12px] text-sale hover:border-sale">
                <Trash2 size={14} /> Remove
              </button>
            )}
            <input className={`${inputCls} min-w-[220px] flex-1`} placeholder="…or paste a link (YouTube Shorts works)" value={video.mobileUrl ?? ""} onChange={(e) => setVideo({ mobileUrl: e.target.value.trim() })} />
          </div>
          <input ref={mobileInput} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload(f, "mobileUrl"); }} />
        </div>
        <Field label="Small label"><input className={inputCls} value={video.eyebrow} onChange={(e) => setVideo({ eyebrow: e.target.value })} /></Field>
        <Field label="Button text"><input className={inputCls} value={video.cta} onChange={(e) => setVideo({ cta: e.target.value })} /></Field>
        <Field label="Headline (leave empty for no text)" wide><input className={inputCls} value={video.title} onChange={(e) => setVideo({ title: e.target.value })} /></Field>
        <Field label="Text" wide><input className={inputCls} value={video.text} onChange={(e) => setVideo({ text: e.target.value })} /></Field>
        <Field label="Button link" wide><input className={inputCls} value={video.href} onChange={(e) => setVideo({ href: e.target.value })} /></Field>
        <div className="md:col-span-2">
          <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted">Cover image (shown while the video loads)</span>
          <div className="max-w-[240px]"><ImageField folder="home" aspect="aspect-video" value={video.poster} onChange={(url) => setVideo({ poster: url })} /></div>
        </div>
      </div>
    </div>
  );
}
