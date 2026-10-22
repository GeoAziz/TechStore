"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Check, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import type { Order } from "@/lib/types";

interface SaledashTransactionsProps {
  orders: Order[];
}

export function SaledashTransactions({ orders }: SaledashTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const filteredOrders = orders.filter((order) => {
    const idMatch = (order.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const customerMatch = (order.user || order.userId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const itemsMatch = order.items?.some((i) =>
      (i.productName || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) || (order.productName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return idMatch || customerMatch || itemsMatch;
  });

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-lime-400/10 text-lime-600 dark:text-lime-300 border-lime-400/30";
      case "processing":
      case "pending":
        return "bg-sky-400/10 text-sky-600 dark:text-sky-300 border-sky-400/30";
      case "cancelled":
      case "failed":
        return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">Last transaction</h3>
          <p className="text-xs text-muted-foreground">Recent buyer orders, settlements, and platforms</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-lime-400 w-44 sm:w-56"
            />
          </div>

          <button
            type="button"
            className="p-2 rounded-xl bg-secondary border border-border hover:bg-muted text-foreground transition-colors"
            title="Filter orders"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-semibold">
              <th className="py-3 px-3 w-10">
                <input
                  type="checkbox"
                  checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                  onChange={toggleSelectAll}
                  className="rounded border-border accent-lime-400 cursor-pointer"
                  aria-label="Select all orders"
                />
              </th>
              <th className="py-3 px-3 font-medium">Order ID</th>
              <th className="py-3 px-3 font-medium">Item / Summary</th>
              <th className="py-3 px-3 font-medium">Date</th>
              <th className="py-3 px-3 font-medium">Price</th>
              <th className="py-3 px-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredOrders.length > 0 ? (
              filteredOrders.slice(0, 7).map((order) => {
                const isSelected = selectedOrders.includes(order.id);
                const firstItem = order.items?.[0]?.productName || order.productName || "Tech Hardware Module";
                const itemCount = order.items?.length || 1;
                const orderAny = order as any;
                const formattedDate = orderAny.createdAt?.seconds
                  ? format(new Date(orderAny.createdAt.seconds * 1000), "dd/MM/yyyy")
                  : orderAny.orderDate
                  ? format(new Date(orderAny.orderDate), "dd/MM/yyyy")
                  : "12/02/2026";

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-muted/40 transition-colors ${isSelected ? "bg-muted/60" : ""}`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="rounded border-border accent-lime-400 cursor-pointer"
                        aria-label={`Select order ${order.id}`}
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-foreground">
                      {order.id.slice(0, 10)}
                    </td>
                    <td className="py-3 px-3 text-foreground font-medium">
                      <span className="line-clamp-1">
                        {firstItem} {itemCount > 1 ? `(+${itemCount - 1} more)` : ""}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formattedDate}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-lime-600 dark:text-lime-300">
                      KES {(order.total || orderAny.price || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          order.status || "completed"
                        )}`}
                      >
                        {order.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No transactions found matching your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

