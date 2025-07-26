
"use client";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getProducts, getOrders } from '@/lib/firestore-service';
import type { Product, Order } from '@/lib/types';
import { Loader2, Package, Users, Activity, DollarSign, Warehouse } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading, role } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        router.push('/login');
      } else {
        const fetchData = async () => {
          setLoading(true);
          const [productsData, ordersData] = await Promise.all([
            getProducts(),
            getOrders()
          ]);
          setProducts(productsData);
          setOrders(ordersData);
          setLoading(false);
        };
        fetchData();
      }
    }
  }, [user, authLoading, role, router]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div className="container mx-auto py-10">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-6 glow-primary font-['Orbitron',_monospace]">Admin Control Deck</motion.h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-primary">KES {totalSales.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All-time sales</p>
              </CardContent>
          </Card>
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="w-4 h-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">+{orders.length}</div>
                  <p className="text-xs text-muted-foreground">All-time order count</p>
              </CardContent>
          </Card>
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                  <Warehouse className="w-4 h-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">Total unique products</p>
              </CardContent>
          </Card>
      </motion.div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-6 bg-[#18182c]/80 border border-cyan-400/20 rounded-xl shadow-[0_0_16px_#00fff733]">
          <TabsTrigger value="inventory"><Warehouse className="mr-2"/>Inventory</TabsTrigger>
          <TabsTrigger value="orders"><Package className="mr-2"/>Orders</TabsTrigger>
          <TabsTrigger value="customers"><Users className="mr-2"/>Customers</TabsTrigger>
          <TabsTrigger value="logs"><Activity className="mr-2"/>System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="glass-panel card-glow">
                  <CardContent className="p-6 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-cyan-300">{product.name}</span>
                      <Badge variant="secondary" className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-400/20 text-green-300 border-green-400/40' : 'bg-red-400/20 text-red-300 border-red-400/40'}`}>{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</Badge>
                    </div>
                    <div className="text-lg font-bold text-cyan-200 mt-2">{product.price.toLocaleString()} {product.currency}</div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10">Edit</Button>
                      <Button variant="outline" className="border-red-400/40 text-red-400 hover:bg-red-400/10">Remove</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="mt-6 border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20">Add New Product</Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="orders">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <Card key={order.id} className="glass-panel card-glow">
                  <CardContent className="p-6 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-cyan-300">{order.id}</span>
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border-cyan-400/40">{order.status}</Badge>
                    </div>
                    <div className="text-sm text-cyan-100">Date: {new Date(order.timestamp).toLocaleDateString()}</div>
                     <div className="text-sm text-cyan-100">User: {order.user}</div>
                    <div className="text-lg font-bold text-cyan-200 mt-2">{order.total.toLocaleString()} KES</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="customers">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
                 <p className="text-muted-foreground text-center py-8">Customer management interface coming soon.</p>
            </motion.div>
        </TabsContent>

        <TabsContent value="logs">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
                 <p className="text-muted-foreground text-center py-8">System log viewer coming soon.</p>
            </motion.div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
