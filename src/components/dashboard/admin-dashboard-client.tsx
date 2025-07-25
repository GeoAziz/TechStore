// This component is created to separate client-side logic from the server-side data fetching.
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Package, Users, Settings, LogOut, DollarSign, Activity, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Order, Product } from '@/lib/types';

const sidebarNav = [
  { title: "Overview", icon: LayoutDashboard, href: "/dashboard/admin", active: true },
  { title: "Orders", icon: Package, href: "#" },
  { title: "Users", icon: Users, href: "#" },
  { title: "System Logs", icon: Activity, href: "#" },
  { title: "Settings", icon: Settings, href: "#" },
];

export default function AdminDashboardClient({ orders, products }: { orders: Order[]; products: Product[] }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, role, router]);

  // Admin actions
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const { db } = await import('@/lib/firebase-admin');
    await db.collection('orders').doc(orderId).update({ status });
  };

  // Edit product
  const handleEditProduct = async (productId: string, updates: Partial<Product>) => {
    const { db } = await import('@/lib/firebase-admin');
    await db.collection('products').doc(productId).update(updates);
  };

  // Add product
  const handleAddProduct = async (product: Product) => {
    const { db } = await import('@/lib/firebase-admin');
    await db.collection('products').add(product);
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    const { db } = await import('@/lib/firebase-admin');
    await db.collection('products').doc(productId).delete();
  };

  // User management
  const handleDeleteUser = async (userId: string) => {
    const { db } = await import('@/lib/firebase-admin');
    await db.collection('users').doc(userId).delete();
  };

  // Analytics, logs, notifications, bulk actions can be similarly structured

  if (loading || !user) {
    return (
      <div className="container py-8 text-center">
        <p>Loading admin data...</p>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold tracking-tighter mb-8 glow-primary">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <Card className="sticky top-24 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="p-4">
              <nav className="flex flex-col space-y-2">
                {sidebarNav.map((item) => (
                  <Link key={item.title} href={item.href}>
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                ))}
                 <Button
                    variant="ghost"
                    className="w-full justify-start mt-4 border-t border-border/10 pt-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="w-4 h-4 text-muted-foreground"/>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
              </Card>
               <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <Package className="w-4 h-4 text-muted-foreground"/>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">+{totalOrders}</div>
                      <p className="text-xs text-muted-foreground">All-time order count</p>
                  </CardContent>
              </Card>
               <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                      <Warehouse className="w-4 h-4 text-muted-foreground"/>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{totalProducts}</div>
                      <p className="text-xs text-muted-foreground">Total unique products</p>
                  </CardContent>
              </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-primary">{order.id}</TableCell>
                      <TableCell>{order.user}</TableCell>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={order.status === 'Delivered' ? 'default' : order.status === 'Processing' ? 'secondary' : 'destructive'}
                          className={order.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' : order.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
