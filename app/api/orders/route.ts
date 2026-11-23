import { NextResponse } from "next/server";
import { fail, handle } from "@/lib/server/api";
import { createOrder, getCatalog, reduceStock, type Order, type OrderItem } from "@/lib/server/db";
import { site } from "@/lib/site";

// Public: place an order from the checkout page.
// Prices are always taken from the database, never from the browser.
export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json().catch(() => null);
    const c = body?.customer ?? {};
    const lines: { id: number; qty: number; finish: string | null }[] = Array.isArray(body?.items) ? body.items : [];
    const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

    const customer = {
      name: str(c.name, 100),
      phone: str(c.phone, 30),
      email: str(c.email, 120),
      address: str(c.address, 300),
      city: str(c.city, 60),
      province: str(c.province, 60),
      notes: str(c.notes, 500),
    };
    if (!customer.name || !customer.phone || !customer.address || !customer.city) return fail("Please fill in name, phone, address and city");
    if (lines.length === 0 || lines.length > 50) return fail("Your cart is empty");

    const cat = await getCatalog();
    const items: OrderItem[] = [];
    for (const l of lines) {
      const p = cat.products.find((x) => x.id === Number(l.id));
      const qty = Math.min(99, Math.max(1, Math.round(Number(l.qty) || 1)));
      if (!p) return fail("A product in your cart is no longer available. Please refresh.");
      if (p.stock < qty) return fail(p.stock === 0 ? `${p.name} is out of stock` : `Only ${p.stock} of ${p.name} left in stock`);
      const finish = l.finish && p.finishes.includes(l.finish) ? l.finish : null;
      items.push({ product_id: p.id, name: p.name, qty, price: p.price, finish });
    }
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const shipping = subtotal >= site.freeShippingOver ? 0 : 450;
    const payment = ["Cash on Delivery", "Bank Transfer", "JazzCash / Easypaisa"].includes(body.payment) ? body.payment : "Cash on Delivery";

    const order: Order = {
      id: "ART-" + Date.now().toString(36).toUpperCase().slice(-6),
      created_at: new Date().toISOString(),
      status: "Processing",
      payment,
      customer,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
    };
    await createOrder(order);
    await reduceStock(items).catch((e) => console.error("stock update failed", e));
    return NextResponse.json({ ok: true, id: order.id, total: order.total });
  });
}
