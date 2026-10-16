"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Check } from "lucide-react";
import { format } from "date-fns";
import type { Order } from "@/lib/types";

interface VendorTransactionsProps {
  orders: Order[];
}

export function VendorTransactions({ orders }: VendorTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Filter orders by ID or customer email/product name
  const filteredOrders = orders.filter((order) => {
    const idMatch = (order.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const customerMatch = (order.user || order.userId || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
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
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-lime-400/10 text-lime-400 border-lime-400/30";
      case "processing":
        return "bg-sky-400/10 text-sky-400 border-sky-400/30";
      case "cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-amber-400/10 text-amber-400 border-amber-400/30";
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md">
      {/* Title & Instant Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h2 className="text-lg font-bold text-white tracking-tight">Last transactions</h2>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 focus:border-lime-400/50 text-xs text-white placeholder:text-muted-foreground focus:outline-none transition-all"
            />
          </div>

          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 hover:border-lime-400/40 flex items-center justify-center text-muted-foreground hover:text-white transition-all shrink-0"
            aria-label="Filter transactions"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground font-semibold">
              <th className="py-3 px-3 w-8">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length
                      ? "bg-[#bef264] border-[#bef264] text-black"
                      : "border-white/20 hover:border-white/40"
                  }`}
                  aria-label="Select all orders"
                >
                  {selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </button>
              </th>
              <th className="py-3 px-3">Order ID</th>
              <th className="py-3 px-3">Item / Product</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Amount</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No orders found matching your search.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrders.includes(order.id);
                let orderDate = "Recent";
                if (order.timestamp) {
                  try {
                    orderDate = format(new Date(order.timestamp), "dd/MM/yyyy");
                  } catch {
                    orderDate = "Recent";
                  }
                }
                const firstItem = order.items?.[0]?.productName || order.productName || "Catalog Product";
                const extraItemsCount = (order.items?.length || 1) - 1;

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-white/[0.04] transition-colors group ${
                      isSelected ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectOrder(order.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#bef264] border-[#bef264] text-black"
                            : "border-white/20 hover:border-white/40"
                        }`}
                        aria-label={`Select order ${order.id}`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-white group-hover:text-[#bef264] transition-colors">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-3 text-white/90">
                      <div className="font-semibold line-clamp-1 max-w-[200px]">{firstItem}</div>
                      {extraItemsCount > 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          +{extraItemsCount} other item{extraItemsCount > 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-muted-foreground">{orderDate}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#bef264]">
                      KES {order.total.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

