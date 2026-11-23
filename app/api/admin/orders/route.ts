import { NextResponse } from "next/server";
import { adminOnly, fail } from "@/lib/server/api";
import { ORDER_STATUSES, setOrderStatus } from "@/lib/server/db";

// Update an order's status: { id, status }
export async function PATCH(req: Request) {
  return adminOnly(async () => {
    const { id, status } = await req.json();
    if (!ORDER_STATUSES.includes(status)) return fail("Unknown status");
    await setOrderStatus(String(id), status);
    return NextResponse.json({ ok: true });
  });
}
