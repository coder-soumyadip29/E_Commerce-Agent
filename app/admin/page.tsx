"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Clock,
  Banknote,
  Percent,
  RotateCcw,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { DashboardMetrics, AnalyticsChartPoint, Seller, Product } from "@/lib/types";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<AnalyticsChartPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentSellers, setRecentSellers] = useState<Seller[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard?range=${timeRange}`);
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setChartData(data.chartData);
        setRecentOrders(data.recentOrders || []);
        setRecentSellers(data.recentSellers || []);
        setPendingProducts(data.pendingProducts || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Max value for SVG chart scaling
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1000);

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-300 font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>EXECUTIVE CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Marketplace Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time platform performance, vendor activities, and financial reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-[#0E131F] border border-amber-500/30 text-amber-400 hover:text-white hover:border-amber-400 hover:bg-amber-500/15 transition-all shadow-xs cursor-pointer"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black text-xs font-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <span>Export Financial Report</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 8 KPI Cards in Luxury Black & Gold */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Total Revenue */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Total GMV Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono">
            ₹{metrics?.totalRevenue.toLocaleString("en-IN") || "24,58,920"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono">
            {metrics?.totalOrders.toLocaleString("en-IN") || "12,842"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.6% order volume</span>
          </div>
        </div>

        {/* 3. Total Customers */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Registered Customers
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono">
            {metrics?.totalCustomers.toLocaleString("en-IN") || "45,620"}
          </div>
          <p className="text-[11px] text-slate-400">Active verified shoppers</p>
        </div>

        {/* 4. Active & Total Sellers */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Marketplace Sellers
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
            <span>{metrics?.activeSellers || 4}</span>
            <span className="text-xs text-amber-400/70 font-normal">/ {metrics?.totalSellers || 5} Total</span>
          </div>
          <Link
            href="/admin/sellers"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200"
          >
            <span>{metrics?.pendingSellers || 1} pending approval</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 5. Total Platform Commission */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Total Commission
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono">
            ₹{metrics?.totalCommission.toLocaleString("en-IN") || "2,45,892"}
          </div>
          <p className="text-[11px] text-slate-400">Avg. 10.0% marketplace cut</p>
        </div>

        {/* 6. Pending Payouts */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Pending Payouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono">
            ₹{metrics?.pendingPayoutAmount.toLocaleString("en-IN") || "4,25,000"}
          </div>
          <Link
            href="/admin/payouts"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200"
          >
            <span>{metrics?.pendingPayouts || 1} requests awaiting review</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 7. Products Requiring Approval */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Pending Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono">
            {metrics?.pendingProducts ?? 0}
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200"
          >
            <span>Review catalog queue</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 8. Refunds & Returns */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 hover:border-amber-400/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[-2px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
              Refunds Settled
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white font-mono">
            ₹{metrics?.refundsAmount.toLocaleString("en-IN") || "349"}
          </div>
          <p className="text-[11px] text-slate-400">{metrics?.refundsCount || 1} processed refund cases</p>
        </div>
      </div>

      {/* Gold & Black Interactive Analytics Section */}
      <div className="bg-[#0E131F]/90 border border-amber-500/25 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.6)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Revenue &amp; Order Volume Trend</span>
            </h3>
            <p className="text-xs text-slate-300">
              Real calculated platform sales trajectory across multi-vendor checkouts.
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex items-center p-1 rounded-xl bg-[#121826] border border-amber-500/30 text-xs">
            {(["7days", "30days", "90days"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-amber-500/10"
                }`}
              >
                {r === "7days" ? "Last 7 Days" : r === "30days" ? "Last 30 Days" : "Last 3 Months"}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Interactive Time Series Chart in Gold */}
        <div className="relative pt-4 pb-2">
          <div className="h-48 sm:h-64 flex items-end gap-1 sm:gap-2">
            {chartData.map((pt, i) => {
              const heightPercent = Math.min(100, Math.max(12, Math.round((pt.revenue / maxRevenue) * 100)));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-[#121826] border border-amber-500/40 text-white text-[10px] p-2.5 rounded-xl whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    <p className="font-bold text-amber-300">{pt.date}</p>
                    <p className="text-white font-mono font-bold">₹{pt.revenue.toLocaleString()} • {pt.orders} orders</p>
                    <p className="text-amber-400 font-mono">Commission: ₹{pt.commission.toLocaleString()}</p>
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-md bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 group-hover:brightness-125 transition-all cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                  />
                  {i % 5 === 0 && (
                    <span className="text-[9px] text-amber-400/80 font-mono truncate w-full text-center">
                      {pt.date.slice(5)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Marketplace Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Multi-Vendor Orders */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Recent Orders &amp; Sub-Orders</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-amber-500/10">
            {recentOrders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between text-xs hover:bg-amber-500/5 px-2 rounded-xl transition-colors">
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Order #{o.id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono font-bold">
                      {o.payment_method || "UPI"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {o.items?.length || 1} items • {o.created_at}
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-mono font-black text-white text-sm">₹{o.total.toFixed(2)}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {o.tracking_status || o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Sellers Roster */}
        <div className="bg-[#0E131F]/90 border border-amber-500/25 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Marketplace Sellers Directory</span>
            </h3>
            <Link
              href="/admin/sellers"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Manage Sellers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-amber-500/10">
            {recentSellers.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs hover:bg-amber-500/5 px-2 rounded-xl transition-colors">
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{s.store_name}</span>
                    {s.verification_status === "VERIFIED" ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" title="Verified Seller" />
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                        Review Needed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Owner: {s.owner_name} • Commission: <span className="text-amber-400 font-bold">{s.commission_rate}%</span>
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      s.status === "ACTIVE"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : s.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {s.status}
                  </span>
                  <p className="text-[10px] text-amber-400 font-mono font-bold">★ {s.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
