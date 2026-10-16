"use client";

import { Package, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import type { Order, Product } from "@/lib/types";

interface VendorKpisProps {
  products: Product[];
  orders: Order[];
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
  };
}

export function VendorKpis({ products, orders }: VendorKpisProps) {
  const totalProducts = products.length;
  const completedOrders = orders.filter((o) => o.status === "Delivered").length;
  const canceledOrders = orders.filter((o) => o.status === "Cancelled" || o.status === "Failed").length;
  const activeStock = products.filter((p) => p.stock > 0).length;

  const kpis = [
    {
      label: "Total products",
      value: totalProducts,
      change: "+2.5%",
      isPositive: true,
      icon: Package,
    },
    {
      label: "Completed order",
      value: completedOrders,
      change: "+4.1%",
      isPositive: true,
      icon: CheckCircle2,
    },
    {
      label: "Canceled order",
      value: canceledOrders,
      change: canceledOrders > 0 ? "-1.2%" : "0.0%",
      isPositive: canceledOrders === 0,
      icon: XCircle,
    },
    {
      label: "In-stock listings",
      value: activeStock,
      change: "+3.8%",
      isPositive: true,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-lime-400/30 backdrop-blur-md transition-all group hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-white/90 transition-colors">
                {kpi.label}
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 group-hover:text-[#bef264] group-hover:border-lime-400/30 transition-all">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                {kpi.value.toLocaleString()}
              </span>
              <span
                className={`text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  kpi.isPositive
                    ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
