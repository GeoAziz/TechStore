"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating and redirecting...</p>
      </div>
    </div>
  );
}
