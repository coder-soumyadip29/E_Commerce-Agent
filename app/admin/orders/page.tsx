"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  ExternalLink,
  ChevronRight,
  Store,
  DollarSign,
  Percent,
  RefreshCw,
  MapPin,
  User,
  CreditCard,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Order, SellerOrder } from "@/lib/types";

interface ExtendedOrder {
  id: string;
  user_id: string;
  total_amount: number;
  total?: number;
  status: string;
  created_at: string;
  shipping_address?: {
    full_name: string;
    street_address: string;
    city: string;
    state?: string;
    postal_code?: string;
    phone?: string;
  };
  seller_splits?: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingModal, setTrackingModal] = useState<{
    isOpen: boolean;
    sellerOrderId: string;
    trackingNumber: string;
    status: string;
  }>({
    isOpen: false,
    sellerOrderId: "",
    trackingNumber: "",
    status: "SHIPPED",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.counts) setCounts(data.counts);
        if (selectedOrder) {
          const updated = (data.orders || []).find((o: ExtendedOrder) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateParentStatus = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_parent_status",
          order_id: orderId,
          status: newStatus,
        }),
      });
      await fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSellerSubOrder = async () => {
    if (!trackingModal.sellerOrderId) return;
    try {
      setActionLoading(true);
      await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_seller_order_status",
          seller_order_id: trackingModal.sellerOrderId,
          status: trackingModal.status,
          tracking_number: trackingModal.trackingNumber,
        }),
      });
      setTrackingModal({ isOpen: false, sellerOrderId: "", trackingNumber: "", status: "SHIPPED" });
      await fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3.5 h-3.5 text-indigo-600" /> Shipped
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Package className="w-3.5 h-3.5 text-blue-600" /> Processing
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-emerald-600" />
            Marketplace Order Fulfillment Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervise parent customer orders, inspect multi-vendor order splits, track fulfillment shipments, and verify commission retentions.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Orders
        </button>
      </div>

      {/* KPI status filter tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: "All Orders", value: "ALL", count: counts.all, color: "text-slate-900" },
          { label: "Pending", value: "PENDING", count: counts.pending, color: "text-amber-600" },
          { label: "Processing", value: "PROCESSING", count: counts.processing, color: "text-blue-600" },
          { label: "Shipped", value: "SHIPPED", count: counts.shipped, color: "text-indigo-600" },
          { label: "Delivered", value: "DELIVERED", count: counts.delivered, color: "text-emerald-600" },
          { label: "Cancelled", value: "CANCELLED", count: counts.cancelled, color: "text-rose-600" },
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

      {/* Search and Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, customer, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </form>

        <div className="text-xs text-slate-500 font-medium">
          Showing {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Order Reference</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Vendor Fulfillment</th>
                <th className="py-3 px-4 text-right">Order Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No orders match your current filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const splitsCount = order.seller_splits?.length || 1;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{order.id}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {order.shipping_address?.full_name || "Verified Customer"}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {order.shipping_address?.city}, {order.shipping_address?.state || "US"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                            <Store className="w-3 h-3 text-emerald-600" />
                            {splitsCount} {splitsCount === 1 ? "Vendor" : "Vendors Split"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-base">
                        ${order.total_amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          Inspect Order <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Order #{selectedOrder.id}</h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Quick status update bar for parent order */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Master Order Status</span>
                  <span className="font-bold text-slate-900">{selectedOrder.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateParentStatus(selectedOrder.id, e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
                  >
                    <option value="PENDING">Set Pending</option>
                    <option value="PROCESSING">Set Processing</option>
                    <option value="SHIPPED">Set Shipped</option>
                    <option value="DELIVERED">Set Delivered</option>
                    <option value="CANCELLED">Set Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Customer & Shipping Address
                </h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    {selectedOrder.shipping_address?.full_name || "Customer"}
                  </div>
                  <div className="text-slate-600">
                    {selectedOrder.shipping_address?.street_address}
                  </div>
                  <div className="text-slate-600">
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}
                  </div>
                  <div className="text-xs text-slate-400 pt-1">
                    Phone: {selectedOrder.shipping_address?.phone || "N/A"}
                  </div>
                </div>
              </div>

              {/* Multi-Vendor Splits Breakdown */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Vendor Fulfillment Sub-Orders ({selectedOrder.seller_splits?.length || 1})</span>
                  <span className="text-emerald-600 font-semibold lowercase">automated splitting</span>
                </h3>

                <div className="space-y-4">
                  {(selectedOrder.seller_splits || []).map((split, idx) => (
                    <div
                      key={split.id || idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-900">{split.seller_name}</span>
                          <span className="text-xs font-mono text-slate-400">({split.seller_id})</span>
                        </div>
                        <div>{getStatusBadge(split.status)}</div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {(split.items || []).map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className="flex justify-between items-center text-xs">
                            <span className="font-medium text-slate-700">
                              {item.quantity}x {item.product_name || item.name}
                            </span>
                            <span className="font-bold text-slate-900">${(((item.price || item.unit_price || 0) * (item.quantity || 1))).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Financials & Commission Snapshot */}
                      <div className="pt-2 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">Subtotal</span>
                          <span className="font-bold text-slate-900">${(split.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">Commission ({split.commission_rate || 10}%)</span>
                          <span className="font-bold text-emerald-600">${(split.commission_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-400 block">Vendor Net</span>
                          <span className="font-bold text-slate-900">${(split.seller_payout_amount || split.seller_earnings || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Tracking / Action */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <div className="text-slate-500">
                          Tracking:{" "}
                          <span className="font-mono font-semibold text-slate-800">
                            {split.tracking_number || "Not assigned yet"}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setTrackingModal({
                              isOpen: true,
                              sellerOrderId: String(split.id),
                              trackingNumber: split.tracking_number || "",
                              status: split.status,
                            })
                          }
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Update Shipment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Master Totals */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Merchandise Value (GMV)</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Platform Retained Commission</span>
                  <span>
                    $
                    {(
                      selectedOrder.seller_splits?.reduce((a, b) => a + b.commission_amount, 0) ||
                      selectedOrder.total_amount * 0.1
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-base">
                  <span>Total Paid by Customer</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Tracking Modal */}
      {trackingModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Update Vendor Shipment & Tracking
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Sub-order: {trackingModal.sellerOrderId}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={trackingModal.status}
                  onChange={(e) => setTrackingModal({ ...trackingModal, status: e.target.value })}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Carrier Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1Z9999999999999999 or FEDEX-8192"
                  value={trackingModal.trackingNumber}
                  onChange={(e) => setTrackingModal({ ...trackingModal, trackingNumber: e.target.value })}
                  className="w-full p-2.5 text-sm font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setTrackingModal({ isOpen: false, sellerOrderId: "", trackingNumber: "", status: "SHIPPED" })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleUpdateSellerSubOrder}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Save Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
