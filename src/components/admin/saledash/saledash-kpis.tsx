"use client";

import { Package, CheckCircle2, XCircle, TrendingUp, Sparkles } from "lucide-react";
import type { Order, Product } from "@/lib/types";

interface SaledashKpisProps {
  products: Product[];
  orders: Order[];
}

export function SaledashKpis({ products, orders }: SaledashKpisProps) {
  const totalProducts = products.length;
  const completedOrders = orders.filter((o) => o.status === "Delivered" || (o.status as any) === "completed").length;
  const canceledOrders = orders.filter((o) => o.status === "Cancelled" || o.status === "Failed").length;
  const inStockCount = products.filter((p) => p.stock > 0).length;

  const kpis = [
    {
      label: "Total products",
      value: totalProducts.toLocaleString(),
      change: "+2.5%",
      isPositive: true,
      icon: Package,
    },
    {
      label: "Completed order",
      value: completedOrders.toLocaleString(),
      change: "+4.1%",
      isPositive: true,
      icon: CheckCircle2,
    },
    {
      label: "Canceled order",
      value: canceledOrders.toLocaleString(),
      change: canceledOrders > 0 ? "-1.5%" : "0.0%",
      isPositive: canceledOrders === 0,
      icon: XCircle,
    },
    {
      label: "Top products",
      value: inStockCount.toLocaleString(),
      change: "+2.5%",
      isPositive: true,
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-lime-400/30 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground/80">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-headline">
                {kpi.value}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  kpi.isPositive
                    ? "bg-lime-400/10 text-lime-600 dark:text-lime-300 border border-lime-400/20"
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
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

