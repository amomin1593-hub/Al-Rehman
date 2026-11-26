// Types + helper functions for the product catalogue.
// The data itself comes from Supabase (or the JSON files in /data before Supabase is set up):
//   - server components: `await getCatalog()` from "@/lib/server/db"
//   - client components: `useCatalog()` from "@/components/CatalogProvider"

export type Category = { slug: string; name: string; tagline: string; description: string };
export type Collection = { slug: string; name: string; line: string };
export type Finish = { slug: string; name: string; hex: string };
export type ProductPhoto = { url: string; finish: string | null };
export type Product = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  category: string;
  collection: string;
  price: number;
  compare_at: number | null;
  finishes: string[];
  specs: Record<string, string>;
  art: string;
  tone: string;
  badge: string | null;
  rating: number;
  reviews: number;
  stock: number;
  featured: boolean;
  description: string;
  image_url?: string | null;
  /** gallery: first photo is the main one; a photo can belong to a finish (colour) */
  images?: ProductPhoto[];
};

/** All photos of a product (falls back to the single image_url). */
export function productPhotos(p: Product): ProductPhoto[] {
  if (p.images && p.images.length) return p.images;
  return p.image_url ? [{ url: p.image_url, finish: null }] : [];
}

/** The best photo for a finish: that finish's photo, else the main photo. */
export function photoFor(p: Product, finish?: string | null): string | null {
  const photos = productPhotos(p);
  if (!photos.length) return null;
  return (finish && photos.find((x) => x.finish === finish)?.url) || photos[0].url;
}
// Fallback colours for drawings when the finish list isn't at hand
export const FINISH_HEX: Record<string, string> = {
  chrome: "#c9ccd0",
  "brushed-nickel": "#a8a49c",
  "matte-black": "#2a2a2a",
  "brushed-gold": "#c8a46a",
  gunmetal: "#5b5d60",
};

export type Catalog = { categories: Category[]; collections: Collection[]; finishes: Finish[]; products: Product[] };

/** 2 = uploaded photo, 1 = starter photo, 0 = drawing only. Used to put your real photos first. */
export function photoScore(p: Product): number {
  const url = productPhotos(p)[0]?.url;
  if (!url) return 0;
  return url.startsWith("/products/catalog/") ? 1 : 2;
}
const best = (list: Product[]) => [...list].sort((a, b) => photoScore(b) - photoScore(a) || b.id - a.id)[0];

export function catalogHelpers(c: Catalog) {
  const byCategory = (slug: string) => c.products.filter((p) => p.category === slug);
  const byCollection = (slug: string) => c.products.filter((p) => p.collection === slug);
  return {
    ...c,
    getProduct: (slug: string) => c.products.find((p) => p.slug === slug),
    getProductById: (id: number) => c.products.find((p) => p.id === id),
    getCategory: (slug: string) => c.categories.find((x) => x.slug === slug),
    getCollection: (slug: string) => c.collections.find((x) => x.slug === slug),
    getFinish: (slug: string) => c.finishes.find((x) => x.slug === slug),
    byCategory,
    byCollection,
    featured: () => c.products.filter((p) => p.featured),
    heroOfCategory: (slug: string) => best(byCategory(slug)) as Product | undefined,
    heroOfCollection: (slug: string) => best(byCollection(slug)) as Product | undefined,
    related: (p: Product, n = 4) =>
      c.products.filter((x) => x.id !== p.id && (x.collection === p.collection || x.category === p.category)).slice(0, n),
  };
}
export type CatalogHelpers = ReturnType<typeof catalogHelpers>;
