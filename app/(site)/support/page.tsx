import type { Metadata } from "next";
import { SupportLinks } from "@/components/Blocks";
import { pkr, site, waLink } from "@/lib/site";

export const metadata: Metadata = { title: "Support" };

const faqs: { id: string; q: string; a: string }[] = [
  { id: "product", q: "How do I choose the right sink bowl size?", a: "Measure your vanity top and leave at least 5 cm on each side. Our most popular hand-made sizes are 50×40 cm and 55×45 cm. Send us a photo on WhatsApp and we’ll suggest the right fit." },
  { id: "orders", q: "How can I track my order?", a: "Sign in to My Account and open Orders to see each delivery stage. We also send updates on WhatsApp." },
  { id: "delivery", q: "How long does delivery take?", a: `Gujranwala: 1–2 working days. Other cities: 2–5 working days. Delivery is free on orders over ${pkr(site.freeShippingOver)}.` },
  { id: "payment", q: "Which payment methods do you accept?", a: "Cash on Delivery, bank transfer and JazzCash / Easypaisa." },
  { id: "returns", q: "Can I return or exchange an item?", a: "Unused items in original packaging can be exchanged within 7 days of delivery. Ceramic items must be checked at the time of delivery." },
  { id: "installation", q: "Do you offer installation?", a: "We can recommend trusted plumbers in Gujranwala, and every faucet ships with an installation guide." },
  { id: "terms", q: "Terms of sale", a: "Prices are in Pakistani Rupees. Orders are confirmed once we verify them by phone or WhatsApp." },
  { id: "privacy", q: "Privacy policy", a: "We only use your details to process and deliver your order. We never sell your data." },
];

export default function Support() {
  return (
    <div className="container-x pb-24">
      <div className="border-b border-line py-12 md:py-16">
        <p className="eyebrow mb-3">We’re here to help</p>
        <h1 className="h-display text-[48px] md:text-[80px]">Support</h1>
      </div>
      <div className="py-12"><SupportLinks /></div>

      <div className="grid gap-16 border-t border-line pt-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="h-display mb-8 text-[40px]">Frequently asked</h2>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.id} id={f.id} className="group scroll-mt-32 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[16px]">
                  {f.q}
                  <span className="text-2xl font-light transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <aside id="contact" className="scroll-mt-32 lg:col-span-5">
          <div className="bg-ink p-10 text-paper">
            <p className="text-[11px] uppercase tracking-[0.28em] text-paper/60">Contact</p>
            <h2 className="h-display mt-3 text-[40px]">Talk to us</h2>
            <dl className="mt-8 space-y-5 text-[15px]">
              <div><dt className="text-[12px] uppercase tracking-[0.2em] text-paper/50">Phone & WhatsApp</dt><dd className="mt-1"><a href={`tel:+${site.phoneRaw}`}>{site.phone}</a></dd></div>
              <div><dt className="text-[12px] uppercase tracking-[0.2em] text-paper/50">Email</dt><dd className="mt-1"><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
              <div><dt className="text-[12px] uppercase tracking-[0.2em] text-paper/50">Showroom</dt><dd className="mt-1">{site.address}</dd></div>
              <div><dt className="text-[12px] uppercase tracking-[0.2em] text-paper/50">Hours</dt><dd className="mt-1">{site.hours}</dd></div>
            </dl>
            <a href={waLink("Assalam o Alaikum, I need help with an order.")} target="_blank" rel="noreferrer" className="btn-light mt-10 w-full">Chat on WhatsApp</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
