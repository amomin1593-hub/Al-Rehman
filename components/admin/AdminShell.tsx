"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, ImageIcon, ClipboardList, ExternalLink, LogOut, Menu, X, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { api } from "./ui";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products & stock", icon: Package },
  { href: "/admin/import", label: "Bulk import", icon: FileSpreadsheet },
  { href: "/admin/home", label: "Home page", icon: ImageIcon },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
];

export default function AdminShell({ children, defaultPassword }: { children: React.ReactNode; defaultPassword: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await api("/api/admin/logout", "POST").catch(() => {});
    router.refresh();
  };

  const nav = (
    <nav className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-6 py-6">
        <Image src="/logo-light.png" alt="" width={36} height={36} />
        <span className="leading-none">
          <span className="block font-display text-[20px] text-paper">Al-Rehman</span>
          <span className="text-[9px] uppercase tracking-[0.36em] text-paper/50">Admin</span>
        </span>
      </Link>
      <ul className="mt-4 flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-[14px] transition ${active ? "bg-paper/10 text-paper" : "text-paper/60 hover:text-paper"}`}
              >
                <Icon size={17} strokeWidth={1.4} /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-paper/10 px-3 py-4">
        <a href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 text-[14px] text-paper/60 hover:text-paper">
          <ExternalLink size={17} strokeWidth={1.4} /> View store
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2.5 text-[14px] text-paper/60 hover:text-paper">
          <LogOut size={17} strokeWidth={1.4} /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink lg:block">{nav}</aside>

      <div className="sticky top-0 z-30 flex items-center justify-between bg-ink px-5 py-3 text-paper lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Menu"><Menu size={22} /></button>
        <span className="font-display text-[20px]">Al-Rehman Admin</span>
        <span className="w-6" />
      </div>
      <div className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-64 bg-ink transition-transform ${open ? "" : "-translate-x-full"}`}>
          <button className="absolute right-4 top-6 text-paper" onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button>
          {nav}
        </aside>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
        {defaultPassword && (
          <div className="mb-6 flex items-start gap-3 border border-bronze/40 bg-[#f6efe3] px-4 py-3 text-[13px] text-bronze-dark">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              You are using the default admin password. Before going live, set <b className="font-medium">ADMIN_PASSWORD</b> in <code>.env.local</code> and in Vercel&apos;s Environment Variables.
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
