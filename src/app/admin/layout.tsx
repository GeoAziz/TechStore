
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Warehouse, PanelLeft, Bot, Bell, Activity, Rocket } from 'lucide-react';
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
import { UserCircle, Settings, LogOut } from 'lucide-react';
import AiAssistantOverlay from '@/components/ai-assistant/ai-assistant-overlay';
import { motion } from 'framer-motion';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const navItems = [
    { href: "/admin", icon: Warehouse, label: "Dashboard" },
];


function FloatingActionButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="fixed bottom-8 right-8 z-[100] bg-accent/90 hover:bg-accent text-white rounded-full p-4 shadow-neon-accent border-2 border-accent flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
      aria-label="Quick Admin Actions"
    >
      <Rocket className="w-7 h-7 animate-pulse" />
    </motion.button>
  );
}

function SystemStatusBar() {
  return (
    <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-background/80 font-mono text-xs">
      <Badge variant="secondary" className="animate-pulse">Online</Badge>
      <span className="text-cyan-300">Orders: <span className="font-bold">128</span></span>
      <span className="text-violet-400">Inventory: <span className="font-bold">42</span></span>
      <span className="text-green-400">Users: <span className="font-bold">12</span></span>
      <Activity className="w-4 h-4 text-accent animate-spin" />
    </div>
  );
}

function ProfileDialog({ open, onOpenChange, user }: { open: boolean, onOpenChange: (v: boolean) => void, user: any }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/80 border-accent/40 shadow-neon-accent rounded-2xl">
        <DialogHeader>
          <DialogTitle className="glow-accent">Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <UserCircle className="w-10 h-10 text-cyan-300" />
            <div>
              <div className="font-bold text-cyan-200">{user?.displayName || 'Admin User'}</div>
              <div className="text-muted-foreground text-xs">{user?.email}</div>
            </div>
          </div>
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">Edit Profile</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, handleLogout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
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
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5 text-cyan-300 animate-pulse" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button variant="ghost" size="icon" className="rounded-full neon-glow" onClick={() => setProfileOpen(true)}>
                <UserCircle className="h-8 w-8 text-cyan-300" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            Profile & Settings
          </TooltipContent>
        </Tooltip>
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} user={user} />
        <Button variant="ghost" size="icon" className="rounded-full neon-glow" onClick={handleLogout}>
          <LogOut className="h-6 w-6 text-accent" />
        </Button>
      </div>
    </header>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useAuth();
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
            {navItems.map(item => (
              <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
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
  const { user, loading, role, isSidebarOpen, setSidebarOpen } = useAuth();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);
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
      <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
        <div className={`fixed inset-0 z-30 bg-black/60 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
        <div className="hidden md:block">
           <AdminSidebar />
        </div>
       
        <div className="flex flex-col md:pl-[256px]">
          <AdminHeader onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
          <FloatingActionButton onClick={() => setFabOpen(true)} />
          {/* Modal for quick admin actions */}
          <Dialog open={fabOpen} onOpenChange={setFabOpen}>
            <DialogContent className="bg-card/80 border-accent/40 shadow-neon-accent rounded-2xl">
              <DialogHeader>
                <DialogTitle className="glow-accent">Quick Admin Actions</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">Add Product</Button>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">View Logs</Button>
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">Manage Users</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <AiAssistantOverlay />
      </div>
       {/* Mobile Sidebar */}
       <div className="md:hidden">
          <AdminSidebar />
       </div>
    </TooltipProvider>
  );
}
