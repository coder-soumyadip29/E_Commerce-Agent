"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  RefreshCw,
  Box,
} from "lucide-react";
import { ReturnRequest } from "@/lib/types";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [counts, setCounts] = useState({
    all: 0,
    requested: 0,
    approved: 0,
    item_received: 0,
    completed: 0,
    rejected: 0,
  });

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/returns?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReturns(data.returns || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ return_id: id, status }),
      });
      await fetchReturns();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-emerald-600" />
            Product Returns & RMA Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track reverse logistics, authorize return merchandise authorisations (RMA), and inspect received return parcels.
          </p>
        </div>
        <button
          onClick={fetchReturns}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: "All Returns", value: "ALL", count: counts.all },
          { label: "Requested", value: "REQUESTED", count: counts.requested },
          { label: "RMA Approved", value: "APPROVED", count: counts.approved },
          { label: "Item In Warehouse", value: "ITEM_RECEIVED", count: counts.item_received },
          { label: "Completed", value: "COMPLETED", count: counts.completed },
          { label: "Rejected", value: "REJECTED", count: counts.rejected },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`p-3 rounded-xl border text-left transition-all ${
              statusFilter === tab.value
                ? "bg-white shadow-xs ring-2 ring-emerald-500 border-transparent"
                : "bg-white hover:bg-slate-50 border-slate-200"
            }`}
          >
            <div className="text-xs font-semibold text-slate-500">{tab.label}</div>
            <div className="text-xl font-bold mt-1 text-slate-900">{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">RMA ID</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Return Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                returns.map((ret: any) => (
                  <tr key={ret.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                      {ret.id}
                      <div className="text-[11px] text-slate-400 font-normal">
                        {new Date(ret.requested_at || ret.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{ret.order_id}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">{ret.product_id}</td>
                    <td className="py-3.5 px-4 text-slate-700">{ret.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ret.status === "REQUESTED" && (
                          <button
                            onClick={() => handleUpdateStatus(String(ret.id), "APPROVED")}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                          >
                            Approve RMA
                          </button>
                        )}
                        {ret.status === "APPROVED" && (
                          <button
                            onClick={() => handleUpdateStatus(String(ret.id), "RECEIVED")}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                          >
                            Mark Parcel Received
                          </button>
                        )}
                        {(ret.status === "RECEIVED" || ret.status === "ITEM_RECEIVED") && (
                          <button
                            onClick={() => handleUpdateStatus(String(ret.id), "COMPLETED")}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                          >
                            Complete Return
                          </button>
                        )}
                      </div>
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
