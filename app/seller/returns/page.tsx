"use client";

import React, { useState, useEffect } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  AlertCircle,
  Truck,
  ArrowRight,
} from "lucide-react";
import { ReturnRequest } from "@/lib/types";

export default function SellerReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/returns");
      if (res.ok) {
        const json = await res.json();
        setReturns(json.returns || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdate = async (returnId: number, status: string) => {
    try {
      const res = await fetch("/api/seller/returns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId, status }),
      });
      if (res.ok) {
        await fetchReturns();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-emerald-600" />
              Returns & Reverse Logistics (RMA)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review customer return requests for your store's items, inspect returned stock, and authorize completion.
            </p>
          </div>

          <button
            onClick={fetchReturns}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Returns Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">RMA ID & Order</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Customer Reason</th>
                  <th className="py-3 px-4">Status Stage</th>
                  <th className="py-3 px-4 text-right">Vendor Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No return requests filed for your products.
                    </td>
                  </tr>
                ) : (
                  returns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">RMA #{r.id}</div>
                        <div className="text-[11px] text-slate-400">Order #{r.order_id}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                        {r.product_name || `Product #${r.product_id}`}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                        <div className="font-medium">{r.reason}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Requested: {r.requested_at ? new Date(r.requested_at).toLocaleDateString() : "Recent"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            r.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : r.status === "APPROVED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : r.status === "REQUESTED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === "REQUESTED" && (
                            <>
                              <button
                                onClick={() => handleUpdate(r.id, "APPROVED")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                              >
                                Approve RMA
                              </button>
                              <button
                                onClick={() => handleUpdate(r.id, "REJECTED")}
                                className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {r.status === "APPROVED" && (
                            <button
                              onClick={() => handleUpdate(r.id, "RECEIVED")}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700"
                            >
                              Mark Received
                            </button>
                          )}

                          {r.status === "RECEIVED" && (
                            <button
                              onClick={() => handleUpdate(r.id, "COMPLETED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800"
                            >
                              Complete & Restock
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
    </SellerLayout>
  );
}
