
"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Line, LineChart, ResponsiveContainer } from "recharts";
import type { Product, Order, UserProfile } from "@/lib/types";
import { useMemo } from "react";
import { subDays, format } from 'date-fns';

const COLORS = ['#7DF9FF', '#9F00FF', '#00F5D4', '#FF00A8', '#A8FF00', '#FF5733'];

export default function AnalyticsCharts({ products, orders, users }: { products: Product[], orders: Order[], users: UserProfile[] }) {

  const salesData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), i);
        return { date: format(date, 'MMM dd'), total: 0 };
    }).reverse();

    orders.forEach(order => {
        const orderDate = new Date(order.timestamp);
        const dateStr = format(orderDate, 'MMM dd');
        const entry = last30Days.find(d => d.date === dateStr);
        if (entry) {
            entry.total += order.total;
        }
    });

    return last30Days;
  }, [orders]);
  
  const newUsersData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), i);
        return { date: format(date, 'MMM dd'), count: 0 };
    }).reverse();

    users.forEach(user => {
      // Use the correct property name from UserProfile, e.g. 'createdAt'
      const registeredDate = user.createdAt; // Use the correct property name from UserProfile for registration date
      if (registeredDate) {
        const userDate = new Date(registeredDate);
        const dateStr = format(userDate, 'MMM dd');
        const entry = last30Days.find(d => d.date === dateStr);
        if (entry) {
            entry.count++;
        }
      }
    });

    return last30Days;
  }, [users]);

  const categoryData = useMemo(() => {
    const categoryCounts = products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [products]);
  
  const chartConfig: ChartConfig = useMemo(() => {
      const config: ChartConfig = {};
      categoryData.forEach((item, index) => {
          config[item.name] = {
              label: item.name,
              color: COLORS[index % COLORS.length]
          };
      });
      return config;
  }, [categoryData]);

  const barChartConfig: ChartConfig = {
      count: {
          label: 'New Users',
          color: 'hsl(var(--accent))',
      },
  };
   const lineChartConfig: ChartConfig = {
      total: {
          label: 'Sales',
          color: 'hsl(var(--primary))',
      },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Sales Over Last 30 Days</CardTitle>
          <CardDescription>Total revenue from orders placed in the last month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
             <ChartContainer config={lineChartConfig}>
               <LineChart data={salesData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} tickFormatter={(value) => `KES ${Number(value) / 1000}k`}/>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>Distribution of products across all categories.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="h-[300px]">
               <ChartContainer config={chartConfig}>
                    <PieChart accessibilityLayer>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                    </PieChart>
                </ChartContainer>
            </div>
        </CardContent>
      </Card>
      
      <Card className="glass-panel col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>New Users Over Last 30 Days</CardTitle>
           <CardDescription>Number of new user registrations per day.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
             <ChartContainer config={barChartConfig}>
               <BarChart data={newUsersData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} fontSize={12} allowDecimals={false}/>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
