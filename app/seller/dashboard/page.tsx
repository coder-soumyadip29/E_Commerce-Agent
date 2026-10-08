"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  Star,
  CreditCard,
  ArrowRight,
  PlusCircle,
  Truck,
  Warehouse,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { SellerDashboardMetrics, SellerOrder } from "@/lib/types";

export default function SellerDashboardPage() {
  const [data, setData] = useState<{
    metrics: SellerDashboardMetrics;
    chartData: Array<{ date: string; sales: number; orders: number }>;
    recentOrders: SellerOrder[];
    topProducts: any[];
    seller: any;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30d");

  const fetchDashboard = async (tf = timeframe) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/dashboard?timeframe=${tf}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(timeframe);
  }, [timeframe]);

  const metrics = data?.metrics;

  const kpis = [
    {
      label: "Today's Sales",
      value: `₹${(metrics?.todaySales || 0).toLocaleString("en-IN")}`,
      sub: "Last 24 hours",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Total Sales",
      value: `₹${(metrics?.totalSales || 0).toLocaleString("en-IN")}`,
      sub: "Gross store revenue",
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      label: "Total Orders",
      value: (metrics?.totalOrders || 0).toLocaleString("en-IN"),
      sub: "Processed orders",
      icon: ShoppingBag,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      label: "Pending Orders",
      value: (metrics?.pendingOrders || 0).toLocaleString("en-IN"),
      sub: "Require packing / dispatch",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      label: "Active Products",
      value: (metrics?.totalProducts || 0).toLocaleString("en-IN"),
      sub: "In marketplace catalog",
      icon: Package,
      color: "text-teal-600 bg-teal-50 border-teal-200",
    },
    {
      label: "Low Stock Items",
      value: (metrics?.lowStockCount || 0).toLocaleString("en-IN"),
      sub: "Stock ≤ 10 units",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      label: "Customer Reviews",
      value: `${metrics?.customerReviewsCount || 0}`,
      sub: `Avg. ${metrics?.averageRating || 5.0} ★ rating`,
      icon: Star,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      label: "Available Balance",
      value: `₹${(metrics?.availableBalance || 0).toLocaleString("en-IN")}`,
      sub: `Pending: ₹${(metrics?.pendingBalance || 0).toLocaleString("en-IN")}`,
      icon: CreditCard,
      color: "text-emerald-700 bg-emerald-100 border-emerald-300 font-black",
    },
  ];

  // SVG Chart computation
  const chartPoints = data?.chartData || [];
  const maxSales = Math.max(...chartPoints.map((p) => p.sales), 1000);
  const chartWidth = 600;
  const chartHeight = 160;

  const pointsSvg = chartPoints
    .map((pt, idx) => {
      const x = (idx / (chartPoints.length - 1 || 1)) * (chartWidth - 40) + 20;
      const y = chartHeight - (pt.sales / maxSales) * (chartHeight - 40) - 20;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Welcome back, {data?.seller?.owner_name || "Merchant"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Store: <strong className="text-slate-800">{data?.seller?.store_name}</strong> • Platform Commission:{" "}
              <span className="font-semibold text-emerald-700">{data?.seller?.commission_rate || 10}%</span>
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
              {[
                { label: "Today", value: "today" },
                { label: "7 Days", value: "7d" },
                { label: "30 Days", value: "30d" },
                { label: "90 Days", value: "90d" },
                { label: "1 Year", value: "1y" },
              ].map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    timeframe === tf.value
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchDashboard(timeframe)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
              title="Refresh Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/seller/products/new"
            className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-xs transition-all group"
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Product</span>
          </Link>

          <Link
            href="/seller/orders"
            className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-xs transition-all group"
          >
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:scale-105 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Orders ({metrics?.pendingOrders || 0})</span>
          </Link>

          <Link
            href="/seller/inventory"
            className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-xs transition-all group"
          >
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:scale-105 transition-transform">
              <Warehouse className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Inventory</span>
          </Link>

          <Link
            href="/seller/earnings"
            className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-xs transition-all group"
          >
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Earnings</span>
          </Link>

          <Link
            href="/seller/payouts"
            className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-xs transition-all group"
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Request Payout</span>
          </Link>

          <Link
            href="/seller/reviews"
            className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-xs transition-all group"
          >
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Reviews ({metrics?.customerReviewsCount || 0})</span>
          </Link>
        </div>

        {/* 8 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {kpi.label}
                  </span>
                  <div className={`p-2 rounded-xl border ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">{kpi.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts & Trends Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sales Trend Curve</h2>
              <p className="text-xs text-slate-500">Real-time revenue performance for selected period</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-emerald-600">
                ₹{(metrics?.totalSales || 0).toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Gross Store Revenue</div>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="sellerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              {chartPoints.length > 1 && (
                <polygon
                  points={`20,${chartHeight - 20} ${pointsSvg} ${chartWidth - 20},${chartHeight - 20}`}
                  fill="url(#sellerGrad)"
                />
              )}

              {/* Stroke curve line */}
              {chartPoints.length > 1 && (
                <polyline
                  points={pointsSvg}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {chartPoints.map((pt, idx) => {
                const x = (idx / (chartPoints.length - 1 || 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - (pt.sales / maxSales) * (chartHeight - 40) - 20;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-emerald-600 stroke-white stroke-2 hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${pt.date}: ₹${pt.sales.toLocaleString()} (${pt.orders} orders)`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-3 border-t border-slate-100 pt-3">
            {chartPoints.map((p, idx) => (
              <span key={idx}>{p.date}</span>
            ))}
          </div>
        </div>

        {/* Two-Column Lower Content: Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recent Sub-Orders (2 Columns wide) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Customer Sub-Orders</h2>
                  <p className="text-xs text-slate-500">Live order items assigned to your store for fulfillment</p>
                </div>
                <Link
                  href="/seller/orders"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  View All Orders <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No orders placed for this vendor yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentOrders.map((so) => (
                    <div key={so.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            Sub-Order #{so.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              so.status === "delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : so.status === "packing"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {so.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 truncate mt-1">
                          {so.items?.map((i: any) => `${i.product_name} (x${i.quantity})`).join(", ") ||
                            "Items"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Placed: {new Date(so.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-slate-900">₹{so.subtotal}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          Earnings: ₹{so.seller_earnings}
                        </div>
                        <Link
                          href="/seller/orders"
                          className="mt-1 inline-flex text-[11px] font-bold text-slate-700 hover:text-emerald-600"
                        >
                          Manage Fulfill →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400 flex justify-between items-center">
              <span>Orders must be packaged within 24 hours of confirmation.</span>
              <Link href="/seller/orders" className="font-bold text-emerald-700 hover:underline">
                Fulfillment Rules
              </Link>
            </div>
          </div>

          {/* Right: Top Performing Products & Low-Stock Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Top Selling SKUs</h2>
                <Link
                  href="/seller/products"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  All Products
                </Link>
              </div>

              {(!data?.topProducts || data.topProducts.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">No product sales recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {data.topProducts.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-emerald-600/10 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Stock: {p.stock} • ₹{p.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-700">{p.salesCount} sold</div>
                        <div className="text-[10px] text-slate-400">₹{p.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/seller/inventory"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Warehouse className="w-4 h-4 text-emerald-600" />
                Check Low Stock Alerts ({metrics?.lowStockCount || 0})
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
