import { getCatalog } from "@/lib/server/db";
import { safe } from "@/lib/server/safe";
import ProductForm from "@/components/admin/ProductForm";
import AdminProblem, { dbHint, noCategoriesHint } from "@/components/admin/AdminProblem";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const [cat, err] = await safe(getCatalog());
  if (!cat) return <AdminProblem title="Couldn't load the catalogue" message={err} hint={dbHint} />;
  if (cat.categories.length === 0 || cat.collections.length === 0) return <AdminProblem title="No categories yet" hint={noCategoriesHint} />;
  return <ProductForm catalog={cat} />;
}
