"use client";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useTransition } from 'react';
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getProducts, getOrders, deleteProduct as serverDeleteProduct, addProduct as serverAddProduct, getUsers, updateProduct as serverUpdateProduct, deleteUser as serverDeleteUser, updateUserRole as serverUpdateUserRole } from '@/lib/firestore-service';
import type { Product, Order, UserProfile, OrderStatus, UserRole } from '@/lib/types';
import { Loader2, Package, Users, Activity, DollarSign, Warehouse, Edit, Trash2, PlusCircle, UserCircle, Filter, MoreHorizontal, Shield, Send } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import ProductForm from '@/components/admin/product-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AnalyticsCharts from '@/components/admin/analytics-charts';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { ProductCategory } from '@/lib/types';
import { deleteMultipleProducts, updateOrderStatus, getAuditLogs } from '@/lib/firestore-service';
import CustomerManagement from '@/components/admin/customer-management';

const categoryData = [
  { name: 'Electronics' },
  { name: 'Computers' },
  { name: 'Accessories' },
  { name: 'Phones' },
  { name: 'Gaming' },
];

const getCustomerAuditLogs = () => [];

export default function AdminPage({ defaultTab = "overview" }: { defaultTab?: string } = {}) {
  const { user: currentUser, loading: authLoading, role, isAddProductDialogOpen, setAddProductDialogOpen } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const [productCategoryFilter, setProductCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orderDateRange, setOrderDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({ from: undefined, to: undefined });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');

  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdateUserRole = async () => {
    if (!editingUser) return;
    await serverUpdateUserRole(editingUser.uid, selectedRole, currentUser?.uid || '', currentUser?.email || '');
    setIsEditUserDialogOpen(false);
    setEditingUser(null);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, usersData, logsData] = await Promise.all([
        getProducts(),
        getOrders(),
        getUsers(),
        getAuditLogs()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setUsers(usersData);
      setAuditLogs(logsData);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch dashboard data.' });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (currentUser && role === 'admin') {
        fetchData();
      }
    }
  }, [currentUser, authLoading, role]);
  
  useEffect(() => {
    setAuditLogs(getCustomerAuditLogs());
  }, [users]);

  const handleDeleteProduct = async (productId: string) => {
    if(!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    if (!currentUser) return;
    try {
      const result = await serverDeleteProduct(productId, currentUser.uid, currentUser.email || '');
      if(result.success) {
        setActionStatus({ type: 'success', message: 'Product successfully deleted.' });
        toast({ title: 'Success', description: 'Product successfully deleted.'});
        fetchData(); 
      } else {
        setActionStatus({ type: 'error', message: result.message });
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Unexpected error occurred.' });
      // Monitoring/logging hook: send error to n8n or external service
      // logErrorToMonitoringService(err)
      toast({ variant: 'destructive', title: 'Error', description: 'Unexpected error occurred.' });
    }
  }
  
  const handleBulkDeleteProducts = async () => {
     if (!currentUser) return;
     try {
       const result = await deleteMultipleProducts(selectedProducts, currentUser.uid, currentUser.email || '');
       if(result.success) {
          setActionStatus({ type: 'success', message: `${selectedProducts.length} products deleted.` });
          toast({ title: 'Success', description: `${selectedProducts.length} products deleted.`});
          setSelectedProducts([]);
          fetchData();
       } else {
          setActionStatus({ type: 'error', message: result.message });
          toast({ variant: 'destructive', title: 'Error', description: result.message });
       }
     } catch (err) {
       setActionStatus({ type: 'error', message: 'Unexpected error occurred.' });
       // Monitoring/logging hook: send error to n8n or external service
       // logErrorToMonitoringService(err)
       toast({ variant: 'destructive', title: 'Error', description: 'Unexpected error occurred.' });
     }
  }
  
  const handleProductSubmit = async (productData: Omit<Product, 'id'> | Product) => {
    if (!currentUser) return;
    const isEditing = 'id' in productData;
    try {
      const result = isEditing 
          ? await serverUpdateProduct(productData.id, productData, currentUser.uid, currentUser.email || '') 
          : await serverAddProduct({ ...productData, isFeatured: false } as Omit<Product, 'id'>, currentUser.uid, currentUser.email || '');

      if(result.success) {
          setActionStatus({ type: 'success', message: `Product successfully ${isEditing ? 'updated' : 'added'}.` });
          toast({ title: 'Success', description: `Product successfully ${isEditing ? 'updated' : 'added'}.`});
          fetchData();
          if (isEditing) {
              setIsEditDialogOpen(false);
              setEditingProduct(null);
          } else {
              setAddProductDialogOpen(false);
          }
      } else {
          setActionStatus({ type: 'error', message: result.message });
          toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Unexpected error occurred.' });
      // Monitoring/logging hook: send error to n8n or external service
      // logErrorToMonitoringService(err)
      toast({ variant: 'destructive', title: 'Error', description: 'Unexpected error occurred.' });
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => productCategoryFilter === 'all' || p.category === productCategoryFilter);
  }, [products, productCategoryFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
        const statusMatch = orderStatusFilter === 'all' || order.status === orderStatusFilter;
        const dateMatch = !orderDateRange?.from || (
            new Date(order.timestamp) >= orderDateRange.from &&
            (!orderDateRange.to || new Date(order.timestamp) <= orderDateRange.to)
        );
        return statusMatch && dateMatch;
    });
  }, [orders, orderStatusFilter, orderDateRange]);

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
     if (!currentUser) return;
     const result = await updateOrderStatus(orderId, status, currentUser.uid, currentUser.email || '');
     if(result.success) {
        toast({ title: 'Success', description: 'Order status updated.'});
        fetchData();
     } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
     }
  };

  const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

  // Real-time polling for orders and audit logs
  useEffect(() => {
    if (!authLoading && currentUser && role === 'admin') {
      const interval = setInterval(() => {
        fetchData();
      }, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [authLoading, currentUser, role]);

  // WebSocket client for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    if (typeof window !== 'undefined') {
      // Use wss://yourdomain:4001 in production, ws://localhost:4001 in development
      const wsUrl = process.env.NODE_ENV === 'production'
        ? 'wss://yourdomain.com:4001'
        : 'ws://localhost:4001';
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'order' || data.type === 'log') {
          fetchData(); // Refresh data on update
          toast({ title: 'Real-time Update', description: data.message || 'Order/log updated.' });
        }
      };
      ws.onopen = () => {
        console.log('WebSocket connected');
      };
      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    }
    return () => {
      if (ws) ws.close();
    };
  }, []);


  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Restrict non-admin users
  if (!authLoading && currentUser && role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Shield className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-lg text-muted-foreground">You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-6 glow-primary font-['Orbitron',_monospace]">Admin Dashboard</motion.h1>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6 bg-[#18182c]/80 border border-cyan-400/20 rounded-xl shadow-[0_0_16px_#00fff733]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory"><Warehouse className="mr-2"/>Inventory</TabsTrigger>
          <TabsTrigger value="orders"><Package className="mr-2"/>Orders</TabsTrigger>
          <TabsTrigger value="customers"><Users className="mr-2"/>Customers</TabsTrigger>
          <TabsTrigger value="logs"><Activity className="mr-2"/>System Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
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
                          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                          <Users className="w-4 h-4 text-muted-foreground"/>
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">{users.length}</div>
                          <p className="text-xs text-muted-foreground">Total registered users</p>
                      </CardContent>
                  </Card>
              </motion.div>
              <AnalyticsCharts orders={orders} users={users} products={products} />
        </TabsContent>

        <TabsContent value="inventory">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <Card className="glass-panel">
               <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1" role="heading" aria-level={2}>Manage Products</h2>
                    <CardDescription>Total: {filteredProducts.length} products</CardDescription>
                  </div>
                   <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        {selectedProducts.length > 0 ? (
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedProducts.length})
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <DialogDescription>
                                          This will permanently delete {selectedProducts.length} selected products. This action cannot be undone.
                                      </DialogDescription>
                                  </AlertDialogHeader>
                                  <DialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleBulkDeleteProducts}>Continue</AlertDialogAction>
                                  </DialogFooter>
                              </AlertDialogContent>
                           </AlertDialog>
                        ) : (
                          <Select value={productCategoryFilter} onValueChange={(value) => setProductCategoryFilter(value as any)}>
                              <SelectTrigger className="w-full md:w-[180px] bg-card/80">
                                  <SelectValue placeholder="Filter by category" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">All Categories</SelectItem>
                                  {categoryData.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                        )}
                        <Dialog open={isAddProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
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
                   </div>
               </CardHeader>
               <CardContent>
                 {filteredProducts.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-12 text-center">
                     <Package className="w-12 h-12 text-muted-foreground mb-4" />
                     <h3 className="text-xl font-bold mb-2">No products found</h3>
                     <p className="text-muted-foreground mb-4">Start by adding a new product to your inventory.</p>
                   </div>
                 ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                           <Checkbox
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            role="checkbox"
                            aria-label="Select all products"
                            onCheckedChange={(checked) => {
                                setSelectedProducts(checked ? filteredProducts.map(p => p.id) : [])
                            }}
                           />
                        </TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map(product => (
                        <TableRow key={product.id} className="hover:bg-primary/5">
                          <TableCell>
                            <Checkbox 
                              checked={selectedProducts.includes(product.id)}
                              role="checkbox"
                              aria-label={`Select product ${product.name}`}
                              onCheckedChange={(checked) => {
                                setSelectedProducts(
                                    checked ? [...selectedProducts, product.id] : selectedProducts.filter(id => id !== product.id)
                                )
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Image src={product.imageUrl || '/test-fallback.png'} alt={product.name} width={40} height={40} className="rounded-md" />
                          </TableCell>
                          <TableCell className="font-medium text-cyan-200">{product.name}</TableCell>
                          <TableCell>KES {product.price.toLocaleString()}</TableCell>
                          <TableCell>
                             <Badge variant="secondary" className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-400/20 text-green-300 border-green-400/40' : 'bg-red-400/20 text-red-300 border-red-400/40'}`}>
                              {product.stock > 0 ? `In Stock (${product.stock})` : <span aria-label="out-of-stock">Out of Stock</span>}
                             </Badge>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                             <div className="flex gap-2">
                              <Button aria-label="Edit" variant="ghost" size="icon" className="text-cyan-300 hover:text-cyan-100" onClick={() => openEditDialog(product)}><Edit className="w-4 h-4" /></Button>
                              <Button aria-label="Delete" variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                 )}
               </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="orders" id="orders">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
             <Card className="glass-panel">
               <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Manage Orders</CardTitle>
                    <CardDescription>Total: {filteredOrders.length} orders</CardDescription>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className="w-full md:w-[300px] justify-start text-left font-normal bg-card/80"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {orderDateRange?.from ? (
                            orderDateRange.to ? (
                                <>
                                {format(orderDateRange.from, "LLL dd, y")} -{" "}
                                {format(orderDateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(orderDateRange.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date range</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={orderDateRange?.from}
                            selected={orderDateRange}
                            onSelect={(range) => setOrderDateRange(range ?? { from: undefined, to: undefined })}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    <Select value={orderStatusFilter} onValueChange={(value) => setOrderStatusFilter(value as any)}>
                        <SelectTrigger className="w-full md:w-[180px] bg-card/80">
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
                          <TableCell className="font-medium text-primary">{order.id.substring(0,8)}...</TableCell>
                          <TableCell>{order.user}</TableCell>
                          <TableCell>{order.productName}</TableCell>
                          <TableCell>
                            <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order.id, value as OrderStatus)}>
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
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

        <TabsContent value="customers" id="customers">
            <CustomerManagement initialUsers={users} onDataChange={fetchData} />
        </TabsContent>

        <TabsContent value="logs" id="logs">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
            <Card className="glass-panel">
              <CardHeader><CardTitle>System Audit Logs</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target Type</TableHead>
                      <TableHead>Target ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.adminEmail}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell><Badge variant="outline">{log.targetType}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{log.targetId.substring(0,12)}...</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

      </Tabs>

      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-sm border-primary/20">
          <DialogHeader>
            <DialogTitle className="glow-primary">Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.email}. Be careful with admin privileges.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="flex flex-col gap-4 mt-4">
              <Select value={selectedRole} onValueChange={value => setSelectedRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button onClick={handleUpdateUserRole}>Save</Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      {/* Status feedback UI */}
      {actionStatus && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg ${actionStatus.type === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
          {actionStatus.message}
        </div>
      )}
    </div>
  );
}

/**
 * Documentation: API contract for n8n webhook
 * POST /api/order-webhook
 * Payload: { orderId, userId, products, total, ... }
 * Response: { success: boolean, message: string }
 * Documentation: Real-time polling implemented for admin dashboard. For production, consider websockets or server-sent events for efficiency.
 * Documentation: WebSocket client added for true real-time updates. Connects to ws://localhost:4001 in development and wss://yourdomain.com:4001 in production.
 * Production Step: To enable secure WebSocket (wss://), obtain a trusted SSL certificate (e.g., Let's Encrypt), set SSL_KEY_PATH and SSL_CERT_PATH in your environment, and update your frontend WebSocket URL to use wss://yourdomain.com:4001.
 */
