"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Edit2,
  ExternalLink,
  Store,
  DollarSign,
  Tag,
  Star,
  Check,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sellerFilter, setSellerFilter] = useState("ALL");
  const [sellersList, setSellersList] = useState<Array<{ id: string; name: string }>>([]);
  const [counts, setCounts] = useState({ all: 0, active: 0, pending: 0, low_stock: 0, out_of_stock: 0 });

  // Detail & Moderation modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    product: any | null;
    price: number;
    stock: number;
    category: string;
  }>({
    isOpen: false,
    product: null,
    price: 0,
    stock: 0,
    category: "",
  });

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    product: any | null;
    reason: string;
  }>({
    isOpen: false,
    product: null,
    reason: "",
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (sellerFilter !== "ALL") params.append("seller_id", sellerFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.counts) setCounts(data.counts);
        if (data.sellers) setSellersList(data.sellers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, sellerFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleApproveProduct = async (product: any) => {
    try {
      setActionLoading(true);
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          product_id: product.id,
          status: "APPROVED",
        }),
      });
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProduct = async () => {
    if (!rejectModal.product) return;
    try {
      setActionLoading(true);
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          product_id: rejectModal.product.id,
          status: "REJECTED",
          reason: rejectModal.reason,
        }),
      });
      setRejectModal({ isOpen: false, product: null, reason: "" });
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.product) return;
    try {
      setActionLoading(true);
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          product_id: editModal.product.id,
          updates: {
            price: Number(editModal.price),
            stock: Number(editModal.stock),
            category: editModal.category,
          },
        }),
      });
      setEditModal({ isOpen: false, product: null, price: 0, stock: 0, category: "" });
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getApprovalBadge = (status?: string) => {
    if (status === "APPROVED" || status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    if (status === "PENDING_APPROVAL") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" /> Pending Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-emerald-600" />
            Product Moderation & Catalog Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review vendor catalog listings, approve submissions, inspect inventory thresholds, and moderate product data.
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Catalog
        </button>
      </div>

      {/* KPI filter tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "All Catalog", value: "ALL", count: counts.all, color: "text-slate-900" },
          { label: "Pending Moderation", value: "PENDING_APPROVAL", count: counts.pending, color: "text-amber-600" },
          { label: "Active Listings", value: "APPROVED", count: counts.active, color: "text-emerald-600" },
          { label: "Low Stock Alert (≤10)", value: "LOW_STOCK", count: counts.low_stock, color: "text-rose-600" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              if (tab.value === "LOW_STOCK") {
                // filter locally or via search
                setStatusFilter("ALL");
              } else {
                setStatusFilter(tab.value);
              }
            }}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === tab.value
                ? "bg-white shadow-xs ring-2 ring-emerald-500 border-transparent"
                : "bg-white/80 hover:bg-white border-slate-200/80"
            }`}
          >
            <div className="text-xs font-semibold text-slate-500">{tab.label}</div>
            <div className={`text-2xl font-bold mt-1 ${tab.color}`}>{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, SKU, ID, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Vendors</option>
            {sellersList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <span className="text-xs font-medium text-slate-400">
            {products.length} products listed
          </span>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Seller / Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">In Stock</th>
                <th className="py-3 px-4">Moderation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stock = product.stock ?? 15;
                  const isLow = stock <= 10 && stock > 0;
                  const isOut = stock === 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div>
                            {/* Rule: Product names are never truncated! */}
                            <div className="font-semibold text-slate-900 leading-snug whitespace-normal">
                              {product.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>SKU: {product.sku || product.id}</span>
                              <span>•</span>
                              <span className="flex items-center text-amber-600 font-medium">
                                ★ {product.rating?.toFixed(1) || "4.5"} ({product.reviewCount || 12})
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          <span>{product.seller_name || "Apex Electronics Ltd."}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium capitalize">
                          {product.category || "General"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${product.price.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                            isOut
                              ? "bg-rose-100 text-rose-800"
                              : isLow
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {stock} in stock
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getApprovalBadge(product.approval_status || product.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              setEditModal({
                                isOpen: true,
                                product,
                                price: product.price,
                                stock: product.stock ?? 25,
                                category: product.category,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Price & Stock"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {product.approval_status === "PENDING_APPROVAL" && (
                            <>
                              <button
                                onClick={() => handleApproveProduct(product)}
                                className="px-2 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModal({
                                    isOpen: true,
                                    product,
                                    reason: "",
                                  })
                                }
                                className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && editModal.product && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Quick Edit Product
            </h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
              {editModal.product.name}
            </p>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editModal.price}
                  onChange={(e) => setEditModal({ ...editModal, price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Stock
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editModal.stock}
                  onChange={(e) => setEditModal({ ...editModal, stock: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={editModal.category}
                  onChange={(e) => setEditModal({ ...editModal, category: e.target.value })}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, product: null, price: 0, stock: 0, category: "" })}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && rejectModal.product && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Reject Product Listing
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Provide feedback to the seller why "{rejectModal.product.name}" was declined.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rejection Reason
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                rows={3}
                placeholder="e.g. Inadequate product imagery, prohibited trademark keyword, inaccurate pricing..."
                className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setRejectModal({ isOpen: false, product: null, reason: "" })}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleRejectProduct}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Drawer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Listing Details</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              <div className="flex gap-4 items-start">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedProduct.name}</h3>
                  <div className="text-xs text-slate-500 mt-1">ID: {selectedProduct.id}</div>
                  <div className="mt-2 text-xl font-black text-slate-900">${selectedProduct.price.toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 divide-y divide-slate-200/60">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Seller / Vendor</span>
                  <span className="font-semibold text-slate-900">{selectedProduct.seller_name || "Apex Electronics Ltd."}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">SKU Code</span>
                  <span className="font-mono text-slate-900">{selectedProduct.sku || selectedProduct.id}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Category</span>
                  <span className="capitalize font-medium text-slate-900">{selectedProduct.category}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Current Stock</span>
                  <span className="font-bold text-slate-900">{selectedProduct.stock ?? 25} units</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Rating</span>
                  <span className="font-bold text-amber-600">★ {selectedProduct.rating || 4.5} ({selectedProduct.reviewCount || 10} reviews)</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-slate-600 leading-relaxed text-sm bg-white p-3 rounded-lg border border-slate-200">
                  {selectedProduct.description || "No detailed description provided."}
                </p>
              </div>

              {selectedProduct.specs && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specifications</h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    {Object.entries(selectedProduct.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500 capitalize">{k.replace("_", " ")}</span>
                        <span className="font-semibold text-slate-800">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
