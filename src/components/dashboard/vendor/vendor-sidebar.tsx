"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Tag,
  Percent,
  Store,
  Smartphone,
  Plus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/layout/logo";

interface VendorSidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  pendingOrdersCount?: number;
  onLogout: () => void;
}

export function VendorSidebar({
  activeSection,
  onSelectSection,
  pendingOrdersCount = 0,
  onLogout,
}: VendorSidebarProps) {
  const mainMenu = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag, badge: pendingOrdersCount },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "marketing", label: "Marketing", icon: Tag },
    { id: "discounts", label: "Discounts", icon: Percent },
  ];

  const salesChannels = [
    { id: "online-store", label: "Online store", icon: Store },
    { id: "point-of-sale", label: "Point of sale", icon: Smartphone },
  ];

  return (
    <aside className="w-full lg:w-64 lg:shrink-0 flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md">
      <div>
        {/* Brand Logo & Back to Store */}
        <div className="pb-6 mb-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-6 w-auto" />
            </Link>
            <Link
              href="/shop"
              className="text-[11px] font-semibold text-[#bef264] hover:underline flex items-center gap-1"
            >
              <span>Store</span>
              <span>→</span>
            </Link>
          </div>
          <div className="mt-2 text-[11px] font-mono text-muted-foreground uppercase tracking-widest pl-1">
            Vendor Portal
          </div>
        </div>

        {/* Main Menu Section */}
        <div className="space-y-1 mb-8">
          <div className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 px-3">
            Main Menu
          </div>
          {mainMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#bef264] text-black font-extrabold shadow-[0_0_15px_rgba(190,242,100,0.4)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-white/70"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? "bg-black text-white" : "bg-rose-500 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Sales Channels */}
        <div className="space-y-1 mb-8">
          <div className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 px-3">
            Sales Channel
          </div>
          {salesChannels.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <Icon className="w-4 h-4 text-white/70" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Connected Apps / Channels */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2 px-3">
            Integrations
          </div>
          <div className="px-3.5 py-2 flex items-center gap-2.5 text-xs text-white/80">
            <span className="w-2 h-2 rounded-full bg-[#bef264]" />
            <span>TechStore Live Catalog</span>
          </div>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-[#bef264] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Channel</span>
          </button>
        </div>
      </div>

      {/* Logout button at bottom */}
      <div className="pt-6 mt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Vendor Portal</span>
        </button>
      </div>
    </aside>
  );
}

