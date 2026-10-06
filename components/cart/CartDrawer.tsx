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
  const [selectedBank, setSelectedBank] = useState("JPMorgan Chase");

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
            const street = [addr.house_number, addr.road || addr.street, addr.suburb]
              .filter(Boolean)
              .join(", ") || `GPS Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
            const city = addr.city || addr.town || addr.municipality || "Bangalore";
            const pincode = addr.postcode ? addr.postcode.replace(/\D/g, "").slice(0, 6) : "560103";

            // Save detected address to SQLite via API
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

  // Step 1: Initialize Payment Order on Server (With SQLite Price Verification)
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
        setIsPlacingOrder(false);
      } else if (paymentMethod === "card") {
        setIsCardModalOpen(true);
        setIsPlacingOrder(false);
      } else if (paymentMethod === "cod") {
        await handleCompleteVerification(
          data.orderId,
          `cod_${data.orderId}`,
          "cod_signature_verified"
        );
      }
    } catch (e: any) {
      console.error("Order creation failed", e);
      setCheckoutError("Failed to initiate payment. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  // Step 2: Verify Cryptographic Signature & Atomically Create SQLite Order
  const handleCompleteVerification = async (
    orderId: string,
    paymentId: string,
    signature: string,
    details?: any
  ) => {
    setIsPlacingOrder(true);
    try {
      const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0] || null;
      const selectedSlot = DELIVERY_SLOTS.find((s) => s.id === selectedSlotId) || DELIVERY_SLOTS[0];

      const verifyPayload = {
        orderId,
        paymentId,
        signature,
        paymentMethod,
        addressId: selectedAddressId,
        deliveryAddress: selectedAddr,
        deliverySlot: selectedSlot,
        paymentDetails: {
          ...(details || {}),
          deliveryAddress: selectedAddr,
          deliverySlot: selectedSlot,
          upiId: paymentMethod === "upi" ? upiId : undefined,
          cardLast4: paymentMethod === "card" ? cardNumber.replace(/\s+/g, "").slice(-4) : undefined,
          cardBrand: "Visa Platinum",
          bank: selectedBank,
        },
        cartItems: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        discountCode: appliedPromo || undefined,
      };

      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyPayload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setPaymentReceipt(data.payment);
        setConfirmedOrder(data.order);
        if (data.invoice) {
          setActiveInvoice(data.invoice);
        }
        if (data.emailStatus?.message) {
          setEmailNotice(data.emailStatus.message);
        }
        clearCart();
        setIsReviewOpen(false);
        setIsUpiModalOpen(false);
        setIsCardModalOpen(false);
        setIsConfirmedOpen(true);
      } else {
        setCheckoutError(data.error || "Signature verification failed.");
      }
    } catch (e: any) {
      console.error("Verification failed", e);
      setCheckoutError("Payment verification network error.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleUpiModalSuccess = async (mockPayId: string, app: string) => {
    if (!gatewayOrder) return;
    const sig = "sandbox_signature_" + mockPayId;
    await handleCompleteVerification(gatewayOrder.orderId, mockPayId, sig, {
      upiApp: app,
      upiId: `user@${app}`,
    });
  };

  const handleCardModalSuccess = async (mockPayId: string) => {
    if (!gatewayOrder) return;
    const sig = "sandbox_signature_" + mockPayId;
    await handleCompleteVerification(gatewayOrder.orderId, mockPayId, sig, {
      cardLast4: cardNumber.replace(/\s+/g, "").slice(-4),
      cardBrand: "Visa Platinum",
      bank: selectedBank,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
        <div className="bg-[#0e1422] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
          {/* TOP STEPPER HEADER */}
          <div className="bg-[#12192b] border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isReviewOpen) {
                    setIsReviewOpen(false);
                    setIsCartOpen(true);
                  } else {
                    setIsCartOpen(false);
                    setIsReviewOpen(false);
                    setIsConfirmedOpen(false);
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isReviewOpen ? "Back to Cart" : "Continue Shopping"}</span>
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCartOpen ? "bg-cyan-500 text-black font-extrabold" : "bg-white/10 text-slate-400"
                  }`}
                >
                  1
                </span>
                <span className={isCartOpen ? "text-cyan-300 font-bold" : "text-slate-400"}>Cart</span>
              </div>
              <div className="w-6 h-px bg-white/15" />
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isReviewOpen ? "bg-cyan-500 text-black font-extrabold" : "bg-white/10 text-slate-400"
                  }`}
                >
                  2
                </span>
                <span className={isReviewOpen ? "text-cyan-300 font-bold" : "text-slate-400"}>
                  Payment & Review
                </span>
              </div>
              <div className="w-6 h-px bg-white/15" />
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isConfirmedOpen ? "bg-emerald-400 text-black font-extrabold" : "bg-white/10 text-slate-400"
                  }`}
                >
                  3
                </span>
                <span className={isConfirmedOpen ? "text-emerald-400 font-bold" : "text-slate-400"}>
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
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* VIEW 1: CART ITEMS */}
          {isCartOpen && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-[#141b2c] text-slate-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Your Cart is Empty</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Explore our verified organic catalog or ask CartWise to find items for your pantry.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Start Browsing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                  <div className="lg:col-span-7 space-y-3.5">
                    <div className="flex items-center justify-between pb-2">
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        Your Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)
                      </h2>
                      <button
                        onClick={clearCart}
                        className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    {cart.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="bg-[#12192a] border border-white/10 rounded-2xl p-4 flex gap-4 items-center shadow-md"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#090d16] p-1.5 flex items-center justify-center flex-shrink-0">
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
                          <h4 className="font-bold text-sm sm:text-base text-white leading-tight break-words mb-1">
                            {product.name}
                          </h4>
                          <span className="text-xs text-cyan-400 font-semibold block mb-2">
                            ${product.price.toFixed(2)} each
                          </span>

                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center border border-white/15 rounded-lg bg-[#0c101c]">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="p-1 hover:bg-white/10 text-slate-300 cursor-pointer rounded-l-lg"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-bold text-white">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="p-1 hover:bg-white/10 text-slate-300 cursor-pointer rounded-r-lg"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-base sm:text-lg font-black text-emerald-400 block">
                            ${(product.price * quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Box */}
                  <div className="lg:col-span-5 bg-[#12192a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
                    <h3 className="font-bold text-base text-white pb-3 border-b border-white/10">
                      Order Summary
                    </h3>

                    <div className="space-y-2.5 text-xs sm:text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>Item Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                        <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Standard Delivery</span>
                        <span className="font-bold text-emerald-400">FREE</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                      <span className="font-bold text-base text-white">Estimated Total</span>
                      <span className="font-black text-xl sm:text-2xl text-cyan-300">
                        ${total.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handleProceedToReview}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-sm hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Payment & Review</span>
                    </button>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Zero-tampering price guarantee • Backed by SQLite</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: PAYMENT METHOD SELECTION & ORDER REVIEW */}
          {isReviewOpen && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {checkoutError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <strong className="block font-bold">Transaction Notice</strong>
                      <span>{checkoutError}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Payment Gateway & Review
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Select your payment method. Prices are securely verified on the server against SQLite.
                  </p>
                </div>

                {/* 1. Saved Address Selection Pills */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Delivery Address (SQLite Logistics):</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        disabled={isDetectingLocation}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDetectingLocation ? (
                          <>
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            <span>Detecting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                            </svg>
                            <span>📍 Use Current Location</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New Address</span>
                      </button>
                    </div>
                  </div>

                  {locationNotice && (
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{locationNotice}</span>
                    </div>
                  )}

                  {savedAddresses.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-[#141b2c] border border-white/10 text-center space-y-2">
                      <p className="text-xs text-slate-400">No saved addresses found.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-pointer"
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
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                              isSelected
                                ? "bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/10"
                                : "bg-[#131b2c] border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    addr.type === "Home"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : addr.type === "Work"
                                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                      : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  }`}
                                >
                                  {addr.type === "Home" && <Home className="w-2.5 h-2.5" />}
                                  {addr.type === "Work" && <Briefcase className="w-2.5 h-2.5" />}
                                  {addr.type === "Other" && (
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                                      <line x1="9" y1="22" x2="9" y2="22.01" />
                                      <line x1="15" y1="22" x2="15" y2="22.01" />
                                    </svg>
                                  )}
                                  <span>{addr.type}</span>
                                </span>
                                {addr.is_default && (
                                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "border-cyan-400 bg-cyan-400 text-black"
                                    : "border-white/20 bg-white/5"
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="text-xs space-y-0.5">
                              <span className="font-bold text-white block">
                                {addr.name}{" "}
                                <span className="font-normal text-slate-400 text-[11px] block sm:inline">
                                  ({addr.phone})
                                </span>
                              </span>
                              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                                {addr.street_address}
                                {addr.landmark ? ` • ${addr.landmark}` : ""}
                              </p>
                              <p className="text-[11px] font-mono font-medium text-cyan-300">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Choose Delivery Slot:</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      Hyperlocal Logistics
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {DELIVERY_SLOTS.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/10"
                              : "bg-[#131b2c] border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                slot.id === "express_30min"
                                  ? "bg-emerald-400/20 text-emerald-300"
                                  : slot.id === "morning_slot"
                                  ? "bg-amber-400/20 text-amber-300"
                                  : "bg-indigo-400/20 text-indigo-300"
                              }`}
                            >
                              {slot.badge}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-amber-400 bg-amber-400 text-black"
                                  : "border-white/20 bg-white/5"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div>
                            <strong className="block text-xs font-bold text-white mb-0.5">
                              {slot.title}
                            </strong>
                            <span className="text-[11px] font-semibold text-amber-300 block">
                              {slot.timeWindow}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                              {slot.subtitle}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Payment Mode Selector Tabs */}
                <div className="space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block">
                    Choose Payment Mode:
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">

                    {/* UPI Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        paymentMethod === "upi"
                          ? "bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                          : "bg-[#131b2c] border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <svg className="w-5 h-5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300">
                          Popular
                        </span>
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-white">UPI / QR Sandbox</strong>
                        <span className="text-[10px] text-slate-400 leading-tight">GPay, PhonePe, Paytm, QR</span>
                      </div>
                    </button>

                    {/* Cards & Netbanking Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        paymentMethod === "card"
                          ? "bg-indigo-500/15 border-indigo-400 text-white shadow-lg shadow-indigo-500/10"
                          : "bg-[#131b2c] border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      <CreditCard className={`w-5 h-5 ${paymentMethod === "card" ? "text-indigo-300" : "text-slate-400"}`} />
                      <div>
                        <strong className="block text-xs font-bold text-white">Cards & Banking</strong>
                        <span className="text-[10px] text-slate-400 leading-tight">Credit, Debit, Netbanking</span>
                      </div>
                    </button>

                    {/* Cash on Delivery Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        paymentMethod === "cod"
                          ? "bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10"
                          : "bg-[#131b2c] border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      <svg className="w-5 h-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                      <div>
                        <strong className="block text-xs font-bold text-white">Cash on Delivery</strong>
                        <span className="text-[10px] text-slate-400 leading-tight">Pay upon courier arrival</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Payment Configuration Box */}
                <div className="bg-[#12192a] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
                  {paymentMethod === "upi" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">UPI Sandbox Execution</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                          Simulated Razorpay VPA
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label
                          onClick={() => setUpiMode("qr")}
                          className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                            upiMode === "qr"
                              ? "bg-cyan-500/20 border-cyan-400 text-white"
                              : "bg-[#141d2f] border-white/5 text-slate-400"
                          }`}
                        >
                          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                          </svg>
                          <div>
                            <strong className="block text-xs">Dynamic QR Code</strong>
                            <span className="text-[10px] text-slate-400">Scan & Pay via phone</span>
                          </div>
                        </label>

                        <label
                          onClick={() => setUpiMode("id")}
                          className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                            upiMode === "id"
                              ? "bg-cyan-500/20 border-cyan-400 text-white"
                              : "bg-[#141d2f] border-white/5 text-slate-400"
                          }`}
                        >
                          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                            <line x1="12" y1="18" x2="12.01" y2="18" />
                          </svg>
                          <div>
                            <strong className="block text-xs">Direct UPI ID</strong>
                            <span className="text-[10px] text-slate-400">GPay, PhonePe VPA</span>
                          </div>
                        </label>
                      </div>

                      {upiMode === "id" && (
                        <div className="pt-2 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300">Enter your UPI VPA</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okhdfcbank"
                            className="w-full bg-[#151f33] border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-300" />
                          <span className="text-xs font-bold text-white">Card & Netbanking Sandbox</span>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">
                          Visa / Mastercard 3DS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4242 •••• •••• 4242"
                            className="w-full bg-[#151f33] border border-white/15 rounded-xl py-2 px-3 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Name on card"
                            className="w-full bg-[#151f33] border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-[#151f33] border border-white/15 rounded-xl py-2 px-3 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full bg-[#151f33] border border-white/15 rounded-xl py-2 px-3 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                        <span>Or Pay via Netbanking:</span>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="bg-[#151f33] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        >
                          <option value="JPMorgan Chase">JPMorgan Chase</option>
                          <option value="Bank of America">Bank of America</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="State Bank of India">State Bank of India</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Cash on Delivery (Zero Prepayment Required)</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Pay with physical cash or digital scan-on-delivery upon courier arrival. No extra convenience charge.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Promo Code Coupon Box */}
                <div className="bg-[#12192a] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Try coupon SAVE10 or ORGANIC20"
                        className="w-full bg-[#151f33] border border-white/15 rounded-xl py-2 pl-9 pr-3 text-xs uppercase font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      type="button"
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className="text-[11px] text-cyan-300 flex items-center gap-1.5 pl-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{promoMessage}</span>
                    </p>
                  )}
                </div>

                {/* 4. Verified Price Breakdown */}
                <div className="bg-[#12192a] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block pb-2 border-b border-white/10">
                    Items to Order ({cart.reduce((s, i) => s + i.quantity, 0)})
                  </span>
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between items-center text-xs sm:text-sm">
                      <div>
                        <span className="font-bold text-white block">{product.name}</span>
                        <span className="text-slate-400 text-xs">Qty: {quantity} (ID: #{product.id})</span>
                      </div>
                      <span className="font-bold text-emerald-400">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${currentSubtotal.toFixed(2)}</span>
                    </div>
                    {currentDiscount > 0 && (
                      <div className="flex justify-between text-cyan-300 font-semibold">
                        <span>Promo Discount ({appliedPromo})</span>
                        <span>-${currentDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>Delivery Surcharge</span>
                      <span className="text-emerald-400 font-bold">FREE ($0.00)</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/15 flex justify-between font-black text-lg text-white">
                    <span>Final Payable Total</span>
                    <span className="text-emerald-400">${finalPayableTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Confirm & Pay Button */}
                <button
                  onClick={handleInitiatePayment}
                  disabled={isPlacingOrder}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:opacity-95 text-white font-black text-base transition-all cursor-pointer active:scale-98 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isPlacingOrder
                      ? "Verifying with SQLite Database…"
                      : paymentMethod === "cod"
                      ? `Confirm Cash on Delivery ($${finalPayableTotal.toFixed(2)})`
                      : paymentMethod === "upi"
                      ? `Pay via UPI ($${finalPayableTotal.toFixed(2)})`
                      : `Pay via Card ($${finalPayableTotal.toFixed(2)})`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: ORDER CONFIRMED */}
          {isConfirmedOpen && (
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 text-center flex flex-col justify-center items-center">
              <div className="max-w-md mx-auto space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm ring-4 ring-emerald-500/20">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    Payment Verified • Order Placed
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Order #{confirmedOrder?.id || "1042"} Confirmed
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                    Your order has been cryptographically verified and recorded directly into SQLite & MongoDB.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#12192a] border border-white/10 text-xs sm:text-sm text-white space-y-3 shadow-md">
                  <div className="flex justify-between pb-2 border-b border-white/10">
                    <span className="text-slate-400">SQLite Order ID:</span>
                    <span className="font-mono font-bold text-cyan-300">#{confirmedOrder?.id || 1042}</span>
                  </div>

                  {paymentReceipt && (
                    <div className="flex justify-between pb-2 border-b border-white/10">
                      <span className="text-slate-400">Payment ID:</span>
                      <span className="font-mono text-[11px] text-emerald-400">{paymentReceipt.paymentId}</span>
                    </div>
                  )}

                  {paymentReceipt?.paymentDetails?.deliveryAddress && (
                    <div className="text-left pb-2 border-b border-white/10 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                        Delivery Destination
                      </span>
                      <span className="font-semibold text-white block">
                        {paymentReceipt.paymentDetails.deliveryAddress.name} ({paymentReceipt.paymentDetails.deliveryAddress.type})
                      </span>
                      <span className="text-[11px] text-slate-300 block">
                        {paymentReceipt.paymentDetails.deliveryAddress.street_address}, {paymentReceipt.paymentDetails.deliveryAddress.city} - {paymentReceipt.paymentDetails.deliveryAddress.pincode}
                      </span>
                    </div>
                  )}

                  {paymentReceipt?.paymentDetails?.deliverySlot && (
                    <div className="flex justify-between items-center pb-2 border-b border-white/10 text-xs">
                      <span className="text-slate-400">Delivery Slot:</span>
                      <span className="font-bold text-cyan-300">
                        {paymentReceipt.paymentDetails.deliverySlot.title}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between pb-2 border-b border-white/10">
                    <span className="text-slate-400">Payment Mode:</span>
                    <span className="font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded bg-white/10">
                      {paymentReceipt?.method || paymentMethod}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-left pt-1">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                      Purchased Items
                    </span>
                    {confirmedOrder?.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-white font-medium">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="text-slate-300">${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-black text-emerald-400 text-base border-t border-white/10">
                      <span>Total Paid</span>
                      <span>${confirmedOrder?.total?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between text-[11px] text-slate-400">
                    <span>Database Timestamp:</span>
                    <span className="font-mono">{confirmedOrder?.created_at || new Date().toISOString()}</span>
                  </div>
                </div>

                {/* Email Dispatch Notice */}
                {emailNotice && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs flex items-center gap-2.5 text-left shadow-sm">
                    <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="leading-relaxed">{emailNotice}</span>
                  </div>
                )}

                {/* Action Buttons: Printable Invoice & Continue */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-98"
                  >
                    <PrinterIcon className="w-4 h-4" />
                    <span>View &amp; Print Tax Invoice (PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmedOpen(false)}
                    className="py-3.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
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
