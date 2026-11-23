import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import AdminLogin from "@/components/admin/AdminLogin";
import { isAdmin, usingDefaultPassword } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) return <AdminLogin />;
  return <AdminShell defaultPassword={usingDefaultPassword}>{children}</AdminShell>;
}
