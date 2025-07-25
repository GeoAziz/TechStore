import AdminDashboardClient from "@/components/dashboard/admin-dashboard-client";
import { getOrders, getProducts } from "@/lib/firestore-service";
import ParticlesBG from '@/components/particles/particles-bg';

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([getOrders(), getProducts()]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-neon-violet p-8 relative">
      <ParticlesBG />
      <h1 className="text-4xl font-space-mono mb-4 neon-glow">Admin Panel</h1>
      <div className="glass-panel p-6 rounded-xl shadow-neon">
        <p className="text-lg">System monitoring and controls coming soon.</p>
        <ul className="mt-4 text-neon-blue">
          <li>📊 Sales Analytics</li>
          <li>🛠️ Inventory Management</li>
          <li>👥 User Management</li>
        </ul>
      </div>
    </main>
  );
}
