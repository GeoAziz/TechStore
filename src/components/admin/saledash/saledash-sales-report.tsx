"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import type { Order } from "@/lib/types";

interface SaledashSalesReportProps {
  orders: Order[];
  totalRevenue: number;
}

export function SaledashSalesReport({ orders, totalRevenue }: SaledashSalesReportProps) {
  const [timeRange, setTimeRange] = useState<"1d" | "7d" | "30d" | "16m" | "Max">("7d");
  const [metricType, setMetricType] = useState<"sales" | "orders">("sales");

  const effectiveRevenue = totalRevenue > 0 ? totalRevenue : 4435.70;

  const chartData = [
    { period: "Jan", sales: Math.round(effectiveRevenue * 0.45), orders: 18 },
    { period: "Feb", sales: Math.round(effectiveRevenue * 0.52), orders: 24 },
    { period: "Mar", sales: Math.round(effectiveRevenue * 0.61), orders: 31 },
    { period: "Apr", sales: Math.round(effectiveRevenue * 0.58), orders: 27 },
    { period: "May", sales: Math.round(effectiveRevenue * 0.74), orders: 39 },
    { period: "Jun", sales: Math.round(effectiveRevenue * 0.85), orders: 48 },
    { period: "Jul", sales: Math.round(effectiveRevenue * 0.79), orders: 42 },
    { period: "Aug", sales: Math.round(effectiveRevenue * 0.98), orders: 60 },
    { period: "Sep", sales: Math.round(effectiveRevenue * 0.92), orders: 53 },
    { period: "Oct", sales: Math.round(effectiveRevenue * 1.05), orders: orders.length || 65 },
    { period: "Nov", sales: Math.round(effectiveRevenue * 1.10), orders: 72 },
    { period: "Dec", sales: Math.round(effectiveRevenue * 1.25), orders: 84 },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">Your sales report</h2>
          <p className="text-xs text-muted-foreground">Look at your sales and velocity</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value as any)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-lime-400"
          >
            <option value="sales">Total Sales</option>
            <option value="orders">Total Orders</option>
          </select>
        </div>
      </div>

      {/* Main KPI Stat Display */}
      <div className="flex flex-wrap items-baseline gap-3 my-2">
        <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
          KES {effectiveRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-lime-600 dark:text-lime-300 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/20">
          <ArrowUpRight className="w-3.5 h-3.5" /> +KES {(effectiveRevenue * 0.25).toLocaleString(undefined, { maximumFractionDigits: 0 })} (+2.5%)
        </span>
      </div>

      {/* Time Range Pills */}
      <div className="flex items-center gap-1.5 my-3">
        {(["1d", "7d", "30d", "16m", "Max"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              timeRange === range
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="h-56 sm:h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={150}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="saledashGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a3e635" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#a3e635" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="period"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 rounded-xl bg-card border border-border shadow-xl text-xs space-y-1">
                      <p className="font-bold text-foreground">{label} 2026</p>
                      <p className="text-lime-600 dark:text-lime-300 font-bold font-mono">
                        KES {Number(payload[0].value).toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {payload[0].payload.orders} Transactions
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={metricType === "sales" ? "sales" : "orders"}
              stroke="#a3e635"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#saledashGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

