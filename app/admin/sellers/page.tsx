"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
  Package,
  Building,
  Mail,
  Phone,
  CreditCard,
  FileText,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  Check,
  X,
  Edit2,
  Percent,
} from "lucide-react";
import { Seller } from "@/lib/types";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [counts, setCounts] = useState({ all: 0, active: 0, pending: 0, suspended: 0, rejected: 0 });

  // Detail Modal / Drawer state
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    seller: any | null;
    action: "ACTIVE" | "SUSPENDED" | "REJECTED";
    reason: string;
  }>({
    isOpen: false,
    seller: null,
    action: "ACTIVE",
    reason: "",
  });

  const [commissionModal, setCommissionModal] = useState<{
    isOpen: boolean;
    seller: any | null;
    rate: number;
  }>({
    isOpen: false,
    seller: null,
    rate: 10,
  });

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/admin/sellers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSellers(data.sellers || []);
        if (data.counts) setCounts(data.counts);
        if (selectedSeller) {
          const updated = (data.sellers || []).find((s: Seller) => s.id === selectedSeller.id);
          if (updated) setSelectedSeller(updated);
        }
      }
    } catch (err) {
      console.error("Failed to load sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSellers();
  };

  const handleUpdateStatus = async () => {
    if (!statusModal.seller) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          seller_id: statusModal.seller.id,
          status: statusModal.action,
          reason: statusModal.reason,
        }),
      });

      if (res.ok) {
        setStatusModal({ isOpen: false, seller: null, action: "ACTIVE", reason: "" });
        await fetchSellers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCommission = async () => {
    if (!commissionModal.seller) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_commission",
          seller_id: commissionModal.seller.id,
          commission_rate: commissionModal.rate,
        }),
      });

      if (res.ok) {
        setCommissionModal({ isOpen: false, seller: null, rate: 10 });
        await fetchSellers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: Seller["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Verification
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Suspended
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Store className="w-7 h-7 text-emerald-600" />
            Seller & Vendor Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review vendor onboarding applications, manage commissions, verify business KYC, and monitor compliance.
          </p>
        </div>
        <button
          onClick={fetchSellers}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Directory
        </button>
      </div>

      {/* KPI mini-cards / filter tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "All Sellers", value: "ALL", count: counts.all, color: "border-slate-300 text-slate-900" },
          { label: "Active", value: "ACTIVE", count: counts.active, color: "border-emerald-300 text-emerald-700" },
          { label: "Pending KYC", value: "PENDING", count: counts.pending, color: "border-amber-300 text-amber-700" },
          { label: "Suspended", value: "SUSPENDED", count: counts.suspended, color: "border-rose-300 text-rose-700" },
          { label: "Rejected", value: "REJECTED", count: counts.rejected, color: "border-slate-300 text-slate-600" },
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
            <div className={`text-2xl font-bold mt-1 ${tab.color.split(" ")[1]}`}>{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Search and Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by store, legal name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 font-medium">
          <span>Showing {sellers.length} registered vendors</span>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Store & Vendor</th>
                <th className="py-3 px-4">Status & KYC</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4 text-right">Lifetime Sales</th>
                <th className="py-3 px-4 text-right">Payout Due</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading seller data...
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Store className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No vendors match the current query or status filter.
                  </td>
                </tr>
              ) : (
                sellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedSeller(seller)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                          {seller.business_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {seller.business_name}
                            {seller.is_verified && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600" title="KYC Verified" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{seller.legal_name} • {seller.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(seller.status)}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                        <Percent className="w-3 h-3 text-slate-500" />
                        {seller.commission_rate}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                      ${seller.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-emerald-600">
                        ${seller.payout_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        ★ {seller.rating.toFixed(1)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSeller(seller)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          Details
                        </button>

                        {seller.status === "PENDING" && (
                          <button
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                seller,
                                action: "ACTIVE",
                                reason: "Verified business credentials and KYC.",
                              })
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors"
                          >
                            Approve
                          </button>
                        )}

                        {seller.status === "ACTIVE" && (
                          <button
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                seller,
                                action: "SUSPENDED",
                                reason: "",
                              })
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                          >
                            Suspend
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

      {/* Seller Detail Drawer */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg border border-emerald-200">
                  {selectedSeller.business_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {selectedSeller.business_name}
                    {selectedSeller.is_verified && (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    )}
                  </h2>
                  <p className="text-xs text-slate-500">ID: {selectedSeller.id} • Registered {new Date(selectedSeller.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Status and Action banner */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 block mb-1">Account Status</span>
                  {getStatusBadge(selectedSeller.status)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCommissionModal({
                        isOpen: true,
                        seller: selectedSeller,
                        rate: selectedSeller.commission_rate,
                      })
                    }
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    Edit Commission ({selectedSeller.commission_rate}%)
                  </button>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Financial Performance
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block">Total Sales</span>
                    <span className="text-lg font-bold text-slate-900">
                      ${selectedSeller.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                    <span className="text-xs text-emerald-700 block">Pending Payout</span>
                    <span className="text-lg font-bold text-emerald-800">
                      ${selectedSeller.payout_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block">Commission Retained</span>
                    <span className="text-lg font-bold text-slate-900">
                      ${((selectedSeller.total_sales * selectedSeller.commission_rate) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business & KYC Profile */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Company & KYC Information
                </h3>
                <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 divide-y divide-slate-100">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" /> Legal Name
                    </span>
                    <span className="font-semibold text-slate-900">{selectedSeller.legal_name}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" /> Business Reg No.
                    </span>
                    <span className="font-mono text-slate-900">{selectedSeller.business_registration_number || "REG-981240"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" /> Tax / VAT ID
                    </span>
                    <span className="font-mono text-slate-900">{selectedSeller.tax_id || "US-EIN-772911"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" /> Support Email
                    </span>
                    <span className="text-slate-900">{selectedSeller.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" /> Phone
                    </span>
                    <span className="text-slate-900">{selectedSeller.phone || "+1 (555) 019-2834"}</span>
                  </div>
                </div>
              </div>

              {/* Bank & Payout Routing */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Payout Bank Details
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                  <div>
                    <div className="font-bold text-slate-900">{selectedSeller.bank_details?.bank_name || "Silicon Valley Commerce Bank"}</div>
                    <div className="text-xs text-slate-500">
                      Acct: •••• {selectedSeller.bank_details?.account_number?.slice(-4) || "4920"} • Routing: {(selectedSeller.bank_details as any)?.routing_number || (selectedSeller.bank_details as any)?.ifsc_code || "021000021"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                {selectedSeller.status === "PENDING" && (
                  <>
                    <button
                      onClick={() =>
                        setStatusModal({
                          isOpen: true,
                          seller: selectedSeller,
                          action: "ACTIVE",
                          reason: "Approved business KYC credentials.",
                        })
                      }
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-xs transition-colors"
                    >
                      Approve & Verify Vendor
                    </button>
                    <button
                      onClick={() =>
                        setStatusModal({
                          isOpen: true,
                          seller: selectedSeller,
                          action: "REJECTED",
                          reason: "",
                        })
                      }
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-colors"
                    >
                      Reject Application
                    </button>
                  </>
                )}

                {selectedSeller.status === "ACTIVE" && (
                  <button
                    onClick={() =>
                      setStatusModal({
                        isOpen: true,
                        seller: selectedSeller,
                        action: "SUSPENDED",
                        reason: "",
                      })
                    }
                    className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Suspend Vendor Account
                  </button>
                )}

                {selectedSeller.status === "SUSPENDED" && (
                  <button
                    onClick={() =>
                      setStatusModal({
                        isOpen: true,
                        seller: selectedSeller,
                        action: "ACTIVE",
                        reason: "Reactivated after policy audit.",
                      })
                    }
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-xs transition-colors"
                  >
                    Reactivate Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Confirm Status Change: {statusModal.action}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              You are updating {statusModal.seller?.business_name} to {statusModal.action}.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason / Internal Moderation Note
              </label>
              <textarea
                value={statusModal.reason}
                onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                rows={3}
                placeholder="Specify the reason or documentation reviewed..."
                className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setStatusModal({ isOpen: false, seller: null, action: "ACTIVE", reason: "" })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleUpdateStatus}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {commissionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-600" />
              Adjust Seller Commission Rate
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Set custom platform fee percentage for {commissionModal.seller?.business_name}.
            </p>

            <div className="mt-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Commission Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={commissionModal.rate}
                  onChange={(e) =>
                    setCommissionModal({ ...commissionModal, rate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full p-2.5 pl-3 pr-10 text-base font-bold border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Default marketplace rate is 10%. Overriding will apply to all future orders placed with this vendor.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setCommissionModal({ isOpen: false, seller: null, rate: 10 })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleUpdateCommission}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Save Commission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
