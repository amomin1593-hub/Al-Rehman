import { listOrders, ORDER_STATUSES } from "@/lib/server/db";
import { safe } from "@/lib/server/safe";
import OrdersAdmin from "@/components/admin/OrdersAdmin";
import AdminProblem, { dbHint } from "@/components/admin/AdminProblem";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const [orders, err] = await safe(listOrders());
  if (!orders) return <AdminProblem title="Couldn't load orders" message={err} hint={dbHint} />;
  return <OrdersAdmin orders={orders} statuses={ORDER_STATUSES} />;
}
