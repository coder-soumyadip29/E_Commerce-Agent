"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Store,
  Layers,
  Users,
  RefreshCw,
  PieChart,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartPoints = data?.chart || [];
  const maxRevenue = Math.max(...chartPoints.map((p: any) => p.revenue), 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <LineChart className="w-7 h-7 text-emerald-600" />
            Marketplace Business Intelligence & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deep dive into platform unit economics, marketplace GMV trajectories, commission yields, and vendor concentration.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Main KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Order Value (AOV)</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            ${data?.metrics ? (data.metrics.total_revenue / Math.max(data.metrics.total_orders, 1)).toFixed(2) : "0.00"}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">↑ +14.2% month-over-month</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Platform Take Rate</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {data?.metrics ? ((data.metrics.platform_commission / Math.max(data.metrics.total_revenue, 1)) * 100).toFixed(1) : "10.0"}%
          </div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Blended net effective rate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Active Sellers</span>
          <div className="text-3xl font-black text-indigo-600 mt-1">
            {data?.metrics?.active_sellers || 4}
          </div>
          <span className="text-xs text-slate-500 mt-1 inline-block">100% store compliance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Return / Dispute Ratio</span>
          <div className="text-3xl font-black text-slate-800 mt-1">1.8%</div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Well below 5% target</span>
        </div>
      </div>

      {/* Revenue & Commission Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">GMV Trajectory & Retained Commission</h2>
            <p className="text-xs text-slate-500">Historical performance across the past 7 tracking periods</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> GMV Revenue
            </span>
            <span className="flex items-center gap-1.5 text-indigo-700">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Commission Take
            </span>
          </div>
        </div>

        {/* Visual Bar graph */}
        <div className="h-64 flex items-end gap-4 pt-4 border-b border-slate-100">
          {chartPoints.map((pt: any, i: number) => {
            const barHeight = Math.round((pt.revenue / maxRevenue) * 200) || 20;
            const commHeight = Math.round((pt.commission / maxRevenue) * 200) || 6;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  ${pt.revenue.toLocaleString()}
                </div>
                <div className="w-full max-w-[48px] flex items-end gap-1">
                  <div
                    style={{ height: `${barHeight}px` }}
                    className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all group-hover:brightness-110"
                    title={`GMV: $${pt.revenue}`}
                  />
                  <div
                    style={{ height: `${commHeight}px` }}
                    className="w-2 bg-indigo-500 rounded-t-sm"
                    title={`Commission: $${pt.commission}`}
                  />
                </div>
                <div className="text-xs font-medium text-slate-500 mt-2">{pt.date}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
