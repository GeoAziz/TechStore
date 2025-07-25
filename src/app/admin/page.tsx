"use client";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Extend the User type to include isAdmin
type UserWithAdmin = {
  isAdmin: boolean;
  [key: string]: any;
};

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const products = [
  { id: 'P-100', name: 'Alienware X17', stock: 5, price: 299999, status: 'Active' },
  { id: 'P-101', name: 'Sony XM6 Headset', stock: 22, price: 34999, status: 'Active' },
];
const orders = [
  { id: 'ORD-001', date: '2025-07-01', status: 'Delivered', total: 129999 },
  { id: 'ORD-002', date: '2025-06-18', status: 'Processing', total: 49999 },
];

export default function AdminPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 glow-primary font-[Orbitron,Space Grotesk,monospace]">Admin Panel</h1>
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-6 bg-[#18182c]/80 border border-cyan-400/20 rounded-xl shadow-[0_0_16px_#00fff733]">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <div className="grid md:grid-cols-2 gap-6">
              {products.map(product => (
                <Card key={product.id} className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733]">
                  <CardContent className="p-6 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-cyan-300">{product.name}</span>
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border-cyan-400/40">{product.status}</Badge>
                    </div>
                    <div className="text-sm text-cyan-100">Stock: {product.stock}</div>
                    <div className="text-lg font-bold text-cyan-200 mt-2">KES {product.price.toLocaleString()}</div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10">Edit</Button>
                      <Button variant="outline" className="border-cyan-400/40 text-red-400 hover:bg-red-400/10">Remove</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="mt-6 border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20">Add Product</Button>
          </motion.div>
        </TabsContent>
        <TabsContent value="orders">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <div className="grid md:grid-cols-2 gap-6">
              {orders.map(order => (
                <Card key={order.id} className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733]">
                  <CardContent className="p-6 flex flex-col gap-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-cyan-300">{order.id}</span>
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border-cyan-400/40">{order.status}</Badge>
                    </div>
                    <div className="text-sm text-cyan-100">Date: {order.date}</div>
                    <div className="text-lg font-bold text-cyan-200 mt-2">KES {order.total.toLocaleString()}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="stats">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733]">
                <CardContent className="p-8 flex flex-col gap-2">
                  <div className="text-2xl font-bold text-cyan-200">2</div>
                  <div className="text-cyan-100">Products</div>
                </CardContent>
              </Card>
              <Card className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733]">
                <CardContent className="p-8 flex flex-col gap-2">
                  <div className="text-2xl font-bold text-cyan-200">2</div>
                  <div className="text-cyan-100">Orders</div>
                </CardContent>
              </Card>
              <Card className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733]">
                <CardContent className="p-8 flex flex-col gap-2">
                  <div className="text-2xl font-bold text-cyan-200">KES 379,998</div>
                  <div className="text-cyan-100">Total Sales</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
