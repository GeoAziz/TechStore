"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import ParticlesBG from '@/components/particles/particles-bg';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

const orders = [
  { id: 'ORD-001', date: '2025-07-01', status: 'Delivered', total: 129999, items: 2 },
  { id: 'ORD-002', date: '2025-06-18', status: 'Processing', total: 49999, items: 1 },
];
const wishlist = [
  { id: 'P-100', name: 'Alienware X17', price: 299999 },
  { id: 'P-101', name: 'Sony XM6 Headset', price: 34999 },
];
const profile = {
  name: 'Commander Zizo',
  email: 'zizo@techverse.com',
  joined: '2024-11-12',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 glow-primary font-[Orbitron,Space Grotesk,monospace]">User Dashboard</h1>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-6 bg-[#18182c]/80 border border-cyan-400/20 rounded-xl shadow-[0_0_16px_#00fff733]">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
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
                    <div className="text-sm text-cyan-100">Items: {order.items}</div>
                    <div className="text-lg font-bold text-cyan-200 mt-2">KES {order.total.toLocaleString()}</div>
                    <Button variant="outline" className="mt-3 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Download Invoice
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="wishlist">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <div className="grid md:grid-cols-2 gap-6">
              {wishlist.map(item => (
                <Card key={item.id} className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733]">
                  <CardContent className="p-6 flex flex-col gap-2">
                    <div className="font-bold text-cyan-300">{item.name}</div>
                    <div className="text-lg font-bold text-cyan-200">KES {item.price.toLocaleString()}</div>
                    <Button variant="outline" className="mt-2 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10">Remove</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <Card className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733] max-w-lg mx-auto">
              <CardContent className="p-8 flex flex-col gap-4">
                <div className="text-2xl font-bold text-cyan-200">{profile.name}</div>
                <div className="text-cyan-100">Email: {profile.email}</div>
                <div className="text-cyan-100">Joined: {profile.joined}</div>
                <Button variant="outline" className="mt-2 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10">Edit Profile</Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
