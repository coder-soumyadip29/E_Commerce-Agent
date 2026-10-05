"use client";

import React, { useState } from "react";
import { Product, AgentTrace, OrderTrackingInfo, PromoArbitrageInfo } from "@/lib/types";
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
        .map((p) => `${p.name} for $${p.price}`)
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
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-4 h-4 text-cyan-300" />
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        {/* Intro text if present */}
        {text && (
          <div className="bg-[#131929] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 text-slate-200 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <p>{text}</p>
              <button
                type="button"
                onClick={handleToggleSpeak}
                className="text-slate-400 hover:text-cyan-300 transition-colors p-1"
                title="Listen to audio"
              >
                {isPlayingAudio ? (
                  <Square className="w-3.5 h-3.5 text-red-400 fill-current animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* 1. Verified Match Header */}
        {products.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CartWise Agent Verified Match</span>
            </div>

            {/* Product Card Styled Exactly Like Aura */}
            {products.map((product) => {
              const originalPrice = (product.price * 1.25).toFixed(2);
              return (
                <div
                  key={product.id}
                  className="bg-[#121827] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3 hover:border-cyan-500/30 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-[#090d16] border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      <img
                        src={product.image_url || "/images/honey.png"}
                        alt={product.name}
                        className="max-h-full max-w-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/honey.png";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-1">
                        98% SPEC MATCH
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-white break-words">
                        {product.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-extrabold text-sm sm:text-base text-emerald-400">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-500 line-through">
                          ${originalPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Add to Cart (purple) & Compare */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleAdd(product)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      {addedIds[product.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCompare(product)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#192236] hover:bg-[#202b44] border border-white/10 active:scale-95 transition-all cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <span>Compare</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Order Tracking Card (Screenshot match) */}
        {orderTracking && (
          <div className="bg-[#121827] border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs sm:text-sm text-white">
                  Track {orderTracking.orderId}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {orderTracking.status}
              </span>
            </div>

            <div className="text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{orderTracking.productName}</span> • Carrier:{" "}
              {orderTracking.carrier}
            </div>

            <div className="text-xs font-bold text-emerald-400">
              Arriving {orderTracking.estimatedArrival}
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="relative w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                  style={{ width: "90%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-emerald-400 font-medium">Packed</span>
                <span className="text-emerald-400 font-medium">Transit</span>
                <span className="text-emerald-300 font-bold">Out for Delivery</span>
              </div>
            </div>

            {/* Open Live Satellite GPS Feed button */}
            <button
              onClick={() => onOpenGpsFeed?.(orderTracking)}
              className="w-full py-2 px-3 rounded-xl bg-[#172033] hover:bg-[#1d2940] border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Open Live Satellite GPS Feed</span>
            </button>
          </div>
        )}

        {/* 3. Price Arbitrage Block & Instant Pay (Screenshot match) */}
        {promoArbitrage && products[0] && (
          <div className="bg-[#121827] border border-white/10 rounded-2xl p-3.5 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Price Arbitrage Applied</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Best net rate</span>
            </div>

            <div className="text-xs text-slate-300">
              Voucher <strong className="text-white font-mono">{promoArbitrage.code}</strong> (-${promoArbitrage.savings.toFixed(2)}) auto-negotiated.
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
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:opacity-95 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Instant Pay ${promoArbitrage.finalTotal.toFixed(2)} with Agent</span>
            </button>
          </div>
        )}

        {/* Agent Trace Accordion */}
        {trace && (
          <div className="pt-1">
            <button
              onClick={() => setShowTraceInline(!showTraceInline)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Agent Reasoning Trace ({trace.steps.length} steps)</span>
              {showTraceInline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showTraceInline && (
              <div className="mt-2 p-3 rounded-xl bg-[#0d121f] border border-white/5 text-[11px] space-y-1.5 text-slate-300">
                <div className="text-cyan-400 font-mono text-[10px]">INTENT: {trace.parsed_intent}</div>
                {trace.sql_query && (
                  <div className="font-mono text-[10px] text-slate-400 bg-black/40 p-1.5 rounded">
                    {trace.sql_query}
                  </div>
                )}
                {onOpenTrace && (
                  <button
                    onClick={() => onOpenTrace(trace)}
                    className="text-xs text-indigo-400 underline font-semibold block pt-1 cursor-pointer"
                  >
                    Open Full Agent Trace Modal
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
