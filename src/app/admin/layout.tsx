
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Package, Users, Activity, Warehouse, PanelLeft, Bot, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { UserCircle } from 'lucide-react';


const navItems = [
    { href: "/admin", icon: Warehouse, label: "Dashboard" },
    // The inventory, orders, etc are tabs inside the dashboard page for now
    // If they become separate pages, they can be added here.
    // { href: "/admin/inventory", icon: Warehouse, label: "Inventory" },
    // { href: "/admin/orders", icon: Package, label: "Orders" },
    // { href: "/admin/customers", icon: Users, label: "Customers" },
    // { href: "/admin/logs", icon: Activity, label: "System Logs" },
];


function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const { user, loading, role, handleLogout } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-primary/20 bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
                    <PanelLeft className="h-6 w-6" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
                <Logo className="h-6 w-auto hidden md:block" />
            </div>

            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <div className="ml-auto flex-1 sm:flex-initial">
                    {/* Search bar could go here */}
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5 text-cyan-300" />
                    <span className="sr-only">Toggle notifications</span>
                </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                           <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || ''} alt="@shadcn" />
                                <AvatarFallback>
                                    <UserCircle className="text-cyan-300"/>
                                </AvatarFallback>
                           </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card/80 backdrop-blur-sm border-primary/20">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.displayName || "Admin User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}


function AdminSidebar() {
    const pathname = usePathname();
    const { isSidebarOpen } = useAuth();

    return (
         <AnimatePresence>
         {isSidebarOpen && (
        <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-40 w-64 border-r border-primary/20 bg-background/90 backdrop-blur-lg md:static md:block md:w-64"
        >
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b border-primary/20 px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Logo className="h-6 w-auto" />
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {navItems.map(item => (
                             <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === item.href ? 'bg-muted text-primary' : ''}`}>
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4">
                     <Button variant="outline" className="w-full">
                        <Bot className="w-4 h-4 mr-2"/> AI Assistant
                     </Button>
                </div>
            </div>
        </motion.aside>
         )}
         </AnimatePresence>
    );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role, isSidebarOpen, setSidebarOpen } = useAuth();
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

  if (loading || !user || role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
        <AdminSidebar />
        <div className="flex flex-col">
            <AdminHeader onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
    </div>
  );
}
