"use client";
// Bulk import: upload a spreadsheet (CSV) + photos, preview, then save everything at once.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, ImagePlus, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card, PageTitle, uploadPhoto } from "./ui";
import { parseCSV } from "@/lib/csv";
import type { Catalog, Product, ProductPhoto } from "@/lib/catalog";
import { pkr } from "@/lib/site";

type PhotoRef = { ref: string; finish: string | null; isUrl: boolean };
type Row = {
  line: number;
  kind: "new" | "update";
  data: Partial<Product>;
  photos: PhotoRef[] | undefined; // undefined = keep current photos
  errors: string[];
  label: string;
};

const norm = (s: string) => s.trim().toLowerCase().replace(/[_\s-]+/g, " ");
const fileKey = (s: string) => s.trim().toLowerCase().split("/").pop() ?? "";

export default function BulkImport({ catalog }: { catalog: Catalog }) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [table, setTable] = useState<string[][] | null>(null);
  const [files, setFiles] = useState<Map<string, File>>(new Map());
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [error, setError] = useState("");
  const csvInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  const findCat = (v: string) => catalog.categories.find((c) => norm(c.slug) === norm(v) || norm(c.name) === norm(v));
  const findCol = (v: string) => catalog.collections.find((c) => norm(c.slug) === norm(v) || norm(c.name) === norm(v));
  const findFin = (v: string) => catalog.finishes.find((f) => norm(f.slug) === norm(v) || norm(f.name) === norm(v));
  const ids = useMemo(() => new Set(catalog.products.map((p) => p.id)), [catalog]);

  const rows: Row[] = useMemo(() => {
    if (!table || table.length < 2) return [];
    const head = table[0].map((h) => norm(h).replace(/ /g, "_"));
    const col = (names: string[]) => names.map((n) => head.indexOf(n)).find((i) => i >= 0) ?? -1;
    const idx = {
      id: col(["id"]), name: col(["name", "product", "product_name"]), category: col(["category"]), collection: col(["collection"]),
      price: col(["price"]), old: col(["old_price", "compare_at", "oldprice"]), stock: col(["stock", "qty", "quantity"]),
      badge: col(["badge"]), featured: col(["featured"]), finishes: col(["finishes", "finish", "colors", "colours"]),
      photos: col(["photos", "photo", "images", "image"]), description: col(["description"]), specs: col(["specs", "specifications"]), sku: col(["sku"]),
    };
    return table.slice(1).map((cells, i): Row => {
      const get = (k: keyof typeof idx) => (idx[k] >= 0 ? (cells[idx[k]] ?? "").trim() : "");
      const errors: string[] = [];
      const idRaw = get("id");
      const id = idRaw ? Number(idRaw) : undefined;
      const kind: Row["kind"] = id ? "update" : "new";
      if (id && !ids.has(id)) errors.push(`id ${idRaw} not found`);
      const d: Partial<Product> = {};
      if (id) d.id = id;
      const set = <K extends keyof Product>(k: K, v: Product[K] | undefined) => { if (v !== undefined) d[k] = v; };

      const name = get("name");
      if (name) d.name = name; else if (!id) errors.push("name missing");
      const c = get("category");
      if (c) { const m = findCat(c); if (m) d.category = m.slug; else errors.push(`unknown category "${c}"`); }
      else if (!id) errors.push("category missing");
      const cl = get("collection");
      if (cl) { const m = findCol(cl); if (m) d.collection = m.slug; else errors.push(`unknown collection "${cl}"`); }

      const money = (v: string, what: string) => {
        const n = Number(v.replace(/rs\.?|,|\s/gi, ""));
        if (Number.isNaN(n)) { errors.push(`${what} "${v}" is not a number`); return undefined; }
        return Math.round(n);
      };
      const price = get("price");
      if (price) set("price", money(price, "price")); else if (!id) errors.push("price missing");
      const old = get("old");
      if (old) set("compare_at", /^(none|0|-)$/i.test(old) ? null : money(old, "old price") ?? null);
      const stock = get("stock");
      if (stock) set("stock", money(stock, "stock"));
      const badge = get("badge");
      if (badge) d.badge = /^none$/i.test(badge) ? null : badge;
      const featured = get("featured");
      if (featured) d.featured = /^(y|yes|true|1)$/i.test(featured);
      const fin = get("finishes");
      if (fin) {
        const list = fin.split(/[,;|]/).map((x) => x.trim()).filter(Boolean);
        const slugs: string[] = [];
        for (const f of list) { const m = findFin(f); if (m) slugs.push(m.slug); else errors.push(`unknown finish "${f}"`); }
        d.finishes = slugs;
      }
      const desc = get("description");
      if (desc) d.description = desc;
      const specs = get("specs");
      if (specs) d.specs = Object.fromEntries(specs.split("|").map((x) => x.split(/:(.*)/s).map((y) => (y ?? "").trim())).filter(([k]) => k).map(([k, v]) => [k, v ?? ""]));
      const sku = get("sku");
      if (sku) d.sku = sku;

      let photos: PhotoRef[] | undefined;
      const ph = get("photos");
      if (ph) {
        photos = ph.split(/[;\n]/).map((x) => x.trim()).filter(Boolean).map((entry) => {
          const eq = entry.lastIndexOf("=");
          const ref = (eq > 0 ? entry.slice(0, eq) : entry).trim();
          const finTxt = eq > 0 ? entry.slice(eq + 1).trim() : "";
          const f = finTxt ? findFin(finTxt) : undefined;
          if (finTxt && !f) errors.push(`unknown finish "${finTxt}" in photos`);
          const isUrl = /^(https?:)?\/\//i.test(ref) || ref.startsWith("/");
          if (!isUrl && !files.has(fileKey(ref))) errors.push(`photo "${ref}" not selected`);
          return { ref, finish: f?.slug ?? null, isUrl };
        });
      }
      const existing = id ? catalog.products.find((p) => p.id === id) : undefined;
      return { line: i + 2, kind, data: d, photos, errors, label: d.name ?? existing?.name ?? "(no name)" };
    });
  }, [table, files, catalog, ids]); // eslint-disable-line react-hooks/exhaustive-deps

  const bad = rows.filter((r) => r.errors.length);
  const neededFiles = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.photos?.forEach((p) => { if (!p.isUrl) s.add(fileKey(p.ref)); }));
    return s;
  }, [rows]);

  const loadCSV = async (f: File) => {
    setResult(null); setServerErrors([]); setError("");
    setFileName(f.name);
    const text = await f.text();
    const t = parseCSV(text);
    if (t.length < 2) setError("The file has no product rows. Make sure the first row has the column names.");
    setTable(t);
  };

  const run = async () => {
    setError(""); setServerErrors([]); setResult(null);
    try {
      // 1. upload photos that the sheet refers to
      const urls = new Map<string, string>();
      const list = [...neededFiles];
      for (let i = 0; i < list.length; i++) {
        setProgress(`Uploading photo ${i + 1} of ${list.length}…`);
        urls.set(list[i], await uploadPhoto(files.get(list[i])!, "products"));
      }
      // 2. build rows
      const payload = rows.map((r) => {
        const d = { ...r.data };
        if (r.photos) {
          const imgs: ProductPhoto[] = r.photos.map((p) => ({ url: p.isUrl ? p.ref : urls.get(fileKey(p.ref))!, finish: p.finish }));
          d.images = imgs;
          d.image_url = imgs[0]?.url ?? null;
        }
        return d;
      });
      // 3. save in batches
      let created = 0, updated = 0;
      for (let i = 0; i < payload.length; i += 100) {
        setProgress(`Saving products ${i + 1}–${Math.min(i + 100, payload.length)} of ${payload.length}…`);
        const res = await fetch("/api/admin/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: payload.slice(i, i + 100) }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          if (data.errors) setServerErrors(data.errors);
          throw new Error(data.error || `Import failed (${res.status})`);
        }
        created += data.created; updated += data.updated;
      }
      setResult({ created, updated });
      setTable(null); setFileName(""); setFiles(new Map());
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress("");
    }
  };

  return (
    <>
      <PageTitle title="Bulk import" sub="Add or update many products at once with a spreadsheet." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="1 · Download">
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Download your current products, edit them in Excel or Google Sheets (change names, prices, stock, photos), and add new rows for new products.
          </p>
          <a href="/api/admin/export" className="btn-dark mb-2 w-full py-2.5"><Download size={14} /> My products (.csv)</a>
          <a href="/api/admin/export?blank=1" className="btn-line w-full py-2.5"><Download size={14} /> Blank template</a>
        </Card>

        <Card title="2 · Upload the sheet">
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            In Excel: <b>File → Save As → CSV UTF-8</b>. In Google Sheets: <b>File → Download → CSV</b>.
          </p>
          <button onClick={() => csvInput.current?.click()} className="btn-dark w-full py-2.5"><FileSpreadsheet size={14} /> Choose CSV file</button>
          {fileName && <p className="mt-2 truncate text-[12px] text-muted">{fileName} · {rows.length} rows</p>}
          <input ref={csvInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) loadCSV(f); }} />
        </Card>

        <Card title="3 · Add the photos">
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Select all photos named in the <b>photos</b> column (you can select many at once). Big photos are shrunk automatically.
          </p>
          <button onClick={() => photoInput.current?.click()} className="btn-line w-full py-2.5"><ImagePlus size={14} /> Choose photos</button>
          <p className="mt-2 text-[12px] text-muted">
            {files.size} selected{neededFiles.size ? ` · ${[...neededFiles].filter((f) => files.has(f)).length}/${neededFiles.size} needed found` : ""}
          </p>
          <input ref={photoInput} type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => { const list = Array.from(e.target.files ?? []); e.target.value = ""; setFiles((m) => { const n = new Map(m); list.forEach((f) => n.set(fileKey(f.name), f)); return n; }); }} />
        </Card>
      </div>

      {result && (
        <div className="mt-6 flex items-center gap-3 border border-[#b9cdb3] bg-[#eef4ec] px-5 py-4 text-[14px] text-[#3f5d3a]">
          <CheckCircle2 size={18} /> Done: {result.created} new and {result.updated} updated products are live.
          <Link href="/admin/products" className="ml-auto underline underline-offset-4">View products</Link>
        </div>
      )}
      {error && (
        <div className="mt-6 border border-sale/40 bg-[#f8ebe7] px-5 py-4 text-[14px] text-sale">
          <p className="flex items-center gap-2"><AlertTriangle size={16} /> {error}</p>
          {serverErrors.length > 0 && <ul className="mt-2 list-disc pl-6 text-[13px]">{serverErrors.map((e) => <li key={e}>{e}</li>)}</ul>}
        </div>
      )}

      {rows.length > 0 && (
        <Card title={`Preview · ${rows.filter((r) => r.kind === "new").length} new · ${rows.filter((r) => r.kind === "update").length} updates${bad.length ? ` · ${bad.length} with problems` : ""}`} className="mt-6">
          <div className="-m-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13px]">
              <thead className="border-b border-line bg-sand/60 text-left text-[11px] uppercase tracking-[0.12em] text-muted">
                <tr><th className="px-4 py-2.5 font-normal">Row</th><th className="px-3 font-normal">Action</th><th className="px-3 font-normal">Product</th><th className="px-3 font-normal">Price</th><th className="px-3 font-normal">Stock</th><th className="px-3 font-normal">Photos</th><th className="px-4 font-normal">Problems</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.line} className={r.errors.length ? "bg-[#fbf1ee]" : ""}>
                    <td className="px-4 py-2.5 text-muted">{r.line}</td>
                    <td className="px-3"><span className={`px-2 py-0.5 text-[11px] ${r.kind === "new" ? "bg-[#e2e8ee] text-[#3a5068]" : "bg-sand"}`}>{r.kind === "new" ? "New" : `Update #${r.data.id}`}</span></td>
                    <td className="px-3">{r.label}</td>
                    <td className="px-3">{r.data.price !== undefined ? pkr(r.data.price) : <span className="text-muted">unchanged</span>}</td>
                    <td className="px-3">{r.data.stock ?? <span className="text-muted">–</span>}</td>
                    <td className="px-3">{r.photos ? r.photos.length : <span className="text-muted">keep</span>}</td>
                    <td className="px-4 text-sale">{r.errors.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {rows.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button onClick={run} disabled={!!progress || bad.length > 0} className="btn-dark py-3">
            {progress ? <><Loader2 size={15} className="animate-spin" /> {progress}</> : `Import ${rows.length} products`}
          </button>
          {bad.length > 0 && <span className="text-[13px] text-sale">Fix the rows marked in red (in your sheet), then choose the file again.</span>}
        </div>
      )}

      <Card title="How the sheet works" className="mt-8">
        <ul className="space-y-2 text-[13px] leading-relaxed text-ink-soft">
          <li><b>id</b>: keep it to update that product. Leave it <b>empty</b> to add a new product.</li>
          <li><b>category / collection / finishes</b>: use the names shown on the site, e.g. <i>Bathroom Faucets</i>, <i>Safa</i>, <i>Brushed Gold, Matte Black</i>.</li>
          <li><b>photos</b>: file names separated by <b>;</b>. Add <b>=Colour</b> to link a photo to a finish, e.g. <code>tap-gold.jpg=Brushed Gold; tap-black.jpg=Matte Black</code>. The first photo is the main one.</li>
          <li><b>featured</b>: yes / no (shows on the home page). <b>badge</b>: New, Sale, Best seller, or none.</li>
          <li><b>specs</b>: <code>Size: 50x40 cm | Material: Ceramic</code>.</li>
          <li>For existing products, an <b>empty cell keeps the current value</b>. Write <b>none</b> to clear an old price or badge.</li>
        </ul>
      </Card>
    </>
  );
}
