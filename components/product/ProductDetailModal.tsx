"use client";

import React, { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ShoppingCart,
  Tag,
  CreditCard,
  CheckCircle2,
  Share2,
  Heart,
  Bot,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAskAI?: (prompt: string) => void;
}

export function ProductDetailModal({ product, onClose, onAskAI }: ProductDetailModalProps) {
  const { addToCart, updateQuantity, cart, setIsCartOpen } = useCart();
  const [selectedTab, setSelectedTab] = useState<"highlights" | "specs" | "offers">("highlights");
  const [copied, setCopied] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  const originalPrice = (product.price * 1.25).toFixed(0);
  const discountPercent = 20;
  const cartItem = cart.find((i) => i.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (quantityInCart === 0) {
      addToCart(product, 1);
    }
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-950 text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-400 border border-amber-500/40">
              Cartwise
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-xs">
              PLUS ASSURED
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Item #{product.id} • Category: <strong className="capitalize text-slate-200">{product.category}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Image & Buy Action */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="relative w-full aspect-square bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center p-4 overflow-hidden group">
              <img
                src={product.image_url || "/images/honey.png"}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/honey.png";
                }}
              />
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? "text-rose-500 fill-rose-500" : "text-slate-400"
                  }`}
                />
              </button>

              <div className="absolute bottom-3 left-3 bg-slate-900/90 text-amber-400 border border-amber-400/30 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                <Truck className="w-3 h-3 text-amber-400" />
                <span>Express 15-Min Delivery</span>
              </div>
            </div>

            {/* Quick Actions (Cart + Buy Now) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {quantityInCart > 0 ? (
                <div className="flex items-center justify-between bg-slate-950 border border-amber-500/40 rounded-xl p-1.5">
                  <button
                    onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-bold flex items-center justify-center shadow-xs hover:bg-slate-800 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-amber-400">
                    {quantityInCart} in Cart
                  </span>
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-xs hover:bg-amber-400 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product, 1)}
                  className="w-full py-3 px-3 rounded-xl text-xs font-bold text-amber-400 bg-slate-950 hover:bg-slate-900 border border-amber-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <span>ADD TO CART</span>
                </button>
              )}

              <button
                onClick={handleBuyNow}
                className="w-full py-3 px-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>BUY NOW</span>
              </button>
            </div>

            {/* Ask AI Copilot Button */}
            {onAskAI && (
              <button
                onClick={() => {
                  onClose();
                  onAskAI(`Tell me all about ${product.name}, its specifications, and best offers.`);
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-amber-600" />
                <span>Ask Cartwise AI about this product</span>
              </button>
            )}
          </div>

          {/* Right Column: Title, Ratings, Pricing, Offers & Specs */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-semibold text-amber-700 capitalize">{product.category}</span>
                {product.sub_category && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{product.sub_category.replace("-", " ")}</span>
                  </>
                )}
                <span>•</span>
                <span className="text-emerald-700 font-semibold">In Stock ({product.stock} units)</span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h1>

              {/* Rating & Reviews pill */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  <span>{product.average_rating || 4.8}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {product.review_count?.toLocaleString("en-IN") || "450"} Ratings &amp; Verified Reviews
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-900 border border-amber-200">
                  Cartwise Assured
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-950">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  ₹{Number(originalPrice).toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>Inclusive of all GST taxes</span>
                <span>•</span>
                <span className="text-slate-700 font-medium">
                  No Cost EMI starts at ₹{Math.round(product.price / 6).toLocaleString("en-IN")}/month
                </span>
              </div>
            </div>

            {/* Available Offers Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Available Bank &amp; Partner Offers</span>
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200 p-2 rounded-lg">
                  <Tag className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-amber-900">Special Coupon SAVE10:</strong> Get extra 15% instant discount at checkout.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <CreditCard className="w-3.5 h-3.5 text-slate-900 mt-0.5 shrink-0" />
                  <div>
                    <strong>Bank Offer:</strong> 10% Instant Discount up to ₹1,500 on SBI, HDFC &amp; Axis Bank Credit Cards.
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights & Details Tabs */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex border-b border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setSelectedTab("highlights")}
                  className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors ${
                    selectedTab === "highlights"
                      ? "border-amber-500 text-slate-950"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Product Highlights
                </button>
                <button
                  onClick={() => setSelectedTab("specs")}
                  className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors ${
                    selectedTab === "specs"
                      ? "border-amber-500 text-slate-950"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Specifications
                </button>
              </div>

              {selectedTab === "highlights" ? (
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="leading-relaxed bg-amber-50/40 p-3 rounded-xl border border-amber-200/50 text-slate-800">
                    {product.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-medium">1 Year Official Brand Warranty</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <RotateCcw className="w-4 h-4 text-slate-800 shrink-0" />
                      <span className="text-[11px] font-medium">7 Days Hassle-Free Replacement</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-700">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-400 font-medium w-1/3">In The Box</td>
                        <td className="py-2 font-medium text-slate-800">Handset, Power Adapter, USB Cable, User Guide</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-400 font-medium">Category</td>
                        <td className="py-2 font-semibold text-slate-800 capitalize">{product.category}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-400 font-medium">Sub-Category</td>
                        <td className="py-2 font-medium text-slate-800 capitalize">{product.sub_category || "General"}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-400 font-medium">Inventory Stock</td>
                        <td className="py-2 font-medium text-emerald-700">{product.stock} units available in hub</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-400 font-medium">Certified Organic</td>
                        <td className="py-2 font-medium text-slate-800">{product.is_organic ? "Yes (100% Certified)" : "Standard Retail"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Delivery & Assurance Trust Bar */}
            <div className="p-3 bg-slate-950 text-white rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-amber-400">Cartwise Assured Quality:</strong> 6-step quality tested and securely dispatched.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
