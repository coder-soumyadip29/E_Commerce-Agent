"use client";

import React, { useState } from "react";
import { Product, AgentTrace, OrderTrackingInfo, PromoArbitrageInfo } from "@/lib/types";
import { getFallbackImageUrl } from "@/lib/storeData";
import { useCart } from "@/context/CartContext";
import {
  Sparkles,
  Bot,
  ShoppingCart,
  Scale,
  Check,
  Package,
  Radio,
  Zap,
  ChevronDown,
  ChevronUp,
  Volume2,
  Square,
  ShieldCheck,
  Truck,
  Star,
  Eye,
} from "lucide-react";
import { useVoice } from "@/context/VoiceContext";

interface ProductsMessageProps {
  products: Product[];
  text?: string;
  trace?: AgentTrace;
  orderTracking?: OrderTrackingInfo;
  promoArbitrage?: PromoArbitrageInfo;
  onOpenTrace?: (trace: AgentTrace) => void;
  onOpenGpsFeed?: (tracking: OrderTrackingInfo) => void;
  onInstantPay?: (amount: number, product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export function ProductsMessage({
  products,
  text,
  trace,
  orderTracking,
  promoArbitrage,
  onOpenTrace,
  onOpenGpsFeed,
  onInstantPay,
  onSelectProduct,
}: ProductsMessageProps) {
  const { addToCart, buyDirectly, setIsCartOpen } = useCart();
  const { speak, stopSpeaking } = useVoice();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});
  const [showTraceInline, setShowTraceInline] = useState(false);

  const handleToggleSpeak = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const speechSummary = `${text || "Verified matches found."} ${products
        .slice(0, 2)
        .map((p) => `${p.name} for ₹${p.price}`)
        .join(". ")}`;
      speak(speechSummary);
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 8000);
    }
  };

  const handleAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleCompare = (product: Product) => {
    alert(`Comparison ready for ${product.name}. Compare attributes vs alternative pantry items.`);
  };

  return (
    <div className="flex items-start gap-2.5 w-full animate-fade-in">
      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Bot className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        {/* Intro text if present */}
        {text && (
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 text-slate-800 text-xs sm:text-sm shadow-xs">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-800">{text}</p>
              <button
                type="button"
                onClick={handleToggleSpeak}
                className="text-slate-400 hover:text-emerald-700 transition-colors p-1"
                title="Listen to audio"
              >
                {isPlayingAudio ? (
                  <Square className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* 1. Verified Product Match Cards */}
        {products.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available in Store</span>
            </div>

            {products.map((product) => {
              const originalPrice = (product.price * 1.25).toFixed(2);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct?.(product)}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3 hover:border-amber-400/80 transition-all shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
                      <img
                        src={product.image_url || getFallbackImageUrl(product.category)}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFallbackImageUrl(product.category);
                        }}
                      />
                      <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[8px] font-black uppercase bg-slate-900 text-amber-400 border border-amber-500/30">
                        ⚡ 15 MINS
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                          {product.category || "Item"}
                        </span>
                        <div className="flex items-center gap-0.5 text-[11px] text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.average_rating || 4.9}</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 break-words leading-tight group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h4>

                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="font-black text-sm sm:text-base text-slate-950">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{Number(originalPrice).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 border border-amber-200 px-1 rounded">
                          20% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Add to Cart, View Details & Compare */}
                  <div
                    className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleAdd(product)}
                      className="col-span-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-amber-400 bg-slate-950 hover:bg-slate-900 border border-amber-500/40 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      {addedIds[product.id] ? (
                        <>
                          <Check className="w-3 h-3 text-amber-400" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3 text-amber-400" />
                          <span>Add</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onSelectProduct?.(product)}
                      className="col-span-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 active:scale-95 transition-all cursor-pointer shadow-xs"
                      title="View full specs, details & images"
                    >
                      <Eye className="w-3 h-3 text-amber-600" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => handleCompare(product)}
                      className="col-span-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-95 transition-all cursor-pointer"
                    >
                      <Scale className="w-3 h-3 text-slate-500" />
                      <span>Compare</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Order Tracking Card */}
        {orderTracking && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Track Package {orderTracking.orderId}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                {orderTracking.status}
              </span>
            </div>

            <div className="text-xs text-slate-600">
              <span className="text-slate-900 font-semibold">{orderTracking.productName}</span> • Carrier:{" "}
              {orderTracking.carrier}
            </div>

            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arriving {orderTracking.estimatedArrival}</span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: "85%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span className="text-emerald-700 font-bold">Packed</span>
                <span className="text-emerald-700 font-bold">In Transit</span>
                <span className="text-emerald-800 font-extrabold">Out for Delivery</span>
              </div>
            </div>

            {/* Live GPS feed button */}
            <button
              onClick={() => onOpenGpsFeed?.(orderTracking)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>View Live Courier GPS Location</span>
            </button>
          </div>
        )}

        {/* 3. Promo Arbitrage & Instant Pay */}
        {promoArbitrage && products[0] && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Coupon Arbitrage Applied</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Best Price Guaranteed</span>
            </div>

            <div className="text-xs text-slate-700">
              Voucher <strong className="text-emerald-900 font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{promoArbitrage.code}</strong> (-₹{promoArbitrage.savings.toFixed(2)}) automatically applied.
            </div>

            <button
              onClick={() => {
                if (onInstantPay) {
                  onInstantPay(promoArbitrage.finalTotal, products[0]);
                } else {
                  addToCart(products[0], 1);
                  setIsCartOpen(true);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Instant Buy ₹{promoArbitrage.finalTotal.toFixed(2)}</span>
            </button>
          </div>
        )}

        {/* Reasoning Trace Accordion */}
        {trace && (
          <div className="pt-1">
            <button
              onClick={() => setShowTraceInline(!showTraceInline)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Search Reasoning Trail ({trace.steps.length} steps)</span>
              {showTraceInline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showTraceInline && (
              <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 text-slate-700">
                <div className="text-emerald-800 font-mono text-[10px] font-bold">INTENT: {trace.parsed_intent}</div>
                {trace.sql_query && (
                  <div className="font-mono text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                    {trace.sql_query}
                  </div>
                )}
                {onOpenTrace && (
                  <button
                    onClick={() => onOpenTrace(trace)}
                    className="text-xs text-emerald-700 underline font-semibold block pt-1 cursor-pointer"
                  >
                    Open Full Inspection Modal
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
