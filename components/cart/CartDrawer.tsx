"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Product, Order, UserAddressRecord, DeliverySlotId, InvoiceData } from "@/lib/types";
import { DELIVERY_SLOTS } from "@/lib/deliverySlots";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Tag,
  Check,
  Lock,
  Sparkles,
  MapPin,
  Clock,
  Home,
  Briefcase,
  Mail,
} from "lucide-react";
import { DynamicUpiQrModal } from "./DynamicUpiQrModal";
import { CardSecurityModal } from "./CardSecurityModal";
import { AddNewAddressModal } from "./AddNewAddressModal";
import { InvoiceModal } from "./InvoiceModal";

function PrinterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    total,
    isReviewOpen,
    setIsReviewOpen,
    isConfirmedOpen,
    setIsConfirmedOpen,
    confirmedOrder,
    setConfirmedOrder,
  } = useCart();

  // Address & Delivery Slot State
  const [savedAddresses, setSavedAddresses] = useState<UserAddressRecord[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<DeliverySlotId>("express_30min");
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [upiMode, setUpiMode] = useState<"qr" | "id">("qr");
  const [upiId, setUpiId] = useState("alex@okaxis");

  // Card details
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [cardHolder, setCardHolder] = useState("Alex Morgan");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // Promo code
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>("SAVE10");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(
    "Promo code SAVE10 active (15% savings)"
  );

  // Modal & Gateway States
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [gatewayOrder, setGatewayOrder] = useState<any>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<any>(null);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  // Load saved addresses from SQLite API
  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch("/api/addresses?userId=1");
        if (res.ok) {
          const data = await res.json();
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const def = data.addresses.find((a: any) => a.is_default) || data.addresses[0];
            setSelectedAddressId(def.id);
          }
        }
      } catch (e) {
        // Fallback
      }
    }
    loadAddresses();
  }, [isReviewOpen]);

  // Handle address added callback
  const handleAddressCreated = (newAddr: UserAddressRecord) => {
    setSavedAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddressId(newAddr.id);
  };

  // Browser Geolocation quick detect
  const handleDetectCurrentLocation = () => {
    setLocationNotice(null);
    if (!navigator.geolocation) {
      setLocationNotice("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.village || addr.county || "Kolkata";
            const pincode = addr.postcode || "700156";
            const street = [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", ") || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            // Save detected address to database
            const saveRes = await fetch("/api/addresses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: 1,
                address: {
                  name: "Current GPS Location",
                  phone: "+91 98765 43210",
                  street_address: street,
                  landmark: addr.neighbourhood || addr.suburb || "Detected via Browser",
                  city,
                  pincode,
                  type: "Other",
                  is_default: true,
                },
              }),
            });
            if (saveRes.ok) {
              const savedData = await saveRes.json();
              if (savedData.address) {
                setSavedAddresses((prev) => [savedData.address, ...prev]);
                setSelectedAddressId(savedData.address.id);
                setLocationNotice(`📍 Switched to current location: ${city} ${pincode}`);
              }
            }
          }
        } catch (e) {
          setLocationNotice("Could not resolve current location. Please pick a saved address.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        setLocationNotice("Location permission denied. Please select from saved addresses.");
      },
      { timeout: 8000 }
    );
  };

  if (!isCartOpen && !isReviewOpen && !isConfirmedOpen) {
    return null;
  }

  // Calculate dynamic verified totals
  const currentSubtotal = subtotal;
  const currentDiscount =
    appliedPromo === "SAVE10"
      ? Number((currentSubtotal * 0.15).toFixed(2))
      : discountAmount;
  const finalPayableTotal = Math.max(0, Number((currentSubtotal - currentDiscount).toFixed(2)));

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === "SAVE10" || code === "ORGANIC10") {
      setAppliedPromo(code);
      setDiscountAmount(Number((currentSubtotal * 0.15).toFixed(2)));
      setPromoMessage(`Promo code ${code} applied! 15% discount activated.`);
    } else if (code === "SAVE20" || code === "ORGANIC20") {
      setAppliedPromo(code);
      setDiscountAmount(Number((currentSubtotal * 0.2).toFixed(2)));
      setPromoMessage(`Promo code ${code} applied! 20% mega discount.`);
    } else {
      setPromoMessage("Invalid promo code. Try SAVE10 (15% off) or ORGANIC20 (20% off).");
    }
  };

  const handleProceedToReview = () => {
    setIsCartOpen(false);
    setIsReviewOpen(true);
    setCheckoutError(null);
  };

  // Step 1: Initialize Payment Order on Server
  const handleInitiatePayment = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);
    setCheckoutError(null);

    try {
      const payload = {
        cartItems: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        discountCode: appliedPromo || undefined,
        paymentMethod,
      };

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCheckoutError(data.error || "Payment creation failed.");
        setIsPlacingOrder(false);
        return;
      }

      setGatewayOrder(data);

      if (paymentMethod === "upi") {
        setIsUpiModalOpen(true);
      } else if (paymentMethod === "card") {
        setIsCardModalOpen(true);
      } else if (paymentMethod === "cod") {
        // Direct COD execution
        await completeOrderPlacement({
          orderId: data.orderId,
          paymentId: `COD-${Date.now().toString().slice(-6)}`,
          method: "cod",
          amount: data.amount,
          status: "confirmed",
        });
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to initialize secure payment.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Step 2: Finalize Verified Order & Send Notification
  const completeOrderPlacement = async (receipt: any) => {
    setIsPlacingOrder(true);
    try {
      const activeAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0] || {
        name: "Valued Customer",
        phone: "+91 98765 43210",
        street_address: "New Town Main Road",
        city: "Kolkata",
        pincode: "700156",
        type: "Home",
      };

      const activeSlot = DELIVERY_SLOTS.find((s) => s.id === selectedSlotId) || DELIVERY_SLOTS[0];

      const checkoutPayload = {
        cartItems: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        paymentDetails: {
          ...receipt,
          deliveryAddress: activeAddress,
          deliverySlot: activeSlot,
        },
        discountCode: appliedPromo || undefined,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setCheckoutError(result.error || "Order finalization failed.");
        setIsPlacingOrder(false);
        return;
      }

      setPaymentReceipt(receipt);
      setConfirmedOrder(result.order);
      if (result.invoice) {
        setActiveInvoice(result.invoice);
      }
      if (result.emailDispatched) {
        setEmailNotice(`📧 Order confirmation & GST tax invoice dispatched to ${result.emailRecipient || "customer email"}.`);
      } else {
        setEmailNotice(null);
      }
      clearCart();
      setIsReviewOpen(false);
      setIsConfirmedOpen(true);
    } catch (err: any) {
      setCheckoutError(err.message || "Network error while finalizing order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleUpiModalSuccess = async (receipt: any) => {
    setIsUpiModalOpen(false);
    await completeOrderPlacement(receipt);
  };

  const handleCardModalSuccess = async (receipt: any) => {
    setIsCardModalOpen(false);
    await completeOrderPlacement(receipt);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
        <div className="bg-white text-slate-900 w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200">
          {/* Top Stepper Navigation Bar */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCartOpen ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  1
                </span>
                <span className={isCartOpen ? "text-slate-900 font-bold" : "text-slate-500"}>
                  Cart Items
                </span>
              </div>
              <div className="w-4 h-px bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isReviewOpen ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  2
                </span>
                <span className={isReviewOpen ? "text-slate-900 font-bold" : "text-slate-500"}>
                  Payment & Review
                </span>
              </div>
              <div className="w-4 h-px bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isConfirmedOpen ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  3
                </span>
                <span className={isConfirmedOpen ? "text-slate-900 font-bold" : "text-slate-500"}>
                  Confirmed
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsReviewOpen(false);
                setIsConfirmedOpen(false);
              }}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* VIEW 1: CART ITEMS */}
          {isCartOpen && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Your Cart is Empty</h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Explore our organic catalog or ask CartWise assistant to find items for your kitchen.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Shopping Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)
                      </h2>
                      <button
                        onClick={clearCart}
                        className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    {cart.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 flex gap-3.5 items-center shadow-xs"
                      >
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg bg-slate-50 p-1 flex items-center justify-center flex-shrink-0 border border-slate-100">
                          <img
                            src={product.image_url || "/images/honey.png"}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/honey.png";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight truncate mb-1">
                            {product.name}
                          </h4>
                          <span className="text-xs text-slate-500 font-semibold block mb-2">
                            ₹{product.price.toFixed(2)} each
                          </span>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                              <button
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="p-1 hover:bg-slate-200 text-slate-600 cursor-pointer rounded-l-lg"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-bold text-slate-900">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="p-1 hover:bg-slate-200 text-slate-600 cursor-pointer rounded-r-lg"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-sm sm:text-base font-black text-slate-900 block">
                            ₹{(product.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Box */}
                  <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
                    <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-200">
                      Bill Details
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Item Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                        <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery Fee</span>
                        <span className="font-bold text-emerald-700">FREE</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="font-bold text-sm text-slate-900">To Pay</span>
                      <span className="font-black text-lg text-slate-900">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handleProceedToReview}
                      className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/40 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Checkout</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Safe and secure payments • 100% Authentic</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: PAYMENT METHOD SELECTION & ORDER REVIEW */}
          {isReviewOpen && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              <div className="max-w-3xl mx-auto space-y-5">
                {checkoutError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <strong className="block font-bold">Transaction Notice</strong>
                      <span>{checkoutError}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-0.5">
                    Select Payment & Confirm Delivery
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified grocery checkout with real-time stock allocation.
                  </p>
                </div>

                {/* 1. Saved Address Selection */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivery Address</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        disabled={isDetectingLocation}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDetectingLocation ? "Detecting..." : "📍 Use GPS"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New</span>
                      </button>
                    </div>
                  </div>

                  {locationNotice && (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                      {locationNotice}
                    </div>
                  )}

                  {savedAddresses.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <p className="text-xs text-slate-500">No saved addresses found.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                      >
                        + Add Delivery Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? "bg-emerald-50/70 border-emerald-500 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {addr.type}
                              </span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="text-xs">
                              <span className="font-bold text-slate-900 block">
                                {addr.name} ({addr.phone})
                              </span>
                              <p className="text-[11px] text-slate-600 line-clamp-1">
                                {addr.street_address}
                              </p>
                              <p className="text-[11px] font-medium text-slate-500">
                                {addr.city} • {addr.pincode}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Delivery Slot Picker */}
                <div className="space-y-2.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Choose Delivery Slot</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {DELIVERY_SLOTS.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? "bg-emerald-50/70 border-emerald-500 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {slot.badge}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div>
                            <strong className="block text-xs font-bold text-slate-900">
                              {slot.title}
                            </strong>
                            <span className="text-[11px] font-semibold text-emerald-700 block">
                              {slot.timeWindow}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Payment Mode Selector Tabs */}
                <div className="space-y-2.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block">
                    Choose Payment Method
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        paymentMethod === "upi"
                          ? "bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 self-start">
                        Recommended
                      </span>
                      <div>
                        <strong className="block text-xs font-bold text-slate-900">UPI / QR</strong>
                        <span className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        paymentMethod === "card"
                          ? "bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-slate-600" />
                      <div>
                        <strong className="block text-xs font-bold text-slate-900">Cards & Bank</strong>
                        <span className="text-[10px] text-slate-500">Debit, Credit, Netbanking</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        paymentMethod === "cod"
                          ? "bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 self-start">
                        Cash
                      </span>
                      <div>
                        <strong className="block text-xs font-bold text-slate-900">Cash on Delivery</strong>
                        <span className="text-[10px] text-slate-500">Pay on doorstep</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4. Promo Code Coupon Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter coupon code (SAVE10 or ORGANIC20)"
                        className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-9 pr-3 text-xs uppercase font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      type="button"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pl-1">
                      <span>{promoMessage}</span>
                    </p>
                  )}
                </div>

                {/* 5. Verified Price Breakdown */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block pb-2 border-b border-slate-100">
                    Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">₹{currentSubtotal.toFixed(2)}</span>
                    </div>
                    {currentDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Coupon Discount ({appliedPromo})</span>
                        <span>-₹{currentDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="text-emerald-700 font-bold">FREE</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-base sm:text-lg text-slate-900">
                    <span>Final Payable Amount</span>
                    <span className="text-slate-900">₹{finalPayableTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Confirm & Pay Button */}
                <button
                  onClick={handleInitiatePayment}
                  disabled={isPlacingOrder}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all cursor-pointer active:scale-98 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isPlacingOrder
                      ? "Processing order…"
                      : paymentMethod === "cod"
                      ? `Place Cash on Delivery Order (₹${finalPayableTotal.toFixed(2)})`
                      : `Pay ₹${finalPayableTotal.toFixed(2)}`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: ORDER CONFIRMED */}
          {isConfirmedOpen && (
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-center flex flex-col justify-center items-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    Order Placed Successfully
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Order #{confirmedOrder?.id || "1042"} Confirmed
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Your farm-fresh items will be packed and delivered in 15 minutes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 space-y-2.5 text-left">
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-mono font-bold text-slate-900">#{confirmedOrder?.id || 1042}</span>
                  </div>

                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-bold text-slate-900 uppercase">
                      {paymentReceipt?.method || paymentMethod}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">
                      Items Ordered
                    </span>
                    {confirmedOrder?.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-800">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-medium text-slate-900">₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-black text-slate-900 text-sm border-t border-slate-200">
                      <span>Total Paid</span>
                      <span>₹{confirmedOrder?.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {emailNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 text-left">
                    <Mail className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span>{emailNotice}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    <span>Print Tax Invoice (PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmedOpen(false)}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UPI Dynamic QR Modal */}
      {gatewayOrder && (
        <DynamicUpiQrModal
          isOpen={isUpiModalOpen}
          onClose={() => setIsUpiModalOpen(false)}
          orderId={gatewayOrder.orderId}
          amount={gatewayOrder.amount}
          onPaymentSuccess={handleUpiModalSuccess}
        />
      )}

      {/* Card 3D-Secure Modal */}
      {gatewayOrder && (
        <CardSecurityModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          orderId={gatewayOrder.orderId}
          amount={gatewayOrder.amount}
          last4={cardNumber.replace(/\s+/g, "").slice(-4)}
          bankName={selectedBank}
          onVerificationSuccess={handleCardModalSuccess}
        />
      )}

      {/* Add New Address Modal */}
      <AddNewAddressModal
        isOpen={isAddAddressModalOpen}
        onClose={() => setIsAddAddressModalOpen(false)}
        onAddressCreated={handleAddressCreated}
      />

      {/* Printable GST Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={activeInvoice}
      />
    </>
  );
}
