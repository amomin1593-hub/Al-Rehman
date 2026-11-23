import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/server/db";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cat = await getCatalog();
  const product = cat.products.find((p) => p.id === Number(id));
  if (!product) notFound();
  return <ProductForm catalog={cat} product={product} />;
}
