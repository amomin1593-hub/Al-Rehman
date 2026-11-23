import type { Metadata } from "next";
import ShopView from "@/components/ShopView";
import { getCatalog } from "@/lib/server/db";

export const metadata: Metadata = { title: "Shop all" };

export default async function ShopAll() {
  const { products } = await getCatalog();
  return (
    <ShopView
      eyebrow="The store"
      title="Shop all"
      intro="Sanitary ware and fittings for every bathroom and kitchen, from hand-made sink bowls to complete accessory sets."
      items={products}
      crumbs={[{ href: "/shop", label: "Shop" }]}
    />
  );
}
