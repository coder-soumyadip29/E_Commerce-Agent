"use client";

import React, { useState, useEffect } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  PackageCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { SellerOrder } from "@/lib/types";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Dispatch / Fulfillment Modal State
  const [shippingModalOrder, setShippingModalOrder] = useState<any | null>(null);
  const [carrier, setCarrier] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Reject Modal State
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("Item out of stock at warehouse");

  // Inspect Order Detail Modal
  const [viewOrder, setViewOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/orders");
      if (res.ok) {
        const json = await res.json();
        setOrders(json.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (
    subOrderId: number,
    status: string,
    extra?: { carrier?: string; trackingNumber?: string; rejectionReason?: string }
  ) => {
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subOrderId,
          status,
          ...extra,
        }),
      });

      if (res.ok) {
        setShippingModalOrder(null);
        setRejectModalOrder(null);
        await fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openShipModal = (order: any) => {
    setShippingModalOrder(order);
    setCarrier("Delhivery");
    setTrackingNumber(`DLV-${Date.now().toString().slice(-8)}`);
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      String(o.id).includes(search) ||
      String(o.order_id).includes(search) ||
      (o.items && o.items.some((i: any) => i.product_name?.toLowerCase().includes(search.toLowerCase())));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
              Store Orders & Split Fulfillment
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Fulfill customer sub-orders containing your items, generate shipping labels, and record tracking telemetry.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            Refresh Orders
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Sub-Order #, Item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {["ALL", "placed", "packing", "out_for_delivery", "delivered", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Orders" : st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Sub-Order & Date</th>
                  <th className="py-3 px-4">Customer Destination</th>
                  <th className="py-3 px-4">Items in Package</th>
                  <th className="py-3 px-4">Subtotal & Net Earnings</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No vendor orders found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">Sub-Order #{o.id}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Parent: #{o.order_id} • {new Date(o.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900">{o.customer_name}</div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {o.delivery_address?.city}, {o.delivery_address?.pincode}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-1">
                          {o.items?.map((item: any, idx: number) => (
                            <div key={idx} className="text-slate-800 leading-snug">
                              <span className="font-semibold">{item.product_name}</span>{" "}
                              <span className="text-slate-500 font-mono">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-sm">₹{o.subtotal}</div>
                        <div className="text-[11px] text-emerald-600 font-bold">
                          Net Earnings: ₹{o.seller_earnings}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Fee: ₹{o.commission_amount} ({o.commission_rate}%)
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {o.status === "delivered" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Delivered
                          </span>
                        )}
                        {o.status === "out_for_delivery" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Truck className="w-3 h-3" /> In Transit
                          </span>
                        )}
                        {o.status === "packing" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Packaging
                          </span>
                        )}
                        {o.status === "placed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Clock className="w-3 h-3" /> New Order
                          </span>
                        )}
                        {o.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" /> Cancelled
                          </span>
                        )}

                        {o.tracking_number && (
                          <div className="text-[10px] text-slate-500 font-mono mt-1">
                            {o.carrier}: {o.tracking_number}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* View details */}
                          <button
                            onClick={() => setViewOrder(o)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="Inspect Sub-Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Accept Order if placed */}
                          {o.status === "placed" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(o.id, "packing")}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                              >
                                Accept Order
                              </button>
                              <button
                                onClick={() => setRejectModalOrder(o)}
                                className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] hover:bg-rose-100"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Mark Packed & Dispatch */}
                          {o.status === "packing" && (
                            <button
                              onClick={() => openShipModal(o)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Truck className="w-3 h-3" /> Dispatch & Ship
                            </button>
                          )}

                          {/* Mark Delivered */}
                          {o.status === "out_for_delivery" && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, "delivered")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800"
                            >
                              Mark Delivered
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

        {/* Dispatch & Shipping Modal */}
        {shippingModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm mb-1">
                <Truck className="w-5 h-5 text-emerald-600" />
                Dispatch & Shipping Assignment
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Sub-Order #{shippingModalOrder.id} • Customer: {shippingModalOrder.customer_name}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Carrier</label>
                  <select
                    value={carrier}
                    onChange={(e) => {
                      setCarrier(e.target.value);
                      setTrackingNumber(`${e.target.value.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Delhivery">Delhivery Express</option>
                    <option value="Bluedart">Bluedart Priority</option>
                    <option value="FedEx">FedEx India</option>
                    <option value="Shadowfax">Shadowfax Hyperlocal</option>
                    <option value="EcomExpress">Ecom Express</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consignment Tracking Number</label>
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <div>Package Items: {shippingModalOrder.items?.map((i: any) => i.product_name).join(", ")}</div>
                  <div>Delivery Pin: {shippingModalOrder.delivery_address?.pincode}</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShippingModalOrder(null)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(shippingModalOrder.id, "out_for_delivery", {
                        carrier,
                        trackingNumber,
                      })
                    }
                    className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" /> Confirm Dispatch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Order Modal */}
        {rejectModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-1">
                <AlertCircle className="w-5 h-5" />
                Reject Order #{rejectModalOrder.id}
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Please provide a compliance reason for declining this order.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Item out of stock at warehouse">Item out of stock at warehouse</option>
                    <option value="Damaged inventory during quality check">Damaged inventory during quality check</option>
                    <option value="Address unserviceable by vendor courier">Address unserviceable by vendor courier</option>
                    <option value="Pricing discrepancy under audit">Pricing discrepancy under audit</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalOrder(null)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(rejectModalOrder.id, "cancelled", {
                        rejectionReason: rejectReason,
                      })
                    }
                    className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
                  >
                    Reject Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Inspector Drawer/Modal */}
        {viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Sub-Order Details #{viewOrder.id}</h3>
                  <div className="text-xs text-slate-400 font-mono">Parent Order: #{viewOrder.order_id}</div>
                </div>
                <button
                  onClick={() => setViewOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Financial Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Package Gross Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{viewOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Commission ({viewOrder.commission_rate}%):</span>
                    <span className="font-bold text-rose-600">-₹{viewOrder.commission_amount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-200 pt-2 text-sm">
                    <span>Your Net Payout:</span>
                    <span>₹{viewOrder.seller_earnings}</span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="font-bold text-slate-900 mb-2">Package Contents:</div>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {viewOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 flex justify-between items-center bg-white">
                        <div>
                          <div className="font-bold text-slate-800">{item.product_name}</div>
                          <div className="text-slate-400 font-mono text-[11px]">Quantity: {item.quantity}</div>
                        </div>
                        <div className="font-bold text-slate-900">₹{item.unit_price} each</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer destination */}
                <div>
                  <div className="font-bold text-slate-900 mb-1">Customer & Delivery:</div>
                  <div className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div><strong>Recipient:</strong> {viewOrder.customer_name}</div>
                    <div><strong>Address:</strong> {viewOrder.delivery_address?.street}, {viewOrder.delivery_address?.city} - {viewOrder.delivery_address?.pincode}</div>
                    <div><strong>Payment Method:</strong> {viewOrder.payment_method}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setViewOrder(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
