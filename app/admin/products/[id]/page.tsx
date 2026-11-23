import { getCatalog } from "@/lib/server/db";
import { safe } from "@/lib/server/safe";
import ProductForm from "@/components/admin/ProductForm";
import AdminProblem, { dbHint } from "@/components/admin/AdminProblem";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cat, err] = await safe(getCatalog());
  if (!cat) return <AdminProblem title="Couldn't load the product" message={err} hint={dbHint} />;
  const product = cat.products.find((p) => p.id === Number(id));
  if (!product) return <AdminProblem title="Product not found" hint="It may have been deleted." />;
  return <ProductForm catalog={cat} product={product} />;
}
