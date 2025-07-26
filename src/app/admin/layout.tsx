
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Loader2, Warehouse, PanelLeft, Bot, Bell, Activity, Rocket, User, Settings, LogOut, UploadCloud, Save, UserCircle, PlusCircle, BarChart, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/layout/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AiAssistantOverlay from '@/components/ai-assistant/ai-assistant-overlay';
import { motion } from 'framer-motion';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getOrders, getProducts, getUsers } from '@/lib/firestore-service';


const navItems = [
    { href: "/admin", icon: Warehouse, label: "Dashboard" },
    { href: "/admin/profile", icon: User, label: "Profile" },
];

function FloatingActionButton({ onAddProductClick }: { onAddProductClick: () => void }) {
  const [fabOpen, setFabOpen] = useState(false);
  const router = useRouter();
  
  return (
    <>
    <Tooltip>
        <TooltipTrigger asChild>
             <motion.button
              className="fixed bottom-8 right-8 z-[100] bg-accent/90 hover:bg-accent text-white rounded-full p-4 shadow-neon-accent border-2 border-accent flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => setFabOpen(true)}
              aria-label="Quick Admin Actions"
            >
              <Rocket className="w-7 h-7 animate-pulse" />
            </motion.button>
        </TooltipTrigger>
        <TooltipContent side="left">
            Quick Actions
        </TooltipContent>
    </Tooltip>

    <Dialog open={fabOpen} onOpenChange={setFabOpen}>
        <DialogContent className="bg-card/80 border-accent/40 shadow-neon-accent rounded-2xl">
        <DialogHeader>
            <DialogTitle className="glow-accent">Quick Admin Actions</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className="h-24 flex-col gap-2 border-primary text-primary hover:bg-primary/10" onClick={() => { onAddProductClick(); setFabOpen(false); }}>
                        <PlusCircle className="w-8 h-8"/> Add Product
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Create a new product listing.</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className="h-24 flex-col gap-2 border-accent text-accent hover:bg-accent/10" onClick={() => router.push('/admin#logs')}>
                        <BarChart className="w-8 h-8" /> View Logs
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Review system and error logs.</TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className="h-24 flex-col gap-2 border-secondary text-secondary hover:bg-secondary/10" onClick={() => router.push('/admin#customers')}>
                        <UsersIcon className="w-8 h-8" /> Manage Users
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View and manage customer accounts.</TooltipContent>
            </Tooltip>
        </div>
        </DialogContent>
    </Dialog>
    </>
  );
}

function SystemStatusBar() {
    const [stats, setStats] = useState({ orders: 0, inventory: 0, users: 0, loading: true });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersData, productsData, usersData] = await Promise.all([
                    getOrders(),
                    getProducts(),
                    getUsers(),
                ]);
                setStats({
                    orders: ordersData.length,
                    inventory: productsData.length,
                    users: usersData.length,
                    loading: false,
                });
            } catch (error) {
                console.error("Failed to fetch system stats:", error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

  return (
    <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-background/80 font-mono text-xs">
      <Badge variant="secondary" className="animate-pulse">Online</Badge>
      {stats.loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <>
          <span className="text-cyan-300">Orders: <span className="font-bold">{stats.orders}</span></span>
          <span className="text-violet-400">Inventory: <span className="font-bold">{stats.inventory}</span></span>
          <span className="text-green-400">Users: <span className="font-bold">{stats.users}</span></span>
          <Activity className="w-4 h-4 text-accent animate-pulse" />
        </>
      )}
    </div>
  );
}

function ProfileDialog({onOpenChange}: {onOpenChange: (open: boolean) => void}) {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [imagePreview, setImagePreview] = useState<string | null>(user?.photoURL || null);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setImagePreview(user?.photoURL || null);
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleSave = () => {
    startTransition(async () => {
        try {
            await updateUserProfile({ displayName, photoURL: imagePreview || undefined });
            toast({ title: "Profile Updated", description: "Your changes have been saved." });
            onOpenChange(false);
        } catch (error) {
            toast({ variant: 'destructive', title: "Update Failed", description: "Could not save your profile." });
        }
    });
  }

  return (
    <DialogContent className="bg-card/80 border-accent/40 shadow-neon-accent rounded-2xl">
        <DialogHeader>
            <DialogTitle className="glow-accent">Edit Profile</DialogTitle>
            <DialogDescription>
                Make changes to your admin profile here. Click save when you're done.
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avatar" className="text-right">Avatar</Label>
                <div className="col-span-3 flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={imagePreview || ''} alt={displayName} />
                        <AvatarFallback><UserCircle className="h-12 w-12" /></AvatarFallback>
                    </Avatar>
                     <Label htmlFor="file-upload" className="flex-1 flex flex-col items-center justify-center p-2 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 border-primary/30 hover:border-primary/60">
                        <UploadCloud className="w-6 h-6 mb-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload Image</span>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </Label>
                </div>
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="displayName" className="text-right">Name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" value={user?.email || ''} className="col-span-3" disabled />
            </div>
        </div>
        <DialogFooter>
            <Button onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                 Save Changes
            </Button>
        </DialogFooter>
    </DialogContent>
  );
}


function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, handleLogout } = useAuth();
  const router = useRouter();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-primary/20 bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Link href="/" className="hidden md:flex items-center gap-2 font-semibold">
          <Logo className="h-6 w-auto" />
        </Link>
      </div>
      
      <SystemStatusBar />

      <div className="flex-grow"></div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5 text-cyan-300 animate-pulse" />
                  <span className="sr-only">Toggle notifications</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
       
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <motion.button whileHover={{ scale: 1.1 }} className="rounded-full neon-glow p-0.5">
                               <Avatar>
                                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Admin'} />
                                  <AvatarFallback>
                                     <UserCircle className="h-8 w-8 text-cyan-300" />
                                  </AvatarFallback>
                               </Avatar>
                            </motion.button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        Profile & Settings
                    </TooltipContent>
                </Tooltip>
                 <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName || 'Admin'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Full Profile</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => setIsProfileDialogOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Quick Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ProfileDialog onOpenChange={setIsProfileDialogOpen} />
        </Dialog>
      </div>
    </header>
  );
}

function AdminSidebar({isSidebarOpen, setSidebarOpen}) {
  const pathname = usePathname();
  
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-primary/20 bg-background/90 backdrop-blur-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b border-primary/20 px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-auto" />
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-mono font-bold">
            {navItems.map((item, index) => (
              <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * (index + 1) }}>
                <Link href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-accent hover:bg-accent/10 ${pathname === item.href ? 'bg-muted text-primary neon-glow' : 'text-muted-foreground'}`}>
                  <item.icon className="h-5 w-5 neon-glow" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
            <Bot className="w-4 h-4 mr-2 animate-pulse" /> AI Assistant
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role, isSidebarOpen, setSidebarOpen, handleAddProductClick } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, role, router]);

  const pathname = usePathname();
  
  useEffect(() => {
    if(isSidebarOpen && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname, isSidebarOpen, setSidebarOpen]);

  if (loading || !user || role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full bg-background text-foreground">
        <div className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
        
        <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
       
        <div className={`flex flex-col transition-all duration-300 ease-in-out md:pl-64`}>
          <AdminHeader onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        
        <FloatingActionButton onAddProductClick={handleAddProductClick} />

        <AiAssistantOverlay />
      </div>
    </TooltipProvider>
  );
}
