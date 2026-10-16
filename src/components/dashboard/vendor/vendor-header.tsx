"use client";

import { Bell, Calendar, ChevronDown, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface VendorHeaderProps {
  vendorName: string;
  storeName?: string;
  ordersCount: number;
}

export function VendorHeader({ vendorName, storeName, ordersCount }: VendorHeaderProps) {
  const currentDate = format(new Date(), "dd MMM yyyy");

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good day, <span className="text-[#bef264]">{vendorName}</span>!
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-lime-400/10 text-lime-300 border border-lime-400/30">
            <CheckCircle2 className="w-3 h-3 text-[#bef264]" />
            Verified Vendor
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your store overview and live sales today.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        {/* Date Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/90">
          <Calendar className="w-4 h-4 text-[#bef264]" />
          <span>{currentDate}</span>
        </div>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 hover:border-lime-400/40 hover:bg-white/[0.08] flex items-center justify-center text-white/90 transition-all"
          aria-label="Vendor Notifications"
        >
          <Bell className="w-4 h-4" />
          {ordersCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              {ordersCount > 9 ? "9+" : ordersCount}
            </span>
          )}
        </button>

        {/* Store Profile Dropdown Button */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#bef264] to-lime-600 text-black flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(190,242,100,0.4)]">
            {(storeName || vendorName || "V").charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white line-clamp-1 max-w-[120px]">
              {storeName || vendorName}
            </div>
            <div className="text-[10px] text-muted-foreground">Vendor Partner</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
        </div>
      </div>
    </header>
  );
}

