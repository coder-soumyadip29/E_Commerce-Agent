"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Percent, HelpCircle, ArrowLeft, Search } from "lucide-react";

export default function SellerCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCommissions();
  }, []);

  async function fetchCommissions() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/earnings");
      const json = await res.json();
      if (res.ok) {
        setCommissions(json.commissions || []);
        setSummary(json.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = commissions.filter(
    (c) =>
      String(c.order_id).includes(search) ||
      String(c.id).includes(search) ||
      c.products.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/seller/earnings" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Earnings
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Commission History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical commission records. Rates are locked at checkout and immune to retroactive changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Standard Store Take Rate: {summary?.commissionRate ?? 10}%
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <span className="font-semibold">Immutable Commission Guarantee:</span> Each line item locks in the platform commission percentage effective at the moment the customer made the purchase. Even if marketplace administrators adjust your store commission profile later, historical records never change.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Sub-order #, or Product..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {filtered.length} records
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-4">Sub-Order</th>
                <th className="py-3 px-4">Parent Order</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4 text-right">Sale Amount</th>
                <th className="py-3 px-4 text-center">Commission Rate</th>
                <th className="py-3 px-4 text-right">Marketplace Fee</th>
                <th className="py-3 px-4 text-right">Seller Net</th>
                <th className="py-3 px-4 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading commission logs...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      SO-{c.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      #{c.order_id}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {c.products}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                      ₹{c.sale_amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {c.commission_rate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-rose-500">
                      -₹{c.commission_amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{c.seller_earnings.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      {c.created_at.slice(0, 10)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No commission entries found.
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
