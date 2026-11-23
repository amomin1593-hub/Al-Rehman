import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopView from "@/components/ShopView";
import { catalogHelpers } from "@/lib/catalog";
import { getCatalog } from "@/lib/server/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { byCollection, getCollection } = catalogHelpers(await getCatalog());

  const c = getCollection((await params).slug);
  return { title: c ? `${c.name} Collection` : "Collection" };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { byCollection, getCollection } = catalogHelpers(await getCatalog());

  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();
  return (
    <ShopView
      eyebrow="Collection"
      title={c.name}
      intro={`${c.line}. Every ${c.name} piece shares the same design language, so your basin, taps and accessories match perfectly.`}
      items={byCollection(c.slug)}
      hideCollection
      crumbs={[{ href: "/collections", label: "Collections" }, { href: `/collections/${c.slug}`, label: c.name }]}
    />
  );
}
