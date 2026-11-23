"use client";
import Link from "next/link";
import { site, waLink } from "@/lib/site";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow mb-4">Something went wrong</p>
      <h1 className="h-display text-[44px] md:text-[56px]">We couldn&apos;t load this page.</h1>
      <p className="mt-4 max-w-md text-muted">Please try again in a moment, or order directly on WhatsApp.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-dark">Try again</button>
        <a href={waLink(`Assalam o Alaikum, I'd like to order from ${site.name}.`)} target="_blank" rel="noreferrer" className="btn-line">WhatsApp us</a>
        <Link href="/" className="btn-line">Home</Link>
      </div>
    </div>
  );
}
