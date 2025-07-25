"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import ParticlesBG from '@/components/particles/particles-bg';

export default function DashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait for auth state to be determined
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (role) {
      switch (role) {
        case 'admin':
          router.replace('/dashboard/admin');
          break;
        case 'vendor':
          router.replace('/dashboard/vendor');
          break;
        case 'client':
        default:
          router.replace('/dashboard/client');
          break;
      }
    }
  }, [user, role, loading, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-neon-blue p-8 relative">
      <ParticlesBG />
      <h1 className="text-4xl font-space-mono mb-4 neon-glow">Client Dashboard</h1>
      <div className="glass-panel p-6 rounded-xl shadow-neon">
        <p className="text-lg">Welcome to your dashboard. Order tracking and stats coming soon.</p>
        <ul className="mt-4 text-neon-violet">
          <li>🛒 Recent Orders</li>
          <li>📦 Shipping Status</li>
          <li>💳 Payment Methods</li>
        </ul>
      </div>
    </main>
  );
}
