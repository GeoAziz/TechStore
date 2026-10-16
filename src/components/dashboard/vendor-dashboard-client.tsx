"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import {
  Loader2,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Percent,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import type { Order, Product } from "@/lib/types";

import { VendorSidebar } from "./vendor/vendor-sidebar";
import { VendorHeader } from "./vendor/vendor-header";
import { VendorKpis } from "./vendor/vendor-kpis";
import { VendorSalesReport } from "./vendor/vendor-sales-report";
import { VendorTopProducts } from "./vendor/vendor-top-products";
import { VendorTransactions } from "./vendor/vendor-transactions";

export default function VendorDashboardClient({
  vendorProducts: initialProducts = [],
  vendorOrders: initialOrders = [],
  vendorName: initialVendorName = "Vendor Portal",
}: {
  vendorProducts?: Product[];
  vendorOrders?: Order[];
  vendorName?: string;
} = {}) {
  const { user, loading: authLoading, role } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [vendorName, setVendorName] = useState<string>(initialVendorName);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [productSearch, setProductSearch] = useState<string>("");
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== "vendor") {
        router.push("/login");
        return;
      }

      const fetchVendorData = async () => {
        try {
          setIsFetchingData(true);
          const currentUser = auth.currentUser;
          if (!currentUser) return;

          const token = await currentUser.getIdToken();
          const res = await fetch("/api/vendor/data", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setProducts(data.products || []);
              setOrders(data.orders || []);
              setVendorName(data.vendor?.name || data.vendor?.brand || "Vendor Portal");
              setMetrics(
                data.metrics || {
                  totalRevenue: 0,
                  totalOrders: 0,
                  totalProducts: 0,
                  lowStockCount: 0,
                }
              );
            }
          }
        } catch (err) {
          console.error("Failed to fetch dynamic vendor data:", err);
        } finally {
          setIsFetchingData(false);
        }
      };

      fetchVendorData();
    }
  }, [user, authLoading, role, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  // Customers computation from unique orders
  const customersList = useMemo(() => {
    const customerMap = new Map<string, { email: string; ordersCount: number; totalSpent: number; lastOrder: string }>();
    orders.forEach((o) => {
      const email = o.user || o.userId || "anonymous@techstore.co.ke";
      const existing = customerMap.get(email) || { email, ordersCount: 0, totalSpent: 0, lastOrder: o.timestamp || "" };
      existing.ordersCount += 1;
      existing.totalSpent += o.total || 0;
      if (o.timestamp && (!existing.lastOrder || o.timestamp > existing.lastOrder)) {
        existing.lastOrder = o.timestamp;
      }
      customerMap.set(email, existing);
    });
    return Array.from(customerMap.values());
  }, [orders]);

  // Filtered orders for the dedicated Orders view
  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter((o) => o.status?.toLowerCase() === orderFilter.toLowerCase());
  }, [orders, orderFilter]);

  // Filtered products for dedicated Products view
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  if (authLoading || (isFetchingData && products.length === 0)) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center text-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#bef264] mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">
          Authenticating vendor session & live store records...
        </p>
      </div>
    );
  }

  const calculatedRevenue = metrics.totalRevenue || orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-[#090a0f] text-foreground overflow-x-hidden">
      <div className="container max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Collapsible Sidebar */}
          <VendorSidebar
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            pendingOrdersCount={orders.filter((o) => o.status === "Processing").length}
            onLogout={handleLogout}
          />

          {/* Right: Main Dashboard Content Area */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <VendorHeader
              vendorName={vendorName}
              storeName={vendorName}
              ordersCount={orders.length}
            />

            {/* TAB 1: OVERVIEW */}
            {activeSection === "overview" && (
              <>
                <VendorKpis products={products} orders={orders} metrics={metrics} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <VendorSalesReport
                      orders={orders}
                      totalRevenue={calculatedRevenue}
                    />
                  </div>
                  <div className="lg:col-span-5">
                    <VendorTopProducts products={products} />
                  </div>
                </div>

                <VendorTransactions orders={orders} />
              </>
            )}

            {/* TAB 2: ORDERS */}
            {activeSection === "orders" && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#bef264]" />
                      <span>Order Fulfillment Management</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Track and manage all orders placed for your products
                    </p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs">
                    {(["all", "Processing", "Delivered", "Cancelled"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setOrderFilter(status)}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                          orderFilter.toLowerCase() === status.toLowerCase()
                            ? "bg-[#bef264] text-black font-extrabold"
                            : "text-muted-foreground hover:text-white"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-white/10">
                    <thead>
                      <tr className="text-muted-foreground font-semibold">
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Items</th>
                        <th className="py-3 px-3">Total Amount</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No orders found under &quot;{orderFilter}&quot;.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/[0.03]">
                            <td className="py-3 px-3 font-mono font-bold text-white">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="py-3 px-3 text-muted-foreground">
                              {order.timestamp ? format(new Date(order.timestamp), "dd/MM/yyyy HH:mm") : "Recent"}
                            </td>
                            <td className="py-3 px-3 text-white/90">
                              {order.user || order.userId || "Customer"}
                            </td>
                            <td className="py-3 px-3 text-white/80">
                              {order.items?.map((i) => i.productName).join(", ") || order.productName}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-[#bef264]">
                              KES {order.total.toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                  order.status === "Delivered"
                                    ? "bg-lime-400/10 text-lime-400 border-lime-400/30"
                                    : order.status === "Processing"
                                    ? "bg-sky-400/10 text-sky-400 border-sky-400/30"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCTS */}
            {activeSection === "products" && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#bef264]" />
                      <span>Product Inventory Catalog ({products.length})</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage product pricing, stock availability, and catalog listings
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-48 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-lime-400/50"
                      />
                    </div>
                    <Link
                      href="/shop"
                      className="px-3.5 py-2 rounded-xl bg-[#bef264] hover:bg-lime-300 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(190,242,100,0.3)]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>View Live</span>
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-white/10">
                    <thead>
                      <tr className="text-muted-foreground font-semibold">
                        <th className="py-3 px-3">Product</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Price</th>
                        <th className="py-3 px-3">Stock Units</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.03]">
                          <td className="py-3 px-3 flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                              <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                            </div>
                            <div>
                              <div className="font-semibold text-white line-clamp-1">{p.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">ID: {p.id.slice(0, 10)}</div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">{p.category}</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#bef264]">
                            KES {p.price.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`font-semibold ${
                                p.stock === 0
                                  ? "text-rose-400"
                                  : p.stock < 5
                                  ? "text-amber-400"
                                  : "text-white"
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {p.stock > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-lime-400">
                                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                                <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: CUSTOMERS */}
            {activeSection === "customers" && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#bef264]" />
                    <span>Customer Base ({customersList.length})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clients who have purchased products fulfilled by your vendor account
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-white/10">
                    <thead>
                      <tr className="text-muted-foreground font-semibold">
                        <th className="py-3 px-3">Customer Email / ID</th>
                        <th className="py-3 px-3">Orders Placed</th>
                        <th className="py-3 px-3">Total Spent</th>
                        <th className="py-3 px-3">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {customersList.map((c, i) => (
                        <tr key={i} className="hover:bg-white/[0.03]">
                          <td className="py-3 px-3 font-semibold text-white">
                            {c.email}
                          </td>
                          <td className="py-3 px-3 font-mono text-white/90">{c.ordersCount} order(s)</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#bef264]">
                            KES {c.totalSpent.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {c.lastOrder ? format(new Date(c.lastOrder), "dd/MM/yyyy") : "Recent"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: ANALYTICS */}
            {activeSection === "analytics" && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#bef264]" />
                    <span>Store Performance Analytics</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    In-depth breakdown of transaction velocity, revenue distribution, and conversion metrics
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="text-xs text-muted-foreground">Average Order Value</div>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      KES {orders.length > 0 ? Math.round(calculatedRevenue / orders.length).toLocaleString() : 0}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="text-xs text-muted-foreground">Fulfillment Rate</div>
                    <div className="text-2xl font-black text-lime-400 font-mono mt-1">
                      {orders.length > 0
                        ? `${Math.round(
                            (orders.filter((o) => o.status === "Delivered").length / orders.length) * 100
                          )}%`
                        : "100%"}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="text-xs text-muted-foreground">Catalog Utilization</div>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      {products.length > 0
                        ? `${Math.round((products.filter((p) => p.stock > 0).length / products.length) * 100)}%`
                        : "100%"}
                    </div>
                  </div>
                </div>

                <VendorSalesReport orders={orders} totalRevenue={calculatedRevenue} />
              </div>
            )}

            {/* TAB 6: DISCOUNTS / MARKETING */}
            {(activeSection === "discounts" || activeSection === "marketing") && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Percent className="w-5 h-5 text-[#bef264]" />
                    <span>Vendor Campaigns & Promo Discounts</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure seasonal promotions and exclusive customer discounts
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-white/[0.04] border border-lime-400/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-[#bef264] uppercase font-bold tracking-wider">
                        Active Promo Code
                      </div>
                      <div className="text-xl font-black text-white font-mono mt-1">TECHSEASON2026</div>
                      <div className="text-xs text-muted-foreground mt-1">10% OFF on all catalog products</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-lime-400/10 text-lime-400 border border-lime-400/30">
                      Live
                    </span>
                  </div>

                  <div className="p-5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground uppercase font-bold tracking-wider">
                        Upcoming Flash Deal
                      </div>
                      <div className="text-xl font-black text-white font-mono mt-1">CYBERWEEK50</div>
                      <div className="text-xs text-muted-foreground mt-1">Starts end of month</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-muted-foreground border border-white/20">
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: SALES CHANNELS */}
            {(activeSection === "online-store" || activeSection === "point-of-sale") && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-[#bef264]" />
                    <span>Connected Store Channels</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sync your catalog across Web Marketplace and Point of Sale integrations
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">TechStore Kenya Online Marketplace</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Status: Active sync with live inventory and checkout
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400/10 text-lime-400 border border-lime-400/30">
                    Connected
                  </span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
