import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminOnly, fail } from "@/lib/server/api";
import { createProduct, deleteProduct, getCatalog, uniqueSlug, updateProduct } from "@/lib/server/db";
import type { Product } from "@/lib/catalog";

const FIELDS = ["slug", "sku", "name", "category", "collection", "price", "compare_at", "finishes", "specs", "art", "tone", "badge", "rating", "reviews", "stock", "featured", "description", "image_url", "images"] as const;

function clean(input: Record<string, unknown>): Partial<Product> {
  const p: Record<string, unknown> = {};
  for (const k of FIELDS) if (k in input) p[k] = input[k];
  for (const k of ["price", "stock", "reviews"]) if (k in p) p[k] = Math.max(0, Math.round(Number(p[k]) || 0));
  if ("rating" in p) p.rating = Math.min(5, Math.max(0, Number(p.rating) || 0));
  if ("compare_at" in p) p.compare_at = p.compare_at ? Math.max(0, Math.round(Number(p.compare_at))) : null;
  if ("badge" in p) p.badge = p.badge || null;
  if ("image_url" in p) p.image_url = p.image_url || null;
  if ("name" in p) p.name = String(p.name).trim();
  if ("featured" in p) p.featured = Boolean(p.featured);
  if ("images" in p) {
    const list = Array.isArray(p.images) ? p.images : [];
    p.images = list
      .filter((x: { url?: unknown }) => x && typeof x.url === "string" && x.url.trim())
      .slice(0, 20)
      .map((x: { url: string; finish?: unknown }) => ({ url: x.url.trim(), finish: typeof x.finish === "string" && x.finish ? x.finish : null }));
    p.image_url = (p.images as { url: string }[])[0]?.url ?? null;
  }
  return p as Partial<Product>;
}

const refresh = () => revalidatePath("/", "layout");

// Create
export async function POST(req: Request) {
  return adminOnly(async () => {
    const body = clean(await req.json());
    if (!body.name) return fail("Name is required");
    if (!body.category) return fail("Category is required");
    const cat = await getCatalog();
    const n = cat.products.length + 1001;
    const product = await createProduct({
      slug: await uniqueSlug(body.slug || body.name),
      sku: body.sku || `ART-${body.category.slice(0, 3).toUpperCase()}-${n}`,
      name: body.name,
      category: body.category,
      collection: body.collection || cat.collections[0]?.slug,
      price: body.price ?? 0,
      compare_at: body.compare_at ?? null,
      finishes: body.finishes ?? [],
      specs: body.specs ?? {},
      art: body.art || "faucet-basin",
      tone: body.tone || "#ece8e1",
      badge: body.badge ?? null,
      rating: body.rating ?? 5,
      reviews: body.reviews ?? 0,
      stock: body.stock ?? 0,
      featured: !!body.featured,
      description: body.description || "",
      image_url: body.image_url ?? null,
      images: body.images ?? (body.image_url ? [{ url: body.image_url, finish: null }] : []),
    });
    refresh();
    return NextResponse.json({ ok: true, product });
  });
}

// Update (partial): { id, ...fields }
export async function PATCH(req: Request) {
  return adminOnly(async () => {
    const raw = await req.json();
    const id = Number(raw.id);
    if (!id) return fail("Missing product id");
    const body = clean(raw);
    if ("slug" in body || "name" in body) {
      const cat = await getCatalog();
      const current = cat.products.find((p) => p.id === id);
      body.slug = await uniqueSlug(body.slug || current?.slug || body.name || "product", id);
    }
    const product = await updateProduct(id, body);
    refresh();
    return NextResponse.json({ ok: true, product });
  });
}

// Delete: ?id=12
export async function DELETE(req: Request) {
  return adminOnly(async () => {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return fail("Missing product id");
    await deleteProduct(id);
    refresh();
    return NextResponse.json({ ok: true });
  });
}
