"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  Store,
  ExternalLink,
  Edit2,
  Save,
  CheckCircle2,
  Image,
  Star,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { Seller } from "@/lib/types";

export default function MyStorePage() {
  const [store, setStore] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const [formData, setFormData] = useState({
    store_name: "",
    store_slug: "",
    description: "",
    logo_url: "",
    banner_url: "",
    business_address: "",
    phone: "",
    shippingPolicy: "",
    returnPolicy: "",
    refundPolicy: "",
  });

  const fetchStore = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/store");
      if (res.ok) {
        const json = await res.json();
        setStore(json.store);
        setFormData({
          store_name: json.store.store_name || "",
          store_slug: json.store.store_slug || json.store.store_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: json.store.description || "",
          logo_url: json.store.logo_url || "",
          banner_url: json.store.banner_url || "",
          business_address: json.store.business_address || "",
          phone: json.store.phone || "",
          shippingPolicy: json.store.policies?.shipping || "Standard 2-3 business days delivery with tracking.",
          returnPolicy: json.store.policies?.return || "Hassle-free 7-day returns for eligible unopened items.",
          refundPolicy: json.store.policies?.refund || "Automated refund processed within 48h of return receipt.",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/seller/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: formData.store_name,
          store_slug: formData.store_slug,
          description: formData.description,
          logo_url: formData.logo_url,
          banner_url: formData.banner_url,
          business_address: formData.business_address,
          phone: formData.phone,
          policies: {
            shipping: formData.shippingPolicy,
            return: formData.returnPolicy,
            refund: formData.refundPolicy,
          },
        }),
      });

      if (res.ok) {
        setSavedMsg(true);
        setEditing(false);
        await fetchStore();
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (e) {
      console.error("Save error", e);
    }
  };

  const currentSlug = formData.store_slug || "my-store";

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Store className="w-6 h-6 text-emerald-600" />
              My Storefront Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Customize your public merchant identity, branding banners, and store fulfillment policies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/store/${currentSlug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
            >
              <span>View Customer Storefront</span>
              <ExternalLink className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setEditing(!editing)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Edit2 className="w-4 h-4" />
              {editing ? "Cancel Editing" : "Edit Store Profile"}
            </button>
          </div>
        </div>

        {savedMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Storefront profile and policies updated successfully!
          </div>
        )}

        {/* Live Storefront Mockup Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Banner */}
          <div className="relative h-48 sm:h-64 bg-linear-to-r from-emerald-800 to-teal-900 w-full overflow-hidden">
            {formData.banner_url ? (
              <img
                src={formData.banner_url}
                alt="Store Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-100/60 text-sm font-semibold">
                Upload a high-resolution store banner (1200x400 recommended)
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Profile Header */}
          <div className="p-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg ring-4 ring-white shrink-0 overflow-hidden">
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt="Store Logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 text-emerald-400 font-black text-2xl flex items-center justify-center rounded-xl">
                      {formData.store_name ? formData.store_name.slice(0, 2).toUpperCase() : "ST"}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      {formData.store_name || "Store Name"}
                    </h2>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" title="Verified Merchant" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {store?.rating || 5.0} Merchant Rating
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-700 font-semibold">/store/{currentSlug}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Merchant: <strong className="text-slate-800">{store?.owner_name}</strong>
              </div>
            </div>

            {/* Description & Bio */}
            <div className="max-w-3xl text-sm text-slate-600 leading-relaxed mb-6">
              {formData.description ||
                "Welcome to our verified marketplace store. We curate organic, authentic harvest directly dispatched to your doorstep."}
            </div>

            {/* Store Policies Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Shipping Policy
                </div>
                <p className="text-xs text-slate-600">{formData.shippingPolicy}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Return Policy
                </div>
                <p className="text-xs text-slate-600">{formData.returnPolicy}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Refund Policy
                </div>
                <p className="text-xs text-slate-600">{formData.refundPolicy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Store Profile Form */}
        {editing && (
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Edit Store Profile & Policies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Store / Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Public Store Slug</label>
                <input
                  type="text"
                  required
                  value={formData.store_slug}
                  onChange={(e) => setFormData({ ...formData, store_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") })}
                  placeholder="e.g. nature-harvest"
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Store Logo Image URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Store Banner Image URL</label>
                <input
                  type="url"
                  value={formData.banner_url}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Store Bio / Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Shipping Policy Text</label>
                <textarea
                  rows={3}
                  value={formData.shippingPolicy}
                  onChange={(e) => setFormData({ ...formData, shippingPolicy: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Return Policy Text</label>
                <textarea
                  rows={3}
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Refund Policy Text</label>
                <textarea
                  rows={3}
                  value={formData.refundPolicy}
                  onChange={(e) => setFormData({ ...formData, refundPolicy: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </SellerLayout>
  );
}
