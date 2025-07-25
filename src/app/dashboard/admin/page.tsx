import AdminDashboardClient from "@/components/dashboard/admin-dashboard-client";
import { getOrders, getProducts } from "@/lib/firestore-service";

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([getOrders(), getProducts()]);

  return <AdminDashboardClient orders={orders} products={products} />;
}
