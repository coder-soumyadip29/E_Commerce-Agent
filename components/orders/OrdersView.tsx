"use client";

import React, { useState, useEffect } from "react";
import { Order, OrderTrackingStatus, InvoiceData, OrderTrackingInfo } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { generateInvoiceData } from "@/lib/invoice";
import { InvoiceModal } from "@/components/cart/InvoiceModal";
import { SatelliteGpsModal } from "@/components/chat/SatelliteGpsModal";
import {
  Package,
  Calendar,
  CheckCircle,
  Truck,
  ArrowRight,
  Search,
  ShoppingBag,
  RotateCcw,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  ChevronRight,
  Phone,
  Navigation,
} from "lucide-react";

// Inline Printer icon for clean bundle-safe rendering
function PrinterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4 Lifecycle Stages Configuration
// ---------------------------------------------------------------------------
const TRACKING_STAGES: Array<{
  id: OrderTrackingStatus;
  title: string;
  subtitle: string;
}> = [
  {
    id: "placed",
    title: "Order Placed",
    subtitle: "Payment confirmed",
  },
  {
    id: "packing",
    title: "Packed & Inspected",
    subtitle: "Quality verified",
  },
  {
    id: "out_for_delivery",
    title: "Out for Delivery",
    subtitle: "Rider on the way",
  },
  {
    id: "delivered",
    title: "Delivered",
    subtitle: "Received at doorstep",
  },
];

function getStageIndex(status?: OrderTrackingStatus): number {
  if (!status) return 0;
  if (status === "cancelled") return -1;
  const idx = TRACKING_STAGES.findIndex((s) => s.id === status);
  return idx >= 0 ? idx : 0;
}

// ---------------------------------------------------------------------------
// Live Countdown Component
// ---------------------------------------------------------------------------
function LiveCountdown({ initialMinutes = 14 }: { initialMinutes?: number }) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60 + 35);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span className="text-xs font-mono font-bold tracking-wider">
        Arriving in {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} mins
      </span>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delivery Partner Contact Card Component
