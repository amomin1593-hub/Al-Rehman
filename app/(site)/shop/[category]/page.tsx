import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopView from "@/components/ShopView";
import { catalogHelpers } from "@/lib/catalog";
import { getCatalog } from "@/lib/server/db";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { byCategory, getCategory } = catalogHelpers(await getCatalog());

  const c = getCategory((await params).category);
  return { title: c?.name ?? "Shop" };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { byCategory, getCategory } = catalogHelpers(await getCatalog());

  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  return (
    <ShopView
      eyebrow={c.tagline}
      title={c.name}
      intro={c.description}
      items={byCategory(c.slug)}
      hideCategory
      crumbs={[{ href: "/shop", label: "Shop" }, { href: `/shop/${c.slug}`, label: c.name }]}
    />
  );
}
