import { getHome } from "@/lib/server/db";
import HomeEditor from "@/components/admin/HomeEditor";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  return <HomeEditor initial={await getHome()} />;
}