// ---------------------------------------------------------------------------
function DeliveryPartnerCard({ order }: { order: Order }) {
  const partner = order.delivery_partner || {
    name: "Rahul Sharma",
    phone: "+91 98451 22890",
    vehicle: "Ather 450X EV (WB-02-HA-8821)",
    badge: "Cartwise Plus Express Partner",
    rating: 4.9,
  };

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
          RS
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{partner.name}</h4>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
              ★ {partner.rating}
            </span>
          </div>
          <p className="text-xs text-emerald-700 font-medium">{partner.badge}</p>
          <p className="text-[11px] text-slate-500 font-mono">{partner.vehicle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> 1.2 km away
        </span>
        <a
          href={`tel:${partner.phone}`}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Rider</span>
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual Stepper Component
// ---------------------------------------------------------------------------
function OrderLifecycleStepper({ order }: { order: Order }) {
  const isCancelled = order.tracking_status === "cancelled" || order.status === "cancelled";
  const currentStageIndex = isCancelled ? -1 : getStageIndex(order.tracking_status);

  if (isCancelled) {
    return (
      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-rose-900">Order #{order.id} Cancelled</p>
          <p className="text-slate-600">
            {order.cancellation_reason || "Cancellation processed. Inventory restored to store catalog."}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">
            ✓ Full refund of ₹{order.total.toFixed(2)} refunded to original payment method.
          </p>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / TRACKING_STAGES.length) * 100));

  return (
    <div className="space-y-4">
      <div className="relative pt-2 pb-1">
        <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 rounded-full" />
        <div
          className="absolute top-4 left-4 h-1 bg-emerald-600 rounded-full transition-all duration-500"
          style={{ width: `calc(${progressPercent}% - 32px)` }}
        />

        <div className="relative z-10 grid grid-cols-4 gap-2">
          {TRACKING_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center text-center space-y-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isActive
                      ? "bg-white border-2 border-emerald-600 text-emerald-700 ring-4 ring-emerald-100 shadow-xs"
                      : "bg-slate-100 border border-slate-300 text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div>
                  <span
                    className={`text-[11px] font-bold block leading-tight ${
                      isActive ? "text-emerald-700" : isCompleted ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {stage.title}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:block">
                    {stage.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(order.tracking_status === "out_for_delivery" || order.tracking_status === "packing") && (
        <DeliveryPartnerCard order={order} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main OrdersView Component
// ---------------------------------------------------------------------------
export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "delivered" | "cancelled">("all");
  const { buyDirectly, setActiveTab } = useCart();
  const { user } = useUser();
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [activeGpsOrder, setActiveGpsOrder] = useState<OrderTrackingInfo | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/orders?userId=${user.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const handleReorder = async (orderId: number) => {
    setReorderingId(orderId);
    await buyDirectly(orderId);
    setReorderingId(null);
  };

  const handleSimulateNextStage = async (order: Order) => {
    setUpdatingOrderId(order.id);
    const stages: OrderTrackingStatus[] = ["placed", "packing", "out_for_delivery", "delivered"];
    const currentIdx = stages.indexOf(order.tracking_status || "placed");
    const nextStage = stages[(currentIdx + 1) % stages.length];

    try {
      const res = await fetch(`/api/orders/${order.id}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingStatus: nextStage,
          estimatedDeliveryTime: nextStage === "delivered" ? "Delivered" : `${(stages.length - stages.indexOf(nextStage)) * 12} mins`,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order : o)));
      }
    } catch (e) {
      console.error("Failed to simulate stage:", e);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm(`Are you sure you want to cancel Order #${orderId}? Product stock will be returned to store inventory.`)) {
      return;
    }
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Customer requested cancellation from Orders Dashboard" }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      } else {
        alert(data.error || "Cannot cancel this order.");
      }
    } catch (e) {
      console.error("Cancellation error:", e);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleOpenInvoice = (order: Order) => {
    const invoice = generateInvoiceData({
      order,
      items: order.items || [],
      paymentMethod: order.payment_method || "upi",
      transactionId: order.payment_id || `tx_sqlite_${order.id}`,
      finalTotal: order.total,
      subtotal: order.total,
    });
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.items && o.items.some((i) => i.product_name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      String(o.id).includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === "active") {
      return o.tracking_status === "placed" || o.tracking_status === "packing" || o.tracking_status === "out_for_delivery";
    }
    if (statusFilter === "delivered") {
      return o.tracking_status === "delivered" || o.status === "delivered";
    }
    if (statusFilter === "cancelled") {
      return o.tracking_status === "cancelled" || o.status === "cancelled";
    }

    return true;
  });

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-6 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full inline-block" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Orders &amp; Live Tracking
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Track live 15-minute deliveries, download GST invoices, and reorder Cartwise Plus favorites.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("chat")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Shop More Items</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by product name or order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "all"
                ? "bg-slate-950 text-amber-400 border border-amber-500/40 shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "active"
                ? "bg-slate-950 text-amber-400 border border-amber-500/40 shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setStatusFilter("delivered")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "delivered"
                ? "bg-slate-950 text-amber-400 border border-amber-500/40 shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "cancelled"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Loading your orders…</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders Found</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse our farm-fresh groceries and start placing orders with 15-minute delivery.
          </p>
          <button
            onClick={() => setActiveTab("chat")}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isReordering = reorderingId === order.id;
            const isDelivered = order.tracking_status === "delivered" || order.status === "delivered";
            const isCancelled = order.tracking_status === "cancelled" || order.status === "cancelled";
            const isCancellable = order.tracking_status === "placed" || order.tracking_status === "packing";

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col gap-4 text-slate-900"
              >
                {/* 1. Header Bar: Order ID, Status Badge & Countdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <span className="font-extrabold text-base text-slate-900 font-mono">
                      Order #{order.id}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                      {order.delivery_slot || "15-Min Express"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isDelivered
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isCancelled
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : order.tracking_status === "out_for_delivery"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isDelivered ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Delivered
                        </>
                      ) : isCancelled ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled
                        </>
                      ) : order.tracking_status === "out_for_delivery" ? (
                        <>
                          <Truck className="w-3.5 h-3.5 text-emerald-700 animate-bounce" /> Out for Delivery
                        </>
                      ) : (
                        <>
                          <Package className="w-3.5 h-3.5 text-amber-600" />{" "}
                          {order.tracking_status === "packing" ? "Packed & Inspected" : "Order Placed"}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isDelivered && !isCancelled && (
                      <LiveCountdown initialMinutes={order.tracking_status === "out_for_delivery" ? 12 : 25} />
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.created_at}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Visual Stepper Component & Lifecycle Progress */}
                <OrderLifecycleStepper order={order} />

                {/* 3. Purchased Items List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Items ({order.items?.reduce((s, i) => s + i.quantity, 0) || 0})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                              {item.product_name}
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              Qty: {item.quantity} • ₹{item.unit_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-xs">
                          ₹{(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Order Footer Actions & Pricing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Amount Paid</span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Advance Stage Simulator */}
                    <button
                      onClick={() => handleSimulateNextStage(order)}
                      disabled={updatingOrderId === order.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Advance to next delivery status"
                    >
                      <span>Simulate Status</span>
                    </button>

                    {/* Tax Invoice PDF Button */}
                    <button
                      onClick={() => handleOpenInvoice(order)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PrinterIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>Invoice</span>
                    </button>

                    {/* Cancel Order */}
                    {isCancellable && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={updatingOrderId === order.id}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}

                    {/* Live GPS Telemetry Button */}
                    {!isDelivered && !isCancelled && (
                      <button
                        onClick={() =>
                          setActiveGpsOrder({
                            orderId: `#${order.id}`,
                            productName: order.items?.[0]?.product_name || "CartWise Organic Essentials",
                            carrier: order.delivery_partner?.name
                              ? `${order.delivery_partner.name} (${order.delivery_partner.vehicle})`
                              : "CartWise FastFleet Rider (Ather 450X EV)",
                            status: "OUT FOR DELIVERY",
                            estimatedArrival: order.estimated_delivery_time || "12 mins",
                            step: "out_for_delivery",
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Open Live Mapbox GPS Tracking"
                      >
                        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live GPS</span>
                      </button>
                    )}

                    {/* Reorder Button */}
                    <button
                      onClick={() => handleReorder(order.id)}
                      disabled={isReordering}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
      />

      {/* Live Mapbox GPS Telemetry Modal */}
      <SatelliteGpsModal
        isOpen={Boolean(activeGpsOrder)}
        onClose={() => setActiveGpsOrder(null)}
        trackingInfo={activeGpsOrder}
        orderId={activeGpsOrder?.orderId}
        productName={activeGpsOrder?.productName}
        carrier={activeGpsOrder?.carrier}
        estimatedArrival={activeGpsOrder?.estimatedArrival}
      />
    </div>
  );
}
