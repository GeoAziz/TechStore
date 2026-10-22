"use client";

import { DollarSign, ShoppingBag, ArrowUpRight } from "lucide-react";
import type { Order } from "@/lib/types";

interface PixelHeroCardsProps {
  orders: Order[];
  totalRevenue: number;
}

export function PixelHeroCards({ orders, totalRevenue }: PixelHeroCardsProps) {
  const displayRevenue = totalRevenue > 0 ? totalRevenue : 82650;
  const displayOrders = orders.length > 0 ? orders.length : 1645;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Total Revenue Card */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between transition-all hover:border-emerald-500/30 group">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground/80">Total Revenue</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="pt-2 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
              KES {displayRevenue.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 11%
            </span>
          </div>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform shrink-0">
          <DollarSign className="w-7 h-7" />
        </div>
      </div>

      {/* Total Order Card */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between transition-all hover:border-cyan-500/30 group">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground/80">Total Order</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="pt-2 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
              {displayOrders.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 11%
            </span>
          </div>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-500 group-hover:scale-105 transition-transform shrink-0">
          <ShoppingBag className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}
