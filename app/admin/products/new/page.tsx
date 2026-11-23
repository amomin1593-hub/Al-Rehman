import { getCatalog } from "@/lib/server/db";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const cat = await getCatalog();
  return <ProductForm catalog={cat} />;
}
