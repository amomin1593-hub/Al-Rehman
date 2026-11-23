// Types + helper functions for the product catalogue.
// The data itself comes from Supabase (or the JSON files in /data before Supabase is set up):
//   - server components: `await getCatalog()` from "@/lib/server/db"
//   - client components: `useCatalog()` from "@/components/CatalogProvider"

export type Category = { slug: string; name: string; tagline: string; description: string };
export type Collection = { slug: string; name: string; line: string };
export type Finish = { slug: string; name: string; hex: string };
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
};
// Fallback colours for drawings when the finish list isn't at hand
export const FINISH_HEX: Record<string, string> = {
  chrome: "#c9ccd0",
  "brushed-nickel": "#a8a49c",
  "matte-black": "#2a2a2a",
  "brushed-gold": "#c8a46a",
  gunmetal: "#5b5d60",
};

export type Catalog = { categories: Category[]; collections: Collection[]; finishes: Finish[]; products: Product[] };

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
    heroOfCategory: (slug: string) => byCategory(slug)[0] as Product | undefined,
    heroOfCollection: (slug: string) =>
      (byCollection(slug).find((p) => p.category === "bathroom-faucets" || p.category === "kitchen-faucets") ??
        byCollection(slug)[0]) as Product | undefined,
    related: (p: Product, n = 4) =>
      c.products.filter((x) => x.id !== p.id && (x.collection === p.collection || x.category === p.category)).slice(0, n),
  };
}
export type CatalogHelpers = ReturnType<typeof catalogHelpers>;
