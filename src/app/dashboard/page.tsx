
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const { user, loading: authLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Redirect based on role
      if (role === 'admin') {
          router.push('/admin');
          return;
      } else if (role === 'vendor') {
          router.push('/dashboard/vendor');
          return;
      } else {
        router.push('/dashboard/client');
      }
    }
  }, [user, authLoading, role, router]);

  return (
    <div className="container mx-auto py-10 flex flex-col justify-center items-center h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Routing to your dashboard...</p>
    </div>
  );
}
