
"use client";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getProducts, getOrders, deleteProduct as serverDeleteProduct, addProduct as serverAddProduct, getUsers, updateProduct as serverUpdateProduct } from '@/lib/firestore-service';
import type { Product, Order, UserProfile, OrderStatus } from '@/lib/types';
import { Loader2, Package, Users, Activity, DollarSign, Warehouse, Edit, Trash2, PlusCircle, UserCircle, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import ProductForm from '@/components/admin/product-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function AdminPage() {
  const { user, loading: authLoading, role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, usersData] = await Promise.all([
        getProducts(),
        getOrders(),
        getUsers(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setUsers(usersData);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch dashboard data.' });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        router.push('/login');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, role, router]);
  
  const handleDeleteProduct = async (productId: string) => {
    if(!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    const result = await serverDeleteProduct(productId);
    if(result.success) {
      toast({ title: 'Success', description: 'Product successfully deleted.'});
      fetchData(); // Refresh data
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const handleProductSubmit = async (productData: Omit<Product, 'id'> | Product) => {
    const isEditing = 'id' in productData;
    const result = isEditing 
        ? await serverUpdateProduct(productData.id, productData) 
        : await serverAddProduct({ ...productData, featured: false, rating: 0 });

    if(result.success) {
        toast({ title: 'Success', description: `Product successfully ${isEditing ? 'updated' : 'added'}.`});
        fetchData();
        if (isEditing) {
            setIsEditDialogOpen(false);
            setEditingProduct(null);
        } else {
            setIsAddDialogOpen(false);
        }
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };
  
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);


  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

  return (
    <>
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
            <Card className="glass-panel">
               <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Products</CardTitle>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10">
                                <PlusCircle className="w-4 h-4 mr-2" /> Add New Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-sm border-primary/20">
                            <DialogHeader>
                                <DialogTitle className="glow-primary">Add New Product</DialogTitle>
                            </DialogHeader>
                            <ProductForm onSubmit={handleProductSubmit} />
                        </DialogContent>
                    </Dialog>
               </CardHeader>
               <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(product => (
                        <TableRow key={product.id} className="hover:bg-primary/5">
                          <TableCell>
                            <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md" />
                          </TableCell>
                          <TableCell className="font-medium text-cyan-200">{product.name}</TableCell>
                          <TableCell>KES {product.price.toLocaleString()}</TableCell>
                          <TableCell>
                             <Badge variant="secondary" className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-400/20 text-green-300 border-green-400/40' : 'bg-red-400/20 text-red-300 border-red-400/40'}`}>
                              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                             </Badge>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                             <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="text-cyan-300 hover:text-cyan-100" onClick={() => openEditDialog(product)}><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="orders">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
             <Card className="glass-panel">
               <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Orders</CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={orderStatusFilter} onValueChange={(value) => setOrderStatusFilter(value as any)}>
                        <SelectTrigger className="w-[180px] bg-card/80">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
               </CardHeader>
               <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map(order => (
                        <TableRow key={order.id} className="hover:bg-primary/5">
                          <TableCell className="font-medium text-primary">{order.id}</TableCell>
                          <TableCell>{order.user}</TableCell>
                          <TableCell>{order.productName}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Processing' ? 'secondary' : 'destructive'} 
                              className={order.status === 'Delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' : order.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : order.status === 'Cancelled' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(order.timestamp).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">KES {order.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="customers">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
                 <Card className="glass-panel">
                    <CardHeader><CardTitle>Manage Customers</CardTitle></CardHeader>
                    <CardContent>
                       <Table>
                          <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                             {users.map(user => (
                               <TableRow key={user.uid} className="hover:bg-primary/5">
                                 <TableCell className="font-medium flex items-center gap-2">
                                    <UserCircle className="w-5 h-5 text-cyan-300" />
                                    {user.displayName || 'N/A'}
                                 </TableCell>
                                 <TableCell>{user.email}</TableCell>
                                 <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className={user.role === 'admin' ? 'bg-accent/20 text-accent border-accent/40' : ''}>
                                        {user.role}
                                    </Badge>
                                 </TableCell>
                                 <TableCell>
                                    <Button variant="ghost" size="sm">View Details</Button>
                                 </TableCell>
                               </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </CardContent>
                 </Card>
            </motion.div>
        </TabsContent>

        <TabsContent value="logs">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
                 <p className="text-muted-foreground text-center py-8">System log viewer coming soon.</p>
            </motion.div>
        </TabsContent>

      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-sm border-primary/20">
          <DialogHeader>
            <DialogTitle className="glow-primary">Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSubmit={handleProductSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

    