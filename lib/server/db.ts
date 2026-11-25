import "server-only";
// The store's database layer.
//
// With SUPABASE_URL + SUPABASE_SECRET_KEY set (in .env.local and in Vercel), everything is
// read from and saved to Supabase, and uploaded photos go to the Supabase Storage bucket "media".
// Without them, it falls back to the JSON files in /data (works on your computer only).
import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Catalog, Product } from "@/lib/catalog";
import type { HomeContent } from "@/lib/home";

// ---------- connection ----------
const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const usingSupabase = Boolean(URL && KEY);
export const BUCKET = "media";

let client: SupabaseClient | null = null;
function sb() {
  if (!client) {
    client = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  }
  return client;
}

function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) {
    const m = res.error.message;
    const hint = /images/.test(m) && /column|schema cache/i.test(m)
      ? " (Fix: in Supabase → SQL Editor run:  alter table public.products add column if not exists images jsonb not null default '[]'::jsonb;  )"
      : "";
    throw new Error(`Database error (${what}): ${m}${hint}`);
  }
  return res.data as T;
}

// ---------- file fallback ----------
const DATA = path.join(process.cwd(), "data");
async function readJSON<T>(name: string, fallback?: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA, name), "utf8")) as T;
  } catch (e) {
    if (fallback !== undefined && (e as { code?: string }).code === "ENOENT") return fallback;
    throw e;
  }
}
async function writeJSON(name: string, data: unknown) {
  const file = path.join(DATA, name);
  await fs.writeFile(file + ".tmp", JSON.stringify(data, null, 2) + "\n", "utf8");
  await fs.rename(file + ".tmp", file);
}

export const READ_ONLY_MSG =
  "Saving isn't possible here because Supabase isn't connected yet. Add SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel (see README).";
