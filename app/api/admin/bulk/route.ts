import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminOnly, fail } from "@/lib/server/api";
import { bulkSave, getCatalog } from "@/lib/server/db";
import type { Product } from "@/lib/catalog";

// POST { rows: Partial<Product>[] }  (already resolved by the import page)
export async function POST(req: Request) {
  return adminOnly(async () => {
    const { rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) return fail("No rows to import");
    if (rows.length > 500) return fail("Please import at most 500 rows at a time");
    const cat = await getCatalog();
    const cats = new Set(cat.categories.map((c) => c.slug));
    const cols = new Set(cat.collections.map((c) => c.slug));
    const fins = new Set(cat.finishes.map((f) => f.slug));
    const ids = new Set(cat.products.map((p) => p.id));

    const clean: Partial<Product>[] = [];
    const errors: string[] = [];
    rows.forEach((r: Partial<Product>, i: number) => {
      const line = `Row ${i + 2}`;
      const id = r.id ? Number(r.id) : undefined;
      if (id && !ids.has(id)) errors.push(`${line}: product id ${id} doesn't exist (leave id empty to add a new product)`);
      if (!id && !r.name) errors.push(`${line}: name is required`);
      if (r.category && !cats.has(r.category)) errors.push(`${line}: unknown category "${r.category}"`);
      if (!id && !r.category) errors.push(`${line}: category is required for new products`);
      if (r.collection && !cols.has(r.collection)) errors.push(`${line}: unknown collection "${r.collection}"`);
      const num = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));
      const out: Partial<Product> = { ...r, id };
      if (r.price !== undefined) out.price = num(r.price);
      if (r.stock !== undefined) out.stock = num(r.stock);
      if (r.compare_at !== undefined) out.compare_at = r.compare_at ? num(r.compare_at) : null;
      if (r.finishes) out.finishes = r.finishes.filter((f) => fins.has(f));
      if (r.images) {
        out.images = r.images.filter((x) => x && typeof x.url === "string").map((x) => ({ url: x.url, finish: x.finish && fins.has(x.finish) ? x.finish : null }));
        out.image_url = out.images[0]?.url ?? null;
      }
      clean.push(out);
    });
    if (errors.length) return NextResponse.json({ ok: false, error: "Nothing was saved. Fix these rows first.", errors: errors.slice(0, 50) }, { status: 400 });

    const result = await bulkSave(clean);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, ...result });
  });
}
