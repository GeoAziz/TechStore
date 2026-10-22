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
import { Calendar, ArrowUp } from "lucide-react";
import type { Order } from "@/lib/types";

interface PixelSalesAnalyticProps {
  orders: Order[];
  totalRevenue: number;
}

export function PixelSalesAnalytic({ orders, totalRevenue }: PixelSalesAnalyticProps) {
  const [selectedMonth, setSelectedMonth] = useState("Jul 2026");

  const revenue = totalRevenue > 0 ? totalRevenue : 48135;
  const income = Math.round(revenue * 0.483);
  const expenses = Math.round(revenue * 0.231);
  const balance = revenue;

  const chartData = [
    { day: "21 July", income: 12000, expenses: 6000 },
    { day: "22 July", income: 18500, expenses: 9000 },
    { day: "23 July", income: 15000, expenses: 7500 },
    { day: "24 July", income: 24000, expenses: 11000 },
    { day: "25 July", income: 32000, expenses: 14000 },
    { day: "26 July", income: 28000, expenses: 12500 },
    { day: "27 July", income: 36000, expenses: 16000 },
    { day: "28 July", income: 42000, expenses: 18000 },
    { day: "29 July", income: 48135, expenses: 19500 },
  ];

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
      {/* Title & Date Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight font-headline">
          Sales Analytic
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by</span>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold pl-8 pr-4 py-2 rounded-xl bg-secondary border border-border text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Jul 2026">Jul 2026</option>
              <option value="Aug 2026">Aug 2026</option>
              <option value="Sep 2026">Sep 2026</option>
              <option value="Oct 2026">Oct 2026</option>
            </select>
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3 Metric Pills: Income, Expenses, Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Income */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Income</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-foreground font-mono">
              KES {income.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              +0.05% <ArrowUp className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Expenses */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Expenses</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-foreground font-mono">
              KES {expenses.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              +0.05% <ArrowUp className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Balance</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-foreground font-mono">
              KES {balance.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              +0.05% <ArrowUp className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Smooth Wave Area Chart */}
      <div className="h-64 sm:h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
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
                      <p className="font-bold text-foreground">{label}</p>
                      <p className="text-emerald-500 font-bold font-mono">
                        Income: KES {Number(payload[0].value).toLocaleString()}
                      </p>
                      {payload[1] && (
                        <p className="text-cyan-500 font-semibold font-mono text-[11px]">
                          Expenses: KES {Number(payload[1].value).toLocaleString()}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#incomeWave)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#expenseWave)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

