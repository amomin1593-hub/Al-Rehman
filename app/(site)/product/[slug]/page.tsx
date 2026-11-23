import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import { SectionHead } from "@/components/Blocks";
import { catalogHelpers } from "@/lib/catalog";
import { getCatalog } from "@/lib/server/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { getProduct, related } = catalogHelpers(await getCatalog());

  const p = getProduct((await params).slug);
  return { title: p?.name ?? "Product", description: p?.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { getProduct, related } = catalogHelpers(await getCatalog());

  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const rel = related(p);
  return (
    <>
      <ProductDetail product={p} />
      {rel.length > 0 && (
        <section className="container-x border-t border-line py-20">
          <SectionHead eyebrow="Complete the look" title="You may also like" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {rel.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </>
  );
}
