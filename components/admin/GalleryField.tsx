"use client";
// Product photo gallery editor: several photos, each optionally linked to a finish (colour).
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { uploadPhoto } from "./ui";
import type { Finish, ProductPhoto } from "@/lib/catalog";

export default function GalleryField({
  value,
  onChange,
  finishes,
  fallback,
}: {
  value: ProductPhoto[];
  onChange: (v: ProductPhoto[]) => void;
  finishes: Finish[]; // finishes this product comes in
  fallback?: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const addFiles = async (files: File[]) => {
    setErr("");
    const next = [...value];
    for (let i = 0; i < files.length; i++) {
      setBusy(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const url = await uploadPhoto(files[i], "products");
        // guess the finish from the file name, e.g. "tap-matte-black.jpg"
        const name = files[i].name.toLowerCase().replace(/[_\s]+/g, "-");
        const guess = finishes.find((f) => name.includes(f.slug) || name.includes(f.name.toLowerCase().replace(/\s+/g, "-")));
        next.push({ url, finish: guess?.slug ?? null });
        onChange([...next]);
      } catch (e) {
        setErr(`${files[i].name}: ${(e as Error).message}`);
      }
    }
    setBusy("");
  };

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const n = [...value];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };

  return (
    <div>
      {value.length === 0 ? (
        <div
          className="relative aspect-square w-full overflow-hidden border border-dashed border-line bg-white"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
        >
          {fallback}
          <div className="absolute inset-x-0 bottom-0 bg-white/85 px-3 py-2 text-center text-[12px] text-muted">No photos yet · drop photos here</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {value.map((ph, i) => (
            <div key={ph.url + i} className={`border bg-white ${i === 0 ? "border-ink" : "border-line"}`}>
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.url} alt="" className="h-full w-full object-contain" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 flex items-center gap-1 bg-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-paper"><Star size={10} /> Main</span>}
              </div>
              <div className="space-y-1.5 border-t border-line p-1.5">
                <select
                  value={ph.finish ?? ""}
                  onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, finish: e.target.value || null } : x)))}
                  className="w-full border border-line bg-white px-1.5 py-1 text-[12px]"
                  title="Which colour is this photo?"
                >
                  <option value="">Any colour</option>
                  {finishes.map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
                </select>
                <div className="flex justify-between">
                  <span className="flex">
                    <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}><ArrowLeft size={13} /></IconBtn>
                    <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === value.length - 1}><ArrowRight size={13} /></IconBtn>
                    {i !== 0 && <IconBtn label="Make main photo" onClick={() => onChange([ph, ...value.filter((_, j) => j !== i)])}><Star size={13} /></IconBtn>}
                  </span>
                  <IconBtn label="Remove photo" danger onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 size={13} /></IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={!!busy}
        onClick={() => input.current?.click()}
        className="mt-3 flex w-full items-center justify-center gap-2 border border-line bg-white px-3 py-2.5 text-[13px] hover:border-ink disabled:opacity-60"
      >
        {busy ? <><Loader2 size={14} className="animate-spin" /> {busy}</> : <><ImagePlus size={15} /> Add photos</>}
      </button>
      {err && <p className="mt-1 text-[12px] text-sale">{err}</p>}
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; if (f.length) addFiles(f); }}
      />
    </div>
  );
}

function IconBtn({ children, onClick, label, disabled, danger }: { children: React.ReactNode; onClick: () => void; label: string; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label}
      className={`grid h-7 w-7 place-items-center hover:bg-sand disabled:opacity-25 ${danger ? "text-sale" : ""}`}>
      {children}
    </button>
  );
}
