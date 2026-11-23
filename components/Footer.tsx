import Link from "next/link";
import { Logo } from "./Header";
import type { Category } from "@/lib/catalog";
import { site } from "@/lib/site";

export default function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="bg-ink text-paper/75">
      <div className="container-x grid gap-12 py-20 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="text-paper"><Logo light /></div>
          <p className="mt-6 max-w-xs text-[14px] leading-relaxed">
            All types of sanitary ware. Sink bowls, kitchen faucets, Muslim showers, accessory sets and bathroom faucets, delivered across Pakistan.
          </p>
          <div className="mt-8 space-y-1.5 text-[14px]">
            <p>{site.address}</p>
            <p><a href={`tel:+${site.phoneRaw}`} className="hover:text-paper">{site.phone}</a></p>
            <p><a href={`mailto:${site.email}`} className="hover:text-paper">{site.email}</a></p>
          </div>
        </div>

        <FooterCol title="Shop" className="md:col-start-6">
          {categories.map((c) => (
            <li key={c.slug}><Link href={`/shop/${c.slug}`} className="hover:text-paper">{c.name}</Link></li>
          ))}
        </FooterCol>

        <FooterCol title="Order support">
          <li><Link href="/account?tab=orders" className="hover:text-paper">Track your order</Link></li>
          <li><Link href="/support#returns" className="hover:text-paper">Returns & exchanges</Link></li>
          <li><Link href="/support#payment" className="hover:text-paper">Payment methods</Link></li>
          <li><Link href="/support#delivery" className="hover:text-paper">Delivery times</Link></li>
          <li><Link href="/support#contact" className="hover:text-paper">Help & contact</Link></li>
        </FooterCol>

        <FooterCol title="Al-Rehman">
          <li><Link href="/about" className="hover:text-paper">Our company</Link></li>
          <li><Link href="/collections" className="hover:text-paper">Collections</Link></li>
          <li><Link href="/support#installation" className="hover:text-paper">Installation guides</Link></li>
          <li><a href={site.facebook} target="_blank" rel="noreferrer" className="hover:text-paper">Facebook</a></li>
          <li><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-paper">WhatsApp</a></li>
        </FooterCol>
      </div>
      <div className="border-t border-paper/10">
        <div className="container-x flex flex-col justify-between gap-3 py-6 text-[12px] tracking-wide text-paper/50 md:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className="flex gap-6">
            <Link href="/support#terms" className="hover:text-paper">Terms of sale</Link>
            <Link href="/support#privacy" className="hover:text-paper">Privacy policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`md:col-span-2 ${className}`}>
      <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-paper">{title}</p>
      <ul className="space-y-3 text-[14px]">{children}</ul>
    </div>
  );
}
