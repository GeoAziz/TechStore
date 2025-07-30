
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2, Download, HeartCrack, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getOrdersByUser, getWishlist, getProductsByIds, toggleWishlist as serverToggleWishlist } from '@/lib/firestore-service';
import type { Order, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ClientDashboardPage() {
  const { user, loading: authLoading, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'client') {
        router.push('/login');
        return;
      }
      
      const fetchData = async () => {
        setLoading(true);
        if (user.email) {
          try {
            const [ordersData, wishlistIds] = await Promise.all([
              getOrdersByUser(user.email),
              getWishlist(user.uid),
            ]);
            setOrders(ordersData);

            if (wishlistIds.length > 0) {
              const wishlistProducts = await getProductsByIds(wishlistIds);
              setWishlist(wishlistProducts);
            } else {
              setWishlist([]);
            }

          } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load dashboard data." });
          }
        }
        setLoading(false);
      };

      fetchData();
    }
  }, [user, authLoading, role, router, toast]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;
    const result = await serverToggleWishlist(user.uid, productId);
    if (result.success) {
        setWishlist(prev => prev.filter(item => item.id !== productId));
        toast({ title: 'Success', description: result.message });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const profile = {
    name: user?.displayName || 'Commander Zizo',
    email: user?.email || 'zizo@techverse.com',
    joined: user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '2024-11-12',
  };

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
            {orders.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                {orders.map(order => (
                    <Card key={order.id} className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733]">
                    <CardContent className="p-6 flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-cyan-300">{order.id}</span>
                        <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border-cyan-400/40">{order.status}</Badge>
                        </div>
                        <div className="text-sm text-cyan-100">Date: {new Date(order.timestamp).toLocaleDateString()}</div>
                        <div className="text-sm text-cyan-100">Product: {order.productName}</div>
                        <div className="text-lg font-bold text-cyan-200 mt-2">KES {order.total.toLocaleString()}</div>
                        <Button variant="outline" className="mt-3 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download Invoice
                        </Button>
                    </CardContent>
                    </Card>
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-8">You have no past orders.</p>
            )}
          </motion.div>
        </TabsContent>
        <TabsContent value="wishlist">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
             {wishlist.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                {wishlist.map(item => (
                    <Card key={item.id} className="border border-cyan-400/20 bg-[#10102a]/80 rounded-xl shadow-[0_0_12px_#00fff733]">
                    <CardContent className="p-6 flex flex-col gap-2">
                        <div className="font-bold text-cyan-300">{item.name}</div>
                        <div className="text-lg font-bold text-cyan-200">KES {item.price.toLocaleString()}</div>
                        <div className="flex gap-2 mt-2">
                            <Button variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10" asChild>
                                <Link href={`/product/${item.id}`}>View Item</Link>
                            </Button>
                             <Button variant="outline" className="border-red-400/40 text-red-300 hover:bg-red-400/10" onClick={() => handleRemoveFromWishlist(item.id)}>Remove</Button>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
             ) : (
                <div className="text-center py-16">
                    <HeartCrack className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold">Your Wishlist is Empty</h2>
                    <p className="text-muted-foreground mt-2 mb-6">You haven't added any products yet. Start exploring!</p>
                    <Button asChild>
                        <Link href="/shop">
                            <ShoppingCart className="mr-2" /> Start Shopping
                        </Link>
                    </Button>
                </div>
             )}
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

