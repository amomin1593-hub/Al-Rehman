"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

/** fetch helper: JSON in/out, throws a readable error */
export async function api<T = { ok: boolean }>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    if (res.status === 401) window.location.reload();
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

/** small status line used after saving */
export function useStatus() {
  const [state, setState] = useState<{ kind: "idle" | "busy" | "ok" | "err"; msg?: string }>({ kind: "idle" });
  const run = async (fn: () => Promise<unknown>, okMsg = "Saved") => {
    setState({ kind: "busy" });
    try {
      await fn();
      setState({ kind: "ok", msg: okMsg });
      setTimeout(() => setState((s) => (s.kind === "ok" ? { kind: "idle" } : s)), 2500);
      return true;
    } catch (e) {
      setState({ kind: "err", msg: (e as Error).message });
      return false;
    }
  };
  return { state, run, busy: state.kind === "busy" };
}

export function Status({ state }: { state: ReturnType<typeof useStatus>["state"] }) {
  if (state.kind === "idle") return null;
  return (
    <span
      role="status"
      className={`text-[13px] ${state.kind === "err" ? "text-sale" : state.kind === "ok" ? "text-[#3f5d3a]" : "text-muted"}`}
    >
      {state.kind === "busy" ? "Saving…" : state.msg}
    </span>
  );
}

export function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted/80">{hint}</span>}
    </label>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-white ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[12px] uppercase tracking-[0.2em]">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="h-display text-[40px] md:text-[48px]">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/** Image picker: uploads to /api/admin/upload and returns the public URL */
export function ImageField({
  value,
  onChange,
  folder,
  aspect = "aspect-square",
  fallback,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: "products" | "home";
  aspect?: string;
  fallback?: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const { url } = await api<{ ok: boolean; url: string }>("/api/admin/upload", "POST", fd);
      onChange(url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        className={`relative ${aspect} w-full overflow-hidden border border-dashed border-line bg-sand`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          fallback ?? <div className="grid h-full place-items-center text-[13px] text-muted">No image</div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-paper/70">
            <Loader2 className="animate-spin" size={22} />
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => input.current?.click()} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-[12px] hover:border-ink">
          <ImagePlus size={14} /> {value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="flex items-center gap-1.5 border border-line bg-white px-3 py-2 text-[12px] text-sale hover:border-sale">
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>
      {err && <p className="mt-1 text-[12px] text-sale">{err}</p>}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export const inputCls = "w-full border border-line bg-white px-3 py-2.5 text-[14px] outline-none focus:border-ink";
