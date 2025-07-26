
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, redirect to the main login page
        router.push('/login');
      } else if (role !== 'admin') {
        // If logged in but not an admin, redirect to their own dashboard
        router.push('/dashboard');
      }
    }
  }, [user, loading, role, router]);

  if (loading || !user || role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is an admin, render the admin layout and children
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
        {/* Here you could have a dedicated Admin Sidebar and Header */}
        <main className="container py-10">
            {children}
        </main>
    </div>
  );
}
