import { listOrders, ORDER_STATUSES } from "@/lib/server/db";
import OrdersAdmin from "@/components/admin/OrdersAdmin";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  return <OrdersAdmin orders={await listOrders()} statuses={ORDER_STATUSES} />;
}
