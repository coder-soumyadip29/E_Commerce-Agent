"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Refund } from "@/lib/types";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, processed: 0, rejected: 0 });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/refunds?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRefunds(data.refunds || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter]);

  const handleUpdateStatus = async (refundId: string, status: string) => {
    try {
      setActionLoading(true);
      await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refund_id: refundId, status }),
      });
      await fetchRefunds();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Refund Management & Claims
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review customer refund requests, initiate payment gateway chargebacks, and adjust vendor commission ledgers.
          </p>
        </div>
        <button
          onClick={fetchRefunds}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "All Claims", value: "ALL", count: counts.all },
          { label: "Pending Review", value: "PENDING", count: counts.pending },
          { label: "Approved", value: "APPROVED", count: counts.approved },
          { label: "Disbursed / Processed", value: "PROCESSED", count: counts.processed },
          { label: "Rejected", value: "REJECTED", count: counts.rejected },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === tab.value
                ? "bg-white shadow-xs ring-2 ring-emerald-500 border-transparent"
                : "bg-white hover:bg-slate-50 border-slate-200"
            }`}
          >
            <div className="text-xs font-semibold text-slate-500">{tab.label}</div>
            <div className="text-2xl font-bold mt-1 text-slate-900">{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading refund claims...
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No refund claims matching this filter.
                  </td>
                </tr>
              ) : (
                refunds.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                      {r.id}
                      <div className="text-[11px] text-slate-400 font-normal">
                        {new Date(r.requested_at || r.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {r.order_id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {r.reason}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-rose-600 text-base">
                      ${(r.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {(r.status === "PENDING" || r.status === "REQUESTED") && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(String(r.id), "APPROVED")}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(String(r.id), "REJECTED")}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {r.status === "APPROVED" && (
                        <button
                          onClick={() => handleUpdateStatus(String(r.id), "PROCESSED")}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                        >
                          Execute Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
