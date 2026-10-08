"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function SellerEarningsPage() {
  const [data, setData] = useState<{ summary: any; commissions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  async function fetchEarnings() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/earnings");
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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    grossSales: 0,
    commissionDeducted: 0,
    netEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalPaidOut: 0,
    commissionRate: 10,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Earnings & Economics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time balance breakdown, platform deductions, and escrow settlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/seller/commissions"
            className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
          >
            Commission Log
          </Link>
          <Link
            href="/seller/payouts"
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            Request Payout
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gross Store Sales
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            ₹{summary.grossSales.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Total sales processed across all store sub-orders
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Platform Fee Deductions
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-3">
            -₹{summary.commissionDeducted.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contracted platform take rate: ~{summary.commissionRate}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Lifetime Earnings
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
            ₹{summary.netEarnings.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gross sales minus platform fee deductions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-xl p-5 shadow-sm bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Available For Withdrawal
            </span>
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-3">
            ₹{summary.availableBalance.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            Pending in escrow: ₹{summary.pendingBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Financial Formula Callout */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              CartWise Multi-Vendor Settlement Model
            </div>
            <div className="text-slate-600 dark:text-slate-400 mt-1">
              <code>Available Balance = Net Store Earnings (₹{summary.netEarnings.toLocaleString()}) - Disbursed Payouts (₹{summary.totalPaidOut.toLocaleString()}) - Pending Escrow Requests (₹{summary.pendingBalance.toLocaleString()})</code>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sub-Order Commission & Net Credits */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Order Earnings Breakdown
          </h2>
          <Link
            href="/seller/commissions"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all commissions <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-4">Sub-Order #</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-center">Take Rate</th>
                <th className="py-3 px-4 text-right">Platform Fee</th>
                <th className="py-3 px-4 text-right">Net Credited</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.commissions && data.commissions.length > 0 ? (
                data.commissions.slice(0, 8).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      SO-{c.id}
                      <span className="block text-xs text-slate-400 font-sans">
                        Order #{c.order_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {c.products}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                      ₹{c.sale_amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                      {c.commission_rate}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-rose-500">
                      -₹{c.commission_amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +₹{c.seller_earnings.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400">
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No order earnings recorded yet.
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
