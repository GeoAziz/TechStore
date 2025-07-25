"use client";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    // Replace with real admin check
    if (!user || !user.isAdmin) router.push('/login');
  }, [user, router]);

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-6 glow-primary">Admin Panel</h1>
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="inventory">📦 Inventory</TabsTrigger>
          <TabsTrigger value="orders">🧾 Orders</TabsTrigger>
          <TabsTrigger value="users">👤 Users</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <Card className="p-6 mb-4">Inventory management tools will appear here.</Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card className="p-6 mb-4">Order management tools will appear here.</Card>
        </TabsContent>
        <TabsContent value="users">
          <Card className="p-6 mb-4">User management tools will appear here.</Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
