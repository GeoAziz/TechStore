// This component is created to separate client-side logic from the server-side data fetching.
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Package, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  getWishlist,
  toggleWishlist as serverToggleWishlist,
  updateUserProfile,
  cancelOrder as serverCancelOrder,
  reorder as serverReorder,
} from '@/lib/firestore-service';

const sidebarNav = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "My Orders", icon: Package, href: "/dashboard/client", active: true },
  { title: "Settings", icon: "#" },
];

export default function ClientDashboardClient({ orders }: { orders: Order[] }) {
  const { toast } = useToast();
  // Lazy loading state
  const [visibleOrders, setVisibleOrders] = useState<number>(10);
  const handleLoadMore = () => setVisibleOrders((v: number) => v + 10);

  // Sci-Fi Assistant modal state
  const [showAssistant, setShowAssistant] = useState<boolean>(false);

  // AI assistant state (moved to top-level)
  const [assistantInput, setAssistantInput] = useState<string>('');
  const [assistantReply, setAssistantReply] = useState<string>('');
  const [assistantLoading, setAssistantLoading] = useState<boolean>(false);
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (role && role !== 'client'))) {
      router.push('/login');
    }
  }, [user, loading, role, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };
  
  // New: Modal state for order details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  // Wishlist state and actions
  const [wishlist, setWishlist] = useState<string[]>([]);
  useEffect(() => {
    async function fetchWishlist() {
      if (!user) return;
      const fetchedWishlist = await getWishlist(user.uid);
      setWishlist(fetchedWishlist);
    }
    fetchWishlist();
  }, [user]);

  const handleToggleWishlist = async (productId: string) => {
    if (!user) return;
    const result = await serverToggleWishlist(user.uid, productId);
    if (result.success) {
      setWishlist(result.wishlist || []);
      toast({ title: 'Success', description: result.message });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  // Profile state and actions
  const [profile, setProfile] = useState<{ name: string; email: string; address: string }>({ name: user?.displayName || '', email: user?.email || '', address: '' });
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  
  const handleProfileSave = async () => {
    if (!user) return;
    setEditingProfile(false);
    const result = await updateUserProfile(user.uid, { displayName: profile.name, address: profile.address });
    if(result.success) {
      toast({ title: "Profile Updated", description: "Your details have been saved." });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  // Cancel order action
  const handleCancelOrder = async (orderId: string) => {
    const result = await serverCancelOrder(orderId);
    if (result.success) {
      toast({ title: "Order Cancelled" });
      setShowDetails(false);
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  // Reorder action
  const handleReorder = async (orderId: string) => {
    const result = await serverReorder(orderId);
    if(result.success) {
      toast({ title: "Reordered!", description: `New order ${result.newOrderId} has been created.`});
      setShowDetails(false);
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  // Invoice download action (simulate PDF)
  const handleDownloadInvoice = async (orderId: string) => {
    setDownloading(true);
    // Simulate backend PDF generation
    setTimeout(() => {
      window.open(`/api/invoice/${orderId}`, '_blank');
      setDownloading(false);
    }, 1200);
  };
  
  if (loading || !user) {
    return (
      <div className="container py-8 text-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 relative">
      <h1 className="text-4xl font-bold tracking-tighter mb-8 glow-primary">Client Dashboard</h1>
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
              {/* Wishlist Management */}
              <div className="mt-8">
                <h2 className="font-bold mb-2">Wishlist</h2>
                <ul className="mb-2">
                  {wishlist.length === 0 ? <li className="text-muted-foreground">No items in wishlist.</li> : wishlist.map((item: string) => (
                    <li key={item} className="flex justify-between items-center mb-1">
                      <span>{item}</span>
                      <Button size="sm" variant="destructive" onClick={() => handleToggleWishlist(item)}>Remove</Button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Profile Settings */}
              <div className="mt-8">
                <h2 className="font-bold mb-2">Profile</h2>
                {editingProfile ? (
                  <form onSubmit={e => { e.preventDefault(); handleProfileSave(); }} className="flex flex-col gap-2">
                    <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="px-2 py-1 rounded" placeholder="Name" />
                    <input type="text" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} className="px-2 py-1 rounded" placeholder="Address" />
                    <Button type="submit" size="sm" variant="secondary">Save</Button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div>Name: {profile.name}</div>
                    <div>Email: {profile.email}</div>
                    <div>Address: {profile.address || <span className="text-muted-foreground">Not set</span>}</div>
                    <Button size="sm" variant="outline" onClick={() => setEditingProfile(true)}>Edit Profile</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3">
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, visibleOrders).map((order) => (
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
                      <TableCell>{new Date(order.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedOrder(order); setShowDetails(true); }}>Details</Button>
                        {order.status === 'Processing' && <Button size="sm" variant="destructive" onClick={() => handleCancelOrder(order.id)}>Cancel</Button>}
                        <Button size="sm" variant="secondary" onClick={() => handleReorder(order.id)}>Reorder</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(order.id)} disabled={downloading}>{downloading ? '...' : 'Invoice'}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {visibleOrders < orders.length && (
                <div className="flex justify-center mt-6">
                  <Button size="lg" variant="secondary" onClick={handleLoadMore}>Load More</Button>
                </div>
              )}
              {/* Order Details Modal */}
              {showDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                  <div className="bg-card p-8 rounded-xl shadow-neon w-full max-w-lg relative">
                    <Button className="absolute top-2 right-2" size="sm" variant="ghost" onClick={() => setShowDetails(false)}>Close</Button>
                    <h2 className="text-2xl font-bold mb-4">Order Details</h2>
                    <div className="mb-2">Order ID: {selectedOrder.id}</div>
                    <div className="mb-2">Product: {selectedOrder.productName}</div>
                    <div className="mb-2">Status: {selectedOrder.status}</div>
                    <div className="mb-2">Total: KES {selectedOrder.total}</div>
                    <div className="mb-2">Date: {new Date(selectedOrder.timestamp).toLocaleString()}</div>
                    <div className="mb-2">Shipping: <span className="text-muted-foreground">Tracking info coming soon</span></div>
                    <div className="flex gap-2 mt-4">
                      {selectedOrder.status === 'Processing' && <Button size="sm" variant="destructive" onClick={() => handleCancelOrder(selectedOrder.id)}>Cancel Order</Button>}
                      <Button size="sm" variant="secondary" onClick={() => handleReorder(selectedOrder.id)}>Reorder</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(selectedOrder.id)} disabled={downloading}>{downloading ? 'Downloading...' : 'Download Invoice'}</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      {/* Sci-Fi Assistant Floating Button */}
      <Button
        className="fixed bottom-8 right-8 z-50 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 transition-transform"
        size="icon"
        style={{ width: 64, height: 64, fontSize: 32 }}
        onClick={() => setShowAssistant(true)}
        aria-label="Open AI Assistant"
      >
        🧠
      </Button>
      {/* Sci-Fi Assistant Modal */}
      {showAssistant && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-2xl shadow-neon w-full max-w-md relative">
            <Button className="absolute top-2 right-2" size="sm" variant="ghost" onClick={() => setShowAssistant(false)}>Close</Button>
            <h2 className="text-2xl font-bold mb-4 glow-primary">Sci-Fi AI Assistant</h2>
            <p className="mb-4 text-muted-foreground">How can I help you today? Ask about your orders, products, or get futuristic shopping tips!</p>
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (!assistantInput.trim()) return;
                setAssistantLoading(true);
                setAssistantReply('');
                try {
                  const res = await fetch('/api/ai-assistant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: assistantInput })
                  });
                  const data = await res.json();
                  setAssistantReply(data.reply || 'No response.');
                } catch {
                  setAssistantReply('AI backend error.');
                }
                setAssistantLoading(false);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                className="w-full p-2 rounded border mb-4"
                placeholder="Type your question..."
                value={assistantInput}
                onChange={e => setAssistantInput(e.target.value)}
                disabled={assistantLoading}
              />
              <Button className="w-full" variant="secondary" type="submit" disabled={assistantLoading}>
                {assistantLoading ? 'Thinking...' : 'Send'}
              </Button>
            </form>
            <div className="mt-4 text-sm text-accent font-mono min-h-[2em]">{assistantReply}</div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
}
