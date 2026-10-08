"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, DollarSign, Clock, CheckCircle, AlertCircle, Search, HelpCircle } from "lucide-react";

export default function SellerRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRefunds();
  }, []);

  async function fetchRefunds() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/refunds");
      const json = await res.json();
      if (res.ok) {
        setRefunds(json.refunds || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = refunds.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesSearch =
      !search ||
      String(r.id).includes(search) ||
      String(r.order_id).includes(search) ||
      r.reason?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRefunded = refunds
    .filter((r) => r.status === "COMPLETED" || r.status === "APPROVED")
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Refunds History & Deductions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track customer refund transactions and escrow ledger adjustments for your store items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/seller/returns"
            className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
          >
            View Return Claims (RMA)
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Refund Claims
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {refunds.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Linked to your store sub-orders</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Value Refunded
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            ₹{totalRefunded.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Deducted from gross marketplace balance</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Processing Flow
          </span>
          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-2 flex items-center gap-1.5">
            <RefreshCcw className="w-4 h-4 text-indigo-500" />
            Automatic Gateway Reverse
          </div>
          <div className="text-xs text-slate-500 mt-1">UPI / Cards credited in 24-48 hrs</div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by refund ID, order #, reason..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "PENDING", "APPROVED", "COMPLETED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-4">Refund ID</th>
                <th className="py-3 px-4">Parent Order</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Processed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading refunds history...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((r) => {
                  let badge = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
                  if (r.status === "COMPLETED" || r.status === "APPROVED") {
                    badge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
                  } else if (r.status === "REJECTED") {
                    badge = "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                        REF-{r.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        #{r.order_id}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        -₹{r.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {r.reason || "Customer return cancellation"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {r.created_at || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {r.processed_at || "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No refund transactions recorded.
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
