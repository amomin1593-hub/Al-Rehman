import { adminOnly } from "@/lib/server/api";
import { getCatalog } from "@/lib/server/db";
import { CSV_COLUMNS, toCSV } from "@/lib/csv";
import { productPhotos } from "@/lib/catalog";

// GET /api/admin/export            -> all products as a spreadsheet (CSV)
// GET /api/admin/export?blank=1    -> empty template with one example row
export async function GET(req: Request) {
  return adminOnly(async () => {
    const blank = new URL(req.url).searchParams.has("blank");
    const cat = await getCatalog();
    const catName = (s: string) => cat.categories.find((c) => c.slug === s)?.name ?? s;
    const colName = (s: string) => cat.collections.find((c) => c.slug === s)?.name ?? s;
    const finName = (s: string) => cat.finishes.find((f) => f.slug === s)?.name ?? s;

    const rows: (string | number | null)[][] = [[...CSV_COLUMNS]];
    if (blank) {
      rows.push(["", "Gold Wall Basin Mixer", cat.categories[0]?.name ?? "", cat.collections[0]?.name ?? "", 18500, "", 10, "New", "yes",
        "Brushed Gold, Matte Black", "mixer-gold.jpg=Brushed Gold; mixer-black.jpg=Matte Black",
        "Solid brass wall-mounted basin mixer.", "Material: Brass | Warranty: 5 years", ""]);
    } else {
      for (const p of cat.products) {
        rows.push([
          p.id, p.name, catName(p.category), colName(p.collection), p.price, p.compare_at ?? "", p.stock,
          p.badge ?? "", p.featured ? "yes" : "no",
          p.finishes.map(finName).join(", "),
          productPhotos(p).map((x) => (x.finish ? `${x.url}=${finName(x.finish)}` : x.url)).join("; "),
          p.description,
          Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join(" | "),
          p.sku,
        ]);
      }
    }
    return new Response(toCSV(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${blank ? "al-rehman-template" : "al-rehman-products"}.csv"`,
      },
    });
  });
}
