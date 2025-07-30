
// This component is created to separate client-side logic from the server-side data fetching.
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Package, Warehouse, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Order, Product } from '@/lib/types';

const sidebarNav = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard/vendor", active: true },
  { title: "My Products", icon: Warehouse, href: "#" },
  { title: "My Orders", icon: Package, href: "#" },
  { title: "Settings", icon: Settings, href: "#" },
];

export default function VendorDashboardClient({ vendorProducts, vendorOrders, vendorName }: { vendorProducts: Product[], vendorOrders: Order[], vendorName: string }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== 'vendor')) {
      router.push('/login');
    }
  }, [user, loading, role, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="container py-8 text-center">
        <p>Loading vendor data...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold tracking-tighter mb-8 glow-primary">Vendor Dashboard <span className="text-lg text-muted-foreground">({vendorName})</span></h1>
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

        <main className="md:col-span-3 space-y-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>My Products</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right text-primary">{product.price.toFixed(2)} {product.currency}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-primary">{order.id}</TableCell>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={order.status === 'Delivered' ? 'default' : order.status === 'Processing' ? 'secondary' : 'destructive'}
                          className={order.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' : order.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.timestamp}</TableCell>
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
