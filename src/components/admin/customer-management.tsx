
"use client";

import { useState, useMemo, useTransition } from 'react';
import type { Order, UserProfile, UserRole } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trash2, MoreHorizontal, Search, UserCircle, Shield, FileText, Mail } from 'lucide-react';
import { updateUserRole as serverUpdateUserRole, deleteUser as serverDeleteUser, deleteMultipleUsers, updateUserProfile, getOrdersByUserId } from '@/lib/firestore-service';

export default function CustomerManagement({ initialUsers, onDataChange }: { initialUsers: UserProfile[], onDataChange: () => void }) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Component state
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Dialog states
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false);
  const [viewingUserOrders, setViewingUserOrders] = useState<Order[]>([]);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchMatch = searchTerm ?
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const roleMatch = roleFilter === 'all' || user.role === roleFilter;
      return searchMatch && roleMatch;
    });
  }, [users, searchTerm, roleFilter]);

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    if (!currentUser) return;
    startTransition(async () => {
      const result = await serverUpdateUserRole(userId, newRole, currentUser.uid, currentUser.email || '');
      if (result.success) {
        toast({ title: 'Success', description: "User role has been updated." });
        onDataChange();
        setIsEditUserDialogOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };
  
  const handleUpdateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    const result = await updateUserProfile(userId, data);
    if(result.success) {
      toast({title: "Profile Updated"});
      onDataChange();
    } else {
       toast({variant: 'destructive', title: "Update Failed"});
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (!currentUser) return;
    startTransition(async () => {
      const result = await serverDeleteUser(userId, currentUser.uid, currentUser.email || '');
      if (result.success) {
        toast({ title: 'Success', description: 'User has been deleted.' });
        onDataChange();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const handleBulkDeleteUsers = async () => {
    if (!currentUser) return;
    const result = await deleteMultipleUsers(selectedUsers, currentUser.uid, currentUser.email || '');
    if (result.success) {
      toast({ title: 'Success', description: `${selectedUsers.length} users deleted.` });
      setSelectedUsers([]);
      onDataChange();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }

  const openViewUserDialog = async (user: UserProfile) => {
    setEditingUser(user);
    setIsViewUserDialogOpen(true);
    const orders = await getOrdersByUserId(user.uid);
    setViewingUserOrders(orders);
  };
  
  const openEditUserDialog = (user: UserProfile) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
      <Card className="glass-panel">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Manage Customers</CardTitle>
            <CardDescription>Total: {filteredUsers.length} customers</CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[250px] bg-card/80"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
              <SelectTrigger className="w-full md:w-[150px] bg-card/80">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="product_manager">Product Manager</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedUsers.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {selectedUsers.length} selected users. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDeleteUsers}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={(checked) => {
                      setSelectedUsers(checked ? filteredUsers.map(u => u.uid) : [])
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.uid} className="hover:bg-primary/5">
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.uid)}
                      onCheckedChange={(checked) => {
                        setSelectedUsers(
                          checked ? [...selectedUsers, user.uid] : selectedUsers.filter(id => id !== user.uid)
                        )
                      }}
                      disabled={user.uid === currentUser?.uid}
                    />
                  </TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName} />
                      <AvatarFallback><UserCircle className="w-5 h-5 text-cyan-300" /></AvatarFallback>
                    </Avatar>
                    {user.displayName || 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className={user.role === 'admin' ? 'bg-accent/20 text-accent border-accent/40' : ''}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <Button variant="outline" size="sm" onClick={() => openViewUserDialog(user)}>
                        View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
        {/* View User Dialog */}
        <Dialog open={isViewUserDialogOpen} onOpenChange={setIsViewUserDialogOpen}>
            <DialogContent className="max-w-3xl bg-card/80 backdrop-blur-sm border-primary/20">
                <DialogHeader>
                    <DialogTitle className="glow-primary text-2xl">Customer Details</DialogTitle>
                    <DialogDescription>
                        Viewing profile and order history for {editingUser?.email}.
                    </DialogDescription>
                </DialogHeader>
                {editingUser && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <div className="md:col-span-1 space-y-4">
                            <Card className="glass-panel text-center p-4">
                                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-accent shadow-neon-accent">
                                    <AvatarImage src={editingUser.photoURL || ''} alt={editingUser.displayName} />
                                    <AvatarFallback><UserCircle className="w-16 h-16" /></AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold text-xl">{editingUser.displayName || 'N/A'}</h3>
                                <p className="text-sm text-muted-foreground">{editingUser.email}</p>
                                <Badge variant={editingUser.role === 'admin' ? 'destructive' : 'secondary'} className="mt-2">{editingUser.role}</Badge>
                            </Card>
                             <Button className="w-full" onClick={() => { setIsViewUserDialogOpen(false); openEditUserDialog(editingUser); }}>
                                <Shield className="mr-2 h-4 w-4"/> Change Role
                             </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" className="w-full" disabled={editingUser.uid === currentUser?.uid}>
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete User
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the user account.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(editingUser.uid)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                             </AlertDialog>
                        </div>
                        <div className="md:col-span-2">
                             <Card className="glass-panel">
                                 <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><FileText /> Order History</CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                     <ScrollArea className="h-72">
                                        {viewingUserOrders.length > 0 ? (
                                             <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Order</TableHead>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {viewingUserOrders.map(order => (
                                                        <TableRow key={order.id}>
                                                            <TableCell className="font-medium text-primary">{order.id.substring(0,8)}</TableCell>
                                                            <TableCell>{new Date(order.timestamp).toLocaleDateString()}</TableCell>
                                                            <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                                                            <TableCell className="text-right">KES {order.total.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                             </Table>
                                        ) : (
                                            <p className="text-muted-foreground text-center py-8">No orders found for this user.</p>
                                        )}
                                     </ScrollArea>
                                 </CardContent>
                             </Card>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>


      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-sm border-primary/20">
          <DialogHeader>
            <DialogTitle className="glow-primary">Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.email}. Be careful with admin privileges.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="py-4">
              <Select defaultValue={editingUser.role} onValueChange={(value) => handleUpdateUserRole(editingUser.uid, value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="product_manager">Product Manager</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditUserDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
