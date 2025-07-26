import AdminDashboardClient from "@/components/dashboard/admin-dashboard-client";
import { getOrders, getProducts } from "@/lib/firestore-service";

// This page is now a wrapper for the main /admin page and can be removed or repurposed.
// For now, it just demonstrates the original structure.
export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([getOrders(), getProducts()]);

  return <AdminDashboardClient orders={orders} products={products} />;
}
