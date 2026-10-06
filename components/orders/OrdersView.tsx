"use client";

import React, { useState, useEffect } from "react";
import { Order, OrderTrackingStatus, InvoiceData } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { generateInvoiceData } from "@/lib/invoice";
import { InvoiceModal } from "@/components/cart/InvoiceModal";
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
} from "lucide-react";

// Inline Printer icon for clean bundle-safe rendering
function PrinterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
  badge: string;
  color: string;
  activeRing: string;
  dotColor: string;
}> = [
  {
    id: "placed",
    title: "Order Placed",
    subtitle: "Payment confirmed & received",
    badge: "🟡 Step 1",
    color: "from-amber-500 to-amber-600",
    activeRing: "ring-amber-500/40 text-amber-400 border-amber-400",
    dotColor: "bg-amber-400",
  },
  {
    id: "packing",
    title: "Order Packed & Checked",
    subtitle: "100% organic quality certified",
    badge: "🟠 Step 2",
    color: "from-orange-500 to-orange-600",
    activeRing: "ring-orange-500/40 text-orange-400 border-orange-400",
    dotColor: "bg-orange-400",
  },
  {
    id: "out_for_delivery",
    title: "Out for Delivery",
    subtitle: "Assigned to FastFleet EV Rider",
    badge: "🔵 Step 3",
    color: "from-cyan-500 to-blue-600",
    activeRing: "ring-cyan-500/40 text-cyan-400 border-cyan-400",
    dotColor: "bg-cyan-400",
  },
  {
    id: "delivered",
    title: "Delivered",
    subtitle: "Handed over at doorstep",
    badge: "🟢 Complete",
    color: "from-emerald-500 to-teal-600",
    activeRing: "ring-emerald-500/40 text-emerald-400 border-emerald-400",
    dotColor: "bg-emerald-400",
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
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow shrink-0" />
      <span className="text-[11px] font-mono font-bold tracking-wider">
        Arriving in {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} mins
      </span>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
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
    vehicle: "Ather 450X EV (KA-03-HA-8821)",
    badge: "FastFleet Certified EV Rider",
    rating: 4.9,
  };

  return (
    <div className="mt-4 p-4 rounded-2xl bg-[#0f172a] border border-white/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-md">
            <div className="w-full h-full bg-[#131b2e] rounded-[14px] flex items-center justify-center text-cyan-300 font-extrabold text-base">
              RS
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0f172a] flex items-center justify-center text-[9px] text-white">
            ✓
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-white">{partner.name}</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
              ★ {partner.rating}
            </span>
          </div>
          <p className="text-xs text-cyan-300 font-medium mt-0.5">{partner.badge}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {partner.vehicle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="text-right hidden sm:block">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Telemetry</span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" /> 1.4 km away
          </span>
        </div>

        <a
          href={`tel:${partner.phone}`}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
        >
          <PhoneIcon className="w-3.5 h-3.5" />
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
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-rose-200">Order #{order.id} Cancelled</p>
          <p className="text-slate-300">
            {order.cancellation_reason || "Cancellation processed. Inventory restored to stock."}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">
            ✓ Full refund of ${order.total.toFixed(2)} initiated to original payment source.
          </p>
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercent = Math.min(100, Math.round(((currentStageIndex + 1) / TRACKING_STAGES.length) * 100));

  return (
    <div className="space-y-5">
      {/* Visual Stepper Horizontal Bar */}
      <div className="relative pt-2 pb-2">
        {/* Background track bar */}
        <div className="absolute top-5 left-4 right-4 h-1.5 bg-white/10 rounded-full" />

        {/* Animated Active Progress Fill */}
        <div
          className="absolute top-5 left-4 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 rounded-full transition-all duration-700 shadow-sm shadow-cyan-500/50"
          style={{ width: `calc(${progressPercent}% - 32px)` }}
        />

        {/* 4 Interactive Milestones */}
        <div className="relative z-10 grid grid-cols-4 gap-2">
          {TRACKING_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;
            const isFuture = idx > currentStageIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center text-center space-y-2">
                {/* Step Circle with Animated Pulsing Ring */}
                <div className="relative flex items-center justify-center">
                  {isActive && (
                    <span className="absolute -inset-1.5 rounded-full bg-cyan-400/30 animate-ping opacity-75" />
                  )}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : isActive
                        ? "bg-[#0b1120] border-2 border-cyan-400 text-cyan-300 ring-4 ring-cyan-500/25 shadow-lg shadow-cyan-500/30"
                        : "bg-[#161f36] border border-white/10 text-slate-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                </div>

                {/* Stage Labels */}
                <div>
                  <span
                    className={`text-[11px] sm:text-xs font-extrabold block leading-tight ${
                      isActive
                        ? "text-cyan-300"
                        : isCompleted
                        ? "text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {stage.title}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5 leading-tight">
                    {stage.subtitle}
                  </span>
                  {isActive && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold uppercase tracking-wider">
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rider Card if Out for Delivery or Packing */}
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
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  // Active Tax Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Stage Simulator & Cancel Action States
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = async (orderId: number) => {
    setReorderingId(orderId);
    await buyDirectly(orderId);
    setReorderingId(null);
  };

  // Stage Simulation Handler
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

  // Order Cancellation Handler
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

  // Open Printable Tax Invoice Modal
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
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
              Real-Time Tracking Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              FastFleet EV Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Order Journey &amp; History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live lifecycle tracking, driver telemetry, GST invoices, and SQLite database audit.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("chat")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <span>Ask AI Copilot</span>
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
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#0f172a] border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "all"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "bg-[#0f172a] border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "active"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "bg-[#0f172a] border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            Live Active (
            {orders.filter(
              (o) =>
                o.tracking_status === "placed" ||
                o.tracking_status === "packing" ||
                o.tracking_status === "out_for_delivery"
            ).length}
            )
          </button>
          <button
            onClick={() => setStatusFilter("delivered")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "delivered"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                : "bg-[#0f172a] border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === "cancelled"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "bg-[#0f172a] border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Connecting to SQLite orders telemetry…</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#162036] text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Use the chat assistant to discover truthful products from our catalog and place your first order.
          </p>
          <button
            onClick={() => setActiveTab("chat")}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            Browse Products in Chat
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isReordering = reorderingId === order.id;
            const isDelivered = order.tracking_status === "delivered" || order.status === "delivered";
            const isCancelled = order.tracking_status === "cancelled" || order.status === "cancelled";
            const isCancellable = order.tracking_status === "placed" || order.tracking_status === "packing";

            return (
              <article
                key={order.id}
                className="bg-[#0b101e] rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl hover:border-white/20 transition-all flex flex-col gap-5 text-white"
              >
                {/* 1. Header Bar: Order ID, Status Badge & Countdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <span className="font-extrabold text-base sm:text-lg text-white font-mono">
                      Order #{order.id}
                    </span>

                    {/* Delivery Slot Badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{order.delivery_slot || "Instant 30-Min Express"}</span>
                    </span>

                    {/* Live Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isDelivered
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
                          : isCancelled
                          ? "bg-rose-500/10 text-rose-300 border border-rose-400/20"
                          : order.tracking_status === "out_for_delivery"
                          ? "bg-cyan-500/10 text-cyan-300 border border-cyan-400/30"
                          : "bg-amber-500/10 text-amber-300 border border-amber-400/20"
                      }`}
                    >
                      {isDelivered ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Delivered
                        </>
                      ) : isCancelled ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Cancelled
                        </>
                      ) : order.tracking_status === "out_for_delivery" ? (
                        <>
                          <Truck className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Out for Delivery
                        </>
                      ) : (
                        <>
                          <Package className="w-3.5 h-3.5 text-amber-400" />{" "}
                          {order.tracking_status === "packing" ? "Packed & Inspected" : "Order Placed"}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Right Header: Countdown or Delivered Date */}
                  <div className="flex items-center gap-3">
                    {!isDelivered && !isCancelled && (
                      <LiveCountdown initialMinutes={order.tracking_status === "out_for_delivery" ? 14 : 28} />
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{order.created_at}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Visual Stepper Component & Lifecycle Progress */}
                <OrderLifecycleStepper order={order} />

                {/* 3. Purchased Items List */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Order Items ({order.items?.reduce((s, i) => s + i.quantity, 0) || 0})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-[#0f172a] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-300 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block truncate max-w-[180px]">
                              {item.product_name}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Qty: {item.quantity} • Unit: ${item.unit_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-400 text-sm">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Order Footer Actions & Interactive Engine */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Amount</span>
                      <span className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>

                    {order.payment_method && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase font-mono text-slate-400 border border-white/10">
                        {order.payment_method}
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Advance Stage Simulator Pill */}
                    {!isCancelled && (
                      <button
                        onClick={() => handleSimulateNextStage(order)}
                        disabled={updatingOrderId === order.id}
                        title="Simulate advancing to next real-time lifecycle milestone"
                        className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Advance Stage</span>
                      </button>
                    )}

                    {/* View Tax Invoice PDF */}
                    <button
                      onClick={() => handleOpenInvoice(order)}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PrinterIcon className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Tax Invoice (PDF)</span>
                    </button>

                    {/* Cancel Order (Enabled during placed / packing) */}
                    {isCancellable && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={updatingOrderId === order.id}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Buy Again Button */}
                    <button
                      onClick={() => handleReorder(order.id)}
                      disabled={isReordering}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isReordering ? "Adding…" : "Buy Again"}</span>
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
    </div>
  );
}
