import { useState } from 'react';
import { UserCircle, LogOut, Settings, Bell, Plus, MessageCircle, Home, Package, Users, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#10102a] font-[Space Mono,Orbitron,monospace] text-cyan-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-cyan-400/20 bg-[#18182c]/90 shadow-[0_0_24px_#00fff7cc]">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold tracking-widest text-cyan-300">ZIZO Admin</span>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.2 }} className="relative">
              <Bell className="h-6 w-6 text-pink-400 animate-pulse cursor-pointer" />
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full px-2 shadow-[0_0_8px_#ff00c8]">3</span>
            </motion.div>
            {/* System status badges */}
            <span className="bg-cyan-400/20 text-cyan-100 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_8px_#00fff7]">All Systems Nominal</span>
          </div>
        </div>
        {/* Profile Icon & Dropdown */}
        <div className="relative">
          <motion.div whileHover={{ scale: 1.1 }}>
            <UserCircle className="h-8 w-8 text-cyan-300 cursor-pointer drop-shadow-[0_0_8px_#00fff7]" onClick={() => setProfileOpen(v => !v)} />
          </motion.div>
          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-[#18182c] border border-cyan-400/30 rounded-lg shadow-xl z-50 p-4 flex flex-col gap-2 neon-glow">
                <div>
                  <button className="flex items-center gap-2 hover:text-cyan-400 transition-colors" onClick={() => setSettingsOpen(true)}>
                    <Settings className="h-5 w-5" /> Profile
                  </button>
                  <button className="flex items-center gap-2 hover:text-pink-400 transition-colors" onClick={() => {/* logout logic */}}>
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex">
        <motion.nav initial={{ x: -40 }} animate={{ x: 0 }} className="w-24 min-h-screen bg-[#18182c]/80 border-r border-cyan-400/20 flex flex-col items-center py-8 gap-8 shadow-[0_0_24px_#00fff7cc]">
          <Link href="/admin" className="group">
            <Home className="h-7 w-7 text-cyan-300 group-hover:text-cyan-400 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-cyan-400">Dashboard</span>
          </Link>
          <Link href="/admin/products" className="group">
            <Package className="h-7 w-7 text-violet-400 group-hover:text-violet-300 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-violet-300">Products</span>
          </Link>
          <Link href="/admin/orders" className="group">
            <BarChart className="h-7 w-7 text-pink-400 group-hover:text-pink-300 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-pink-300">Orders</span>
          </Link>
          <Link href="/admin/users" className="group">
            <Users className="h-7 w-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-cyan-300">Users</span>
          </Link>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1 p-10">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button whileHover={{ scale: 1.2 }} className="fixed bottom-8 right-8 bg-violet-600 text-white rounded-full shadow-[0_0_24px_#7f00ff] p-4 z-50 flex items-center gap-2 animate-bounce hover:bg-violet-400">
        <Plus className="h-6 w-6" />
        <span className="font-bold">Quick Add</span>
      </motion.button>

      {/* AI Assistant Button */}
      <motion.button whileHover={{ scale: 1.1 }} className="fixed bottom-8 left-8 bg-cyan-400 text-[#10102a] rounded-full shadow-[0_0_24px_#00fff7] p-4 z-50 flex items-center gap-2 animate-pulse" onClick={() => setAiOpen(true)}>
        <MessageCircle className="h-6 w-6" />
        <span className="font-bold">AI</span>
      </motion.button>
      <AnimatePresence>
        {aiOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 left-8 bg-[#18182c] border border-cyan-400/30 rounded-xl shadow-2xl p-6 w-96 z-50 neon-glow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-cyan-300">AI Assistant</span>
              <button onClick={() => setAiOpen(false)} className="text-cyan-400 hover:text-pink-400">✕</button>
            </div>
            <div className="text-cyan-100">How can I help you today, Commander?</div>
            {/* Chat UI goes here */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile/Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center">
            <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
              className="bg-[#18182c] border border-cyan-400/30 rounded-2xl shadow-2xl p-10 w-[400px] neon-glow">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">Profile & Settings</h2>
              <div className="text-cyan-100 mb-4">(Profile details and settings form here)</div>
              <button className="bg-cyan-400 text-[#18182c] px-4 py-2 rounded font-bold hover:bg-pink-400 transition-colors" onClick={() => setSettingsOpen(false)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        body { background: #10102a; font-family: 'Space Mono', 'Orbitron', monospace; }
        .neon-glow { box-shadow: 0 0 24px #00fff7cc, 0 0 8px #7f00ff; }
      `}</style>
    </div>
  );
}
