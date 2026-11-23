import { getCatalog } from "@/lib/server/db";
import { safe } from "@/lib/server/safe";
import ProductsTable from "@/components/admin/ProductsTable";
import AdminProblem, { dbHint } from "@/components/admin/AdminProblem";

export const dynamic = "force-dynamic";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const [[cat, err], sp] = await Promise.all([safe(getCatalog()), searchParams]);
  if (!cat) return <AdminProblem title="Couldn't load products" message={err} hint={dbHint} />;
  return <ProductsTable catalog={cat} initialFilter={sp.filter === "low" ? "low" : "all"} />;
}
