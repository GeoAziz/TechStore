import ClientDashboardClient from "@/components/dashboard/client-dashboard-client";
import { getOrdersByUser } from "@/lib/firestore-service";
import { auth } from "@/lib/firebase";

export default async function ClientDashboardPage() {
  // In a real app, you'd get the user from the session, but for server components,
  // we might need a different way to get the current user or pass it down.
  // For this example, we'll assume we can get the email.
  // Note: This is a simplification. Real auth in RSC is more complex.
  const userEmail = auth.currentUser?.email;

  // Fetch orders only if the user email is available.
  const orders = userEmail ? await getOrdersByUser(userEmail) : [];

  return <ClientDashboardClient orders={orders} />;
}
