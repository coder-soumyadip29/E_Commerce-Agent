"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  RotateCcw,
  Star,
  Search,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

export default function SellerAnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/analytics?range=${range}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const summary = data?.summary || {
    grossSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    returnsCount: 0,
  };

  const chartData = data?.chartData || [];
  const maxRev = Math.max(...chartData.map((d: any) => d.revenue), 1000);
  const maxOrders = Math.max(...chartData.map((d: any) => d.orders), 10);

  const productPerformance = data?.productPerformance || [];
  const filteredProducts = productPerformance.filter(
    (p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Store Performance & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep sales diagnostics, customer velocity, and product-level unit economics.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          {[
            { id: "7d", label: "7 Days" },
            { id: "30d", label: "30 Days" },
            { id: "90d", label: "90 Days" },
            { id: "1y", label: "1 Year" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setRange(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                range === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            ₹{summary.grossSales.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            +18.4% vs previous period
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Orders Fulfilled
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {summary.totalOrders}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across active marketplace catalog
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Order Value (AOV)
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            ₹{summary.avgOrderValue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Basket size per conversion
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Return Rate
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-lg">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {summary.totalOrders > 0
              ? `${((summary.returnsCount / summary.totalOrders) * 100).toFixed(1)}%`
              : "0.0%"}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.returnsCount} return claim(s) filed
          </div>
        </div>
      </div>

      {/* Visual Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Revenue Trajectory
              </h2>
              <p className="text-xs text-slate-500">Gross sales velocity in INR</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
              Trend
            </span>
          </div>

          <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {chartData.map((d: any, idx: number) => {
              const heightPct = Math.max(10, Math.round((d.revenue / maxRev) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                    ₹{d.revenue}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md group-hover:brightness-110 transition-all"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2">
            {chartData.map((d: any, idx: number) => (
              <span key={idx}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Order Volume Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Order Frequency
              </h2>
              <p className="text-xs text-slate-500">Sub-orders dispatched per period</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
              Volume
            </span>
          </div>

          <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {chartData.map((d: any, idx: number) => {
              const heightPct = Math.max(10, Math.round((d.orders / maxOrders) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                    {d.orders} orders
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md group-hover:brightness-110 transition-all"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2">
            {chartData.map((d: any, idx: number) => (
              <span key={idx}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Catalog Performance Diagnostics
            </h2>
            <p className="text-xs text-slate-500">
              Unit sales, gross revenue, inventory stock, and return ratios per SKU.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Revenue</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-center">Returns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading analytics table...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                      ₹{p.price.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          p.stock <= 10
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                      {p.unitsSold}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{p.revenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {p.rating}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                      {p.returnsCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No products matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
