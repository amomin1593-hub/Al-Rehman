import { getCatalog } from "@/lib/server/db";
import { safe } from "@/lib/server/safe";
import BulkImport from "@/components/admin/BulkImport";
import AdminProblem, { dbHint, noCategoriesHint } from "@/components/admin/AdminProblem";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const [cat, err] = await safe(getCatalog());
  if (!cat) return <AdminProblem title="Couldn't load the catalogue" message={err} hint={dbHint} />;
  if (cat.categories.length === 0) return <AdminProblem title="No categories yet" hint={noCategoriesHint} />;
  return <BulkImport catalog={cat} />;
}
