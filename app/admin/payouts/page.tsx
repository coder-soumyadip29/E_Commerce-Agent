"use client";

import React, { useState, useEffect } from "react";
import {
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  CreditCard,
  Building,
  Check,
  X,
  ExternalLink,
  Store,
} from "lucide-react";
import { Payout } from "@/lib/types";

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, paid: 0, rejected: 0 });

  // Payout action modal
  const [payModal, setPayModal] = useState<{
    isOpen: boolean;
    payout: any | null;
    reference: string;
  }>({
    isOpen: false,
    payout: null,
    reference: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/payouts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const handleUpdateStatus = async (payoutId: string, status: string, reference?: string) => {
    try {
      setActionLoading(true);
      await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payout_id: payoutId,
          status,
          transaction_reference: reference,
        }),
      });
      setPayModal({ isOpen: false, payout: null, reference: "" });
      await fetchPayouts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Payout ID", "Seller ID", "Amount", "Status", "Bank", "Account", "Reference", "Created At"];
    const rows = payouts.map((p) => [
      p.id,
      p.seller_id,
      p.amount,
      p.status,
      p.bank_details?.bank_name || "N/A",
      p.bank_details?.account_number || "N/A",
      p.transaction_reference || "N/A",
      p.created_at,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `marketplace_payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Approval
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Banknote className="w-7 h-7 text-emerald-600" />
            Vendor Payouts & Disbursements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review vendor earnings withdrawals, verify banking information, and record wire transfer confirmation codes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={fetchPayouts}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI status filter tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "All Requests", value: "ALL", count: counts.all, color: "text-slate-900" },
          { label: "Pending Review", value: "PENDING", count: counts.pending, color: "text-amber-600" },
          { label: "Approved (Queued)", value: "APPROVED", count: counts.approved, color: "text-indigo-600" },
          { label: "Disbursed / Paid", value: "PAID", count: counts.paid, color: "text-emerald-600" },
          { label: "Declined", value: "REJECTED", count: counts.rejected, color: "text-rose-600" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === tab.value
                ? "bg-white shadow-xs ring-2 ring-emerald-500 border-transparent"
                : "bg-white/80 hover:bg-white border-slate-200/80"
            }`}
          >
            <div className="text-xs font-semibold text-slate-500">{tab.label}</div>
            <div className={`text-2xl font-bold mt-1 ${tab.color}`}>{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Bank Routing Details</th>
                <th className="py-3 px-4 text-right">Disbursement Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Wire Reference</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading payout ledger...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No payout records for this filter.
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">
                      {payout.id}
                      <div className="text-[11px] text-slate-400 font-normal">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        {payout.seller_id}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <div className="font-semibold text-slate-700">{payout.bank_details?.bank_name}</div>
                        <div className="text-slate-400 font-mono">
                          Acct: •••• {payout.bank_details?.account_number?.slice(-4)} • Routing: {payout.bank_details?.routing_number}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-base font-extrabold text-emerald-600">
                        ${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(payout.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      {payout.transaction_reference ? (
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {payout.transaction_reference}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {payout.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(String(payout.id), "APPROVED")}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(String(payout.id), "REJECTED")}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {payout.status === "APPROVED" && (
                          <button
                            onClick={() =>
                              setPayModal({
                                isOpen: true,
                                payout,
                                reference: `WIRE-${Date.now().toString().slice(-6)}`,
                              })
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors"
                          >
                            Mark as Paid
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

      {/* Mark Paid Modal */}
      {payModal.isOpen && payModal.payout && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm Wire / ACH Disbursement
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Marking ${payModal.payout.amount.toFixed(2)} disbursed to {payModal.payout.seller_id}.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bank / Gateway Transaction Reference Number *
              </label>
              <input
                type="text"
                required
                value={payModal.reference}
                onChange={(e) => setPayModal({ ...payModal, reference: e.target.value })}
                className="w-full p-2.5 font-mono text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter confirmation code from your commercial bank or payment provider.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setPayModal({ isOpen: false, payout: null, reference: "" })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !payModal.reference}
                onClick={() =>
                  handleUpdateStatus(String(payModal.payout!.id), "PAID", payModal.reference)
                }
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