export function isReadOnlyError(e: unknown) {
  const code = (e as { code?: string })?.code;
  return code === "EROFS" || code === "EACCES" || code === "EPERM";
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ---------- types ----------
export type OrderItem = { product_id: number; name: string; qty: number; price: number; finish: string | null };
export type Order = {
  id: string;
  created_at: string;
  status: string;
  payment: string;
  customer: { name: string; phone: string; email?: string; address: string; city: string; province: string; notes?: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
};
export const ORDER_STATUSES = ["Processing", "Confirmed", "Shipped", "Out for delivery", "Delivered", "Cancelled"];

const normalizeProduct = (p: Product): Product => ({
  ...p,
  id: Number(p.id),
  price: Number(p.price),
  compare_at: p.compare_at == null ? null : Number(p.compare_at),
  rating: Number(p.rating ?? 5),
  reviews: Number(p.reviews ?? 0),
  stock: Number(p.stock ?? 0),
  finishes: p.finishes ?? [],
  specs: p.specs ?? {},
  images: Array.isArray(p.images) && p.images.length ? p.images : p.image_url ? [{ url: p.image_url, finish: null }] : [],
});

// ---------- reads ----------
export const getCatalog = cache(async (): Promise<Catalog> => {
  if (!usingSupabase) {
    const c = await readJSON<Catalog>("catalog.json");
    return { ...c, products: c.products.map(normalizeProduct) };
  }
  const db = sb();
  const [cats, cols, fins, prods] = await Promise.all([
    db.from("categories").select("*").order("sort"),
    db.from("collections").select("*").order("sort"),
    db.from("finishes").select("*").order("sort"),
    db.from("products").select("*").order("id"),
  ]);
  return {
    categories: must(cats, "categories").map(({ sort: _s, ...c }: Record<string, unknown>) => c) as Catalog["categories"],
    collections: must(cols, "collections").map(({ sort: _s, ...c }: Record<string, unknown>) => c) as Catalog["collections"],
    finishes: must(fins, "finishes").map(({ sort: _s, ...c }: Record<string, unknown>) => c) as Catalog["finishes"],
    products: (must(prods, "products") as Product[]).map(normalizeProduct),
  };
});

export const getHome = cache(async (): Promise<HomeContent> => {
  const fileHome = () => readJSON<HomeContent>("home.json");
  if (!usingSupabase) return fileHome();
  const row = must(await sb().from("site_content").select("value").eq("key", "home").maybeSingle(), "home");
  return ((row as { value: HomeContent } | null)?.value ?? (await fileHome())) as HomeContent;
});

export async function listOrders(): Promise<Order[]> {
  if (!usingSupabase) return (await readJSON<Order[]>("orders.json", [])).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return must(await sb().from("orders").select("*").order("created_at", { ascending: false }), "orders") as Order[];
}

export async function dbStatus() {
  if (!usingSupabase) return { mode: "files" as const, ok: true, empty: false, error: "" };
  try {
    const { count, error } = await sb().from("products").select("id", { count: "exact", head: true });
    if (error) return { mode: "supabase" as const, ok: false, empty: false, error: error.message };
    return { mode: "supabase" as const, ok: true, empty: (count ?? 0) === 0, error: "" };
  } catch (e) {
    return { mode: "supabase" as const, ok: false, empty: false, error: (e as Error).message };
  }
}

// ---------- product writes ----------
async function allSlugs(): Promise<{ id: number; slug: string }[]> {
  if (!usingSupabase) return (await readJSON<Catalog>("catalog.json")).products.map((p) => ({ id: p.id, slug: p.slug }));
  return must(await sb().from("products").select("id, slug"), "slugs") as { id: number; slug: string }[];
}

export async function uniqueSlug(base: string, selfId?: number) {
  const taken = new Set((await allSlugs()).filter((p) => p.id !== selfId).map((p) => p.slug));
  const root = slugify(base) || "product";
  let slug = root;
  for (let n = 2; taken.has(slug); n++) slug = `${root}-${n}`;
  return slug;
}

export async function createProduct(p: Omit<Product, "id">): Promise<Product> {
  if (!usingSupabase) {
    const cat = await readJSON<Catalog>("catalog.json");
    const product = { ...p, id: Math.max(0, ...cat.products.map((x) => x.id)) + 1 } as Product;
    cat.products.push(product);
    await writeJSON("catalog.json", cat);
    return product;
  }
  return normalizeProduct(must(await sb().from("products").insert(p).select().single(), "create product") as Product);
}

export async function updateProduct(id: number, patch: Partial<Product>): Promise<Product> {
  const { id: _ignore, ...fields } = patch;
  if (!usingSupabase) {
    const cat = await readJSON<Catalog>("catalog.json");
    const i = cat.products.findIndex((p) => p.id === id);
    if (i < 0) throw Object.assign(new Error("Product not found"), { status: 404 });
    cat.products[i] = { ...cat.products[i], ...fields, id };
    await writeJSON("catalog.json", cat);
    return cat.products[i];
  }
  const row = must(await sb().from("products").update(fields).eq("id", id).select().maybeSingle(), "update product");
  if (!row) throw Object.assign(new Error("Product not found"), { status: 404 });
  return normalizeProduct(row as Product);
}

export async function deleteProduct(id: number) {
  if (!usingSupabase) {
    const cat = await readJSON<Catalog>("catalog.json");
    cat.products = cat.products.filter((p) => p.id !== id);
    return writeJSON("catalog.json", cat);
  }
  must(await sb().from("products").delete().eq("id", id).select("id"), "delete product");
}

// ---------- home ----------
export async function saveHome(h: HomeContent) {
  if (!usingSupabase) return writeJSON("home.json", h);
  must(await sb().from("site_content").upsert({ key: "home", value: h, updated_at: new Date().toISOString() }).select("key"), "save home");
}

// ---------- orders ----------
export async function createOrder(o: Order) {
  if (!usingSupabase) {
    const orders = await readJSON<Order[]>("orders.json", []);
    orders.push(o);
    return writeJSON("orders.json", orders);
  }
  must(await sb().from("orders").insert(o).select("id"), "create order");
}

export async function setOrderStatus(id: string, status: string) {
  if (!usingSupabase) {
    const orders = await readJSON<Order[]>("orders.json", []);
    const o = orders.find((x) => x.id === id);
    if (!o) throw Object.assign(new Error("Order not found"), { status: 404 });
    o.status = status;
    return writeJSON("orders.json", orders);
  }
  const row = must(await sb().from("orders").update({ status }).eq("id", id).select("id").maybeSingle(), "update order");
  if (!row) throw Object.assign(new Error("Order not found"), { status: 404 });
}

/** Lower stock after an order. Never below zero. */
export async function reduceStock(items: OrderItem[]) {
  const cat = await getCatalog();
  for (const it of items) {
    const p = cat.products.find((x) => x.id === it.product_id);
    if (p) await updateProduct(p.id, { stock: Math.max(0, p.stock - it.qty) });
  }
}

// ---------- images ----------
const TYPES: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" };
export const VIDEO_TYPES: Record<string, string> = { "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov" };
export const MAX_UPLOAD = 8 * 1024 * 1024;
export const MAX_VIDEO = 50 * 1024 * 1024; // Supabase free plan file limit

/** For big files (videos): a one-time URL the browser uploads to directly, skipping the website server. */
export async function signedUpload(fileName: string, type: string, size: number, folder: "products" | "home") {
  const ext = VIDEO_TYPES[type] ?? TYPES[type];
  if (!ext) throw Object.assign(new Error("Please upload an MP4, WebM or MOV video (or a JPG/PNG/WebP image)"), { status: 400 });
  const limit = VIDEO_TYPES[type] ? MAX_VIDEO : MAX_UPLOAD;
  if (size > limit) throw Object.assign(new Error(`File is larger than ${Math.round(limit / 1048576)} MB. Compress it first (e.g. with HandBrake) or use a YouTube link.`), { status: 400 });
  if (!usingSupabase) return { mode: "direct" as const };
  const base = slugify(fileName.replace(/\.[^.]+$/, "")).slice(0, 40) || "file";
  const key = `${folder}/${Date.now().toString(36)}-${base}${ext}`;
  const data = must(await sb().storage.from(BUCKET).createSignedUploadUrl(key), "prepare upload") as { signedUrl: string; token: string; path: string };
  return { mode: "signed" as const, uploadUrl: data.signedUrl, publicUrl: sb().storage.from(BUCKET).getPublicUrl(key).data.publicUrl };
}

export async function uploadImage(file: File, folder: "products" | "home"): Promise<string> {
  const isVideo = Boolean(VIDEO_TYPES[file.type]);
  const ext = TYPES[file.type] ?? (folder === "home" ? VIDEO_TYPES[file.type] : undefined);
  if (!ext) throw Object.assign(new Error("Please upload a JPG, PNG, WebP or AVIF image"), { status: 400 });
  if (file.size > (isVideo ? MAX_VIDEO : MAX_UPLOAD)) throw Object.assign(new Error(isVideo ? "Video is larger than 50 MB" : "Image is larger than 8 MB"), { status: 400 });
  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 40) || "image";
  const name = `${Date.now().toString(36)}-${base}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (!usingSupabase) {
    const dir = path.join(process.cwd(), "public", folder, "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), bytes);
    return `/${folder}/uploads/${name}`;
  }
  const key = `${folder}/${name}`;
  must(await sb().storage.from(BUCKET).upload(key, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false }), "upload image");
  return sb().storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}

// ---------- one-time import of the starter data into Supabase ----------
export async function importStarterData() {
  if (!usingSupabase) throw new Error("Supabase is not connected");
  const cat = await readJSON<Catalog>("catalog.json");
  const home = await readJSON<HomeContent>("home.json");
  const db = sb();
  const withSort = <T extends object>(rows: T[]) => rows.map((r, i) => ({ ...r, sort: i }));
  must(await db.from("categories").upsert(withSort(cat.categories)).select("slug"), "import categories");
  must(await db.from("collections").upsert(withSort(cat.collections)).select("slug"), "import collections");
  must(await db.from("finishes").upsert(withSort(cat.finishes)).select("slug"), "import finishes");
  // products: keep their ids so links stay the same
  const rows = cat.products.map((p) => ({ ...p, image_url: p.image_url ?? null }));
  must(await db.from("products").upsert(rows).select("id"), "import products");
  // move the id counter past the imported ids
  await db.rpc("sync_product_id_seq");
  const { data: existingHome } = await db.from("site_content").select("key").eq("key", "home").maybeSingle();
  if (!existingHome) must(await db.from("site_content").insert({ key: "home", value: home }).select("key"), "import home");
  return { products: rows.length };
}

// ---------- bulk import ----------
/** Save many products at once. Rows with an existing id are updated, rows without are created. */
export async function bulkSave(rows: Partial<Product>[]): Promise<{ created: number; updated: number }> {
  const cat = await getCatalog();
  const byId = new Map(cat.products.map((p) => [p.id, p]));
  const taken = new Set(cat.products.map((p) => p.slug));
  const freeSlug = (base: string, current?: string) => {
    if (current) taken.delete(current);
    const root = slugify(base) || "product";
    let s = root;
    for (let n = 2; taken.has(s); n++) s = `${root}-${n}`;
    taken.add(s);
    return s;
  };

  const updates: Product[] = [];
  const creates: Omit<Product, "id">[] = [];
  let skuN = cat.products.length + 1001;
  for (const r of rows) {
    const existing = r.id ? byId.get(r.id) : undefined;
    if (existing) {
      const merged = { ...existing, ...r, id: existing.id } as Product;
      merged.slug = r.name && r.name !== existing.name ? freeSlug(r.name, existing.slug) : existing.slug;
      updates.push(merged);
    } else {
      const { id: _drop, ...rest } = r;
      creates.push({
        slug: freeSlug(rest.name || "product"),
        sku: rest.sku || `ART-${(rest.category || "prd").slice(0, 3).toUpperCase()}-${skuN++}`,
        name: rest.name || "Untitled",
        category: rest.category!,
        collection: rest.collection || cat.collections[0]?.slug,
        price: rest.price ?? 0,
        compare_at: rest.compare_at ?? null,
        finishes: rest.finishes ?? [],
        specs: rest.specs ?? {},
        art: rest.art || "faucet-basin",
        tone: rest.tone || "#ece8e1",
        badge: rest.badge ?? null,
        rating: rest.rating ?? 5,
        reviews: rest.reviews ?? 0,
        stock: rest.stock ?? 0,
        featured: rest.featured ?? false,
        description: rest.description || "",
        image_url: rest.image_url ?? null,
        images: rest.images ?? (rest.image_url ? [{ url: rest.image_url, finish: null }] : []),
      });
    }
  }

  if (!usingSupabase) {
    const file = await readJSON<Catalog>("catalog.json");
    const upd = new Map(updates.map((u) => [u.id, u]));
    file.products = file.products.map((p) => upd.get(p.id) ?? p);
    let next = Math.max(0, ...file.products.map((p) => p.id)) + 1;
    for (const c of creates) file.products.push({ ...c, id: next++ } as Product);
    await writeJSON("catalog.json", file);
  } else {
    const db = sb();
    if (updates.length) {
      const strip = updates.map(({ ...u }) => { delete (u as Record<string, unknown>).created_at; delete (u as Record<string, unknown>).updated_at; return u; });
      must(await db.from("products").upsert(strip).select("id"), "bulk update");
    }
    if (creates.length) must(await db.from("products").insert(creates).select("id"), "bulk create");
  }
  return { created: creates.length, updated: updates.length };
}
