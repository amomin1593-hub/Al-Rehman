import { getCatalog } from "@/lib/server/db";
import ProductsTable from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const [cat, sp] = await Promise.all([getCatalog(), searchParams]);
  return <ProductsTable catalog={cat} initialFilter={sp.filter === "low" ? "low" : "all"} />;
}
