"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Store,
  ShieldCheck,
  Star,
  MapPin,
  FileText,
  ShoppingBag,
  ArrowLeft,
  Check,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function PublicStorefrontPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "policies" | "reviews">("products");
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchStore() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/store/${slug}`);
        if (res.ok) {
          const json = await res.json();
          setStore(json.store);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [slug]);

  const handleAddToCart = async (productId: number) => {
    setAddingId(productId);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setAddedIds((prev) => new Set(prev).add(productId));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 2000);
    } catch (e) {
      console.error("Cart error", e);
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading marketplace store...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <Store className="w-16 h-16 text-slate-600 mb-4" />
        <h1 className="text-2xl font-black mb-2">Store Not Found</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          The merchant storefront you are looking for does not exist or has been archived.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const products = store.products || [];
  const reviews = store.reviews || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white pb-20">
      {/* Top Marketplace Bar */}
      <nav className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>CartWise Marketplace</span>
        </Link>

        <div className="text-xs font-semibold text-slate-400">
          Verified Merchant Showcase
        </div>
      </nav>

      {/* Banner */}
      <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950">
        {store.banner_url ? (
          <img src={store.banner_url} alt={store.store_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-emerald-900 to-teal-900" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Store Header Bio */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 ring-4 ring-slate-800 shadow-xl overflow-hidden shrink-0">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.store_name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full bg-slate-950 text-emerald-400 font-black text-2xl flex items-center justify-center rounded-xl">
                    {store.store_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    {store.store_name}
                  </h1>
                  {store.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Store
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {store.rating || 5.0} Rating ({reviews.length} reviews)
                  </span>
                  <span>•</span>
                  <span>{products.length} Products Active</span>
                  {store.business_address && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {store.business_address}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400">Direct Merchant Dispatch</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                Authenticity Guaranteed
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {store.description}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "products"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Store Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "policies"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            About & Store Policies
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "reviews"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-8">
          {activeTab === "products" && (
            products.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center text-slate-500 text-sm border border-slate-800">
                No active products currently listed by this merchant.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((p: any) => {
                  const isAdded = addedIds.has(p.id);
                  const isAdding = addingId === p.id;

                  return (
                    <div
                      key={p.id}
                      className="bg-slate-900 rounded-3xl border border-slate-800 hover:border-emerald-500/50 p-4 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-emerald-950/20"
                    >
                      <div>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 mb-3.5">
                          <img
                            src={p.image_url || p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {p.is_organic && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                              Organic
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                          {p.category}
                        </div>
                        <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-2">
                          {p.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {p.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-base font-black text-white">₹{p.price}</div>
                          {p.original_price && p.original_price > p.price && (
                            <div className="text-[11px] text-slate-500 line-through">₹{p.original_price}</div>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddToCart(p.id)}
                          disabled={isAdding || p.stock === 0}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isAdded
                              ? "bg-emerald-500 text-slate-950 font-black"
                              : p.stock === 0
                              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added
                            </>
                          ) : isAdding ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : p.stock === 0 ? (
                            "Sold Out"
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeTab === "policies" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  <FileText className="w-4 h-4" /> Shipping & Delivery
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {store.policies?.shipping || "Standard express fulfillment with real-time tracking checkpoints."}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  <FileText className="w-4 h-4" /> Return Terms
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {store.policies?.return || "7-day return guarantee on unopened and sealed packages."}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  <FileText className="w-4 h-4" /> Refund Settlement
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {store.policies?.refund || "Full refund automatically issued to payment method upon warehouse inspection."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="text-sm font-bold text-white">Merchant Product Reviews</div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {store.rating || 5.0} Average Rating
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No customer reviews yet.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{r.reviewer_name}</span>
                          <span className="flex items-center text-amber-400 text-[11px] font-bold">
                            ★ {r.rating}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">Verified Buyer</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{r.review_text}</p>
                      {r.seller_reply && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-emerald-900/40 text-xs text-emerald-300">
                          <strong className="text-emerald-400 block mb-0.5">Store Response:</strong>
                          {r.seller_reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
