"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Wrench, PackageCheck, PlayCircle } from "lucide-react";

export function SectionHead({ eyebrow, title, href, linkText }: { eyebrow?: string; title: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="h-display text-[38px] md:text-[54px]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group hidden shrink-0 items-center gap-2 text-[12px] uppercase tracking-[0.2em] md:flex">
          <span className="link-u">{linkText ?? "Show more"}</span>
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export function SupportLinks() {
  const items = [
    { icon: Wrench, title: "Product support", text: "Help choosing the right size, finish and fittings for your space.", href: "/support#product" },
    { icon: PackageCheck, title: "Order support", text: "Track an order, request an exchange or ask about delivery.", href: "/support#orders" },
    { icon: PlayCircle, title: "Installation guides", text: "Step-by-step videos and guides for your plumber.", href: "/support#installation" },
  ];
  return (
    <div className="grid border-t border-line md:grid-cols-3">
      {items.map(({ icon: Icon, title, text, href }) => (
        <Link key={title} href={href} className="group border-b border-line py-10 md:border-b-0 md:border-r md:px-10 md:first:pl-0 md:last:border-r-0">
          <Icon size={26} strokeWidth={1.1} />
          <h3 className="mt-6 font-display text-[28px]">{title}</h3>
          <p className="mt-2 max-w-xs text-[14px] text-muted">{text}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em]">
            Find out more <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function Newsletter() {
  const [done, setDone] = useState(false);
  const [agree, setAgree] = useState(false);
  return (
    <section className="bg-sand">
      <div className="container-x grid gap-10 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="eyebrow mb-3">Newsletter</p>
          <h2 className="h-display text-[38px] md:text-[54px]">New arrivals, first.</h2>
          <p className="mt-4 max-w-md text-[15px] text-muted">Be the first to hear about new collections, trade prices and seasonal offers.</p>
        </div>
        {done ? (
          <p className="self-center font-display text-3xl">Thank you. You’re on the list.</p>
        ) : (
          <form
            className="self-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (agree) setDone(true); // TODO: insert into Supabase `newsletter` table
            }}
          >
            <div className="flex border-b border-ink">
              <input required type="email" placeholder="Your email address" className="flex-1 bg-transparent py-4 text-[16px] outline-none placeholder:text-muted" />
              <button className="text-[12px] uppercase tracking-[0.2em] disabled:opacity-40" disabled={!agree}>Subscribe</button>
            </div>
            <label className="mt-4 flex items-start gap-3 text-[13px] text-muted">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-ink" />
              I agree to receive emails from Al-Rehman Traders and accept the privacy policy.
            </label>
          </form>
        )}
      </div>
    </section>
  );
}
