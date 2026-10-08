"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  ArrowLeft,
  Package,
  PlusCircle,
  Save,
  CheckCircle2,
  AlertCircle,
  Image,
  DollarSign,
  Truck,
  Sparkles,
  Layers,
  Trash2,
} from "lucide-react";
import { ProductVariant } from "@/lib/types";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "food-health",
    sub_category: "grocery-staples",
    description: "",
    price: 499,
    original_price: 599,
    stock: 35,
    sku: "",
    is_organic: true,
    image_url: "",
    weight: 500,
    seo_title: "",
    meta_description: "",
    tags: "organic, pure, healthy",
  });

  // Product variants
  const [variants, setVariants] = useState<Array<{ name: string; sku: string; price: number; stock: number }>>([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState(499);
  const [variantStock, setVariantStock] = useState(20);

  const handleAddVariant = () => {
    if (!variantName.trim()) return;
    setVariants([
      ...variants,
      {
        name: variantName.trim(),
        sku: `VAR-${Date.now().toString().slice(-4)}`,
        price: variantPrice,
        stock: variantStock,
      },
    ]);
    setVariantName("");
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          original_price: Number(formData.original_price),
          stock: Number(formData.stock),
          weight: Number(formData.weight),
          tags: formData.tags.split(",").map((t) => t.trim()),
          variants: variants.map((v, i) => ({
            id: i + 1,
            product_id: 0,
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            status: "ACTIVE",
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product listing.");
      }

      router.push("/seller/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/seller/products"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Create New Product Listing
              </h1>
              <p className="text-xs text-slate-500">
                New products are submitted to Marketplace Admins for verification and live publishing.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Package className="w-4 h-4 text-emerald-600" />
              1. Basic Product Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified Pure Wildflower Honey (500g Jar)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nature Harvest"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marketplace Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="food-health">Food & Health / Groceries</option>
                  <option value="mobiles">Mobiles & Tablets</option>
                  <option value="electronics">Electronics & Audio</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="appliances">Home & Appliances</option>
                  <option value="beauty">Beauty & Personal Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subcategory</label>
                <input
                  type="text"
                  placeholder="e.g. grocery-staples"
                  value={formData.sub_category}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="organic_check"
                  checked={formData.is_organic}
                  onChange={(e) => setFormData({ ...formData, is_organic: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="organic_check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Certified Organic Product (Awards Organic badge in marketplace)
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide comprehensive details on origin, ingredients, certification, and storage..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing, Stock & SKUs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              2. Pricing, Inventory & Logistics
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Original / MRP (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock (Units) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom SKU Identifier</label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Weight (Grams)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Main Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Product Variants (Optional) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Layers className="w-4 h-4 text-emerald-600" />
                3. Product Variants (Size / Color / Pack)
              </div>
              <span className="text-xs text-slate-400">Optional</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Variant Name</label>
                <input
                  type="text"
                  placeholder="e.g. 1kg Family Pack or Black / Size L"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="w-32">
                <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={variantPrice}
                  onChange={(e) => setVariantPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="w-28">
                <label className="block text-xs font-bold text-slate-700 mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={variantStock}
                  onChange={(e) => setVariantStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="py-2 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Add Variant
              </button>
            </div>

            {variants.length > 0 && (
              <div className="mt-4 divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {variants.map((v, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900">{v.name}</span>
                      <span className="text-slate-400 font-mono ml-2">({v.sku})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900">₹{v.price}</span>
                      <span className="text-slate-600">{v.stock} in stock</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/seller/products"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit for Approval
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}
