"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PanelLeft, Rocket, Bell, UserCircle, LogOut, Activity, Bot, Warehouse
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
} from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/layout/logo';
// import AiAssistantOverlay from '@/components/ai-assistant/ai-assistant-overlay';
import { Loader2 } from 'lucide-react';

const navItems = [
  { href: "/admin", icon: Warehouse, label: "Dashboard" },
  // Add more links here
];

function AdminSidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-primary/20 bg-background/90 backdrop-blur-lg transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-primary/20 px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-auto" />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-4 text-sm font-mono font-bold">
          {navItems.map(item => (
            <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Link href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-accent hover:bg-accent/10 ${pathname === item.href ? 'bg-muted text-primary neon-glow' : 'text-muted-foreground'}`}>
                <item.icon className="h-5 w-5 neon-glow" />
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="p-4">
          <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
            <Bot className="w-4 h-4 mr-2 animate-pulse" /> AI Assistant
          </Button>
        </div>
      </div>
    </aside>
  );
}

function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, handleLogout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.photoURL || '');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = [
    { id: 1, text: 'New order received', time: '2m ago' },
    { id: 2, text: 'Inventory low: RAM', time: '10m ago' },
    { id: 3, text: 'User registered: vendor@demo.com', time: '1h ago' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-primary/20 bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
          <PanelLeft className="h-6 w-6" />
        </Button>
        <Link href="/" className="hidden md:flex items-center gap-2 font-semibold">
          <Logo className="h-6 w-auto" />
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-4 px-4 py-2 font-mono text-xs">
        <Badge variant="secondary" className="animate-pulse">Online</Badge>
        <span className="text-cyan-300">Orders: <span className="font-bold">128</span></span>
        <span className="text-violet-400">Inventory: <span className="font-bold">42</span></span>
        <span className="text-green-400">Users: <span className="font-bold">12</span></span>
        <Activity className="w-4 h-4 text-accent animate-spin" />
      </div>
      <div className="flex-grow" />
      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-cyan-300 animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card/80 border-accent/40 shadow-neon-accent rounded-xl w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map(n => (
              <DropdownMenuItem key={n.id} className="flex justify-between text-xs">
                <span>{n.text}</span>
                <span className="text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button variant="ghost" size="icon" className="rounded-full neon-glow" onClick={() => setProfileOpen(true)}>
                <UserCircle className="h-8 w-8 text-cyan-300" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>Profile & Settings</TooltipContent>
        </Tooltip>
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="bg-card/80 border-accent/40 shadow-neon-accent rounded-2xl">
            <DialogHeader>
              <DialogTitle className="glow-accent">Profile Settings</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={avatar} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  {editMode ? (
                    <>
                      <input value={name} onChange={e => setName(e.target.value)} className="bg-background border rounded px-2 py-1 text-cyan-200" />
                      <input value={email} onChange={e => setEmail(e.target.value)} className="bg-background border rounded px-2 py-1 text-cyan-200 mt-1" />
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-cyan-200">{name}</div>
                      <div className="text-muted-foreground text-xs">{email}</div>
                    </>
                  )}
                </div>
              </div>
              {editMode ? (
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" onClick={() => setEditMode(false)}>Save</Button>
              ) : (
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10" onClick={() => setEditMode(true)}>Edit Profile</Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="icon" className="rounded-full neon-glow" onClick={handleLogout} aria-label="Logout">
          <LogOut className="h-6 w-6 text-accent" />
        </Button>
      </div>
    </header>
  );
}

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

function LocalAiAssistantOverlay() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'How can I help you today, Commander?' }
  ]);
  const [input, setInput] = useState('');
  return (
    <>
      <Button className="fixed bottom-8 left-8 z-[100] bg-accent/90 hover:bg-accent text-white rounded-full p-4 shadow-neon-accent border-2 border-accent flex items-center justify-center animate-pulse" onClick={() => setOpen(true)} aria-label="AI Assistant">
        <Bot className="w-7 h-7" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card/80 border-accent/40 shadow-neon-accent rounded-2xl w-96">
          <DialogHeader>
            <DialogTitle className="glow-accent">AI Assistant</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 h-64 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`text-sm ${msg.from === 'ai' ? 'text-accent' : 'text-primary'}`}>{msg.text}</div>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); setMessages([...messages, { from: 'user', text: input }, { from: 'ai', text: 'Roger that!' }]); setInput(''); }}>
            <input value={input} onChange={e => setInput(e.target.value)} className="w-full bg-background border rounded px-2 py-1 text-cyan-200" placeholder="Type your command..." aria-label="AI Command" />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ThemeSwitcher() {
  const [theme, setTheme] = useState('dark');
  return (
    <div className="fixed top-8 right-8 z-[100]">
      <Button variant="outline" className="border-accent text-accent" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Switch Theme">
        {theme === 'dark' ? '🌑' : '🌕'} Theme
      </Button>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, role, isSidebarOpen, setSidebarOpen } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && role !== 'admin') router.push('/dashboard');
  }, [user, loading, role]);

  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  if (loading || !user || role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
        <AdminSidebar isOpen={isSidebarOpen} />
        <div className="flex flex-col md:pl-[256px]">
          <AdminHeader onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
          <FloatingActionButton onClick={() => setFabOpen(true)} />
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
        <LocalAiAssistantOverlay />
      </div>
      <ThemeSwitcher />
    </TooltipProvider>
  );
}
