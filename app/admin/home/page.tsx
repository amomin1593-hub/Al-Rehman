import { getHome } from "@/lib/server/db";
import { safe } from "@/lib/server/safe";
import HomeEditor from "@/components/admin/HomeEditor";
import AdminProblem, { dbHint } from "@/components/admin/AdminProblem";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [home, err] = await safe(getHome());
  if (!home) return <AdminProblem title="Couldn't load the home page settings" message={err} hint={dbHint} />;
  return <HomeEditor initial={home} />;
}
