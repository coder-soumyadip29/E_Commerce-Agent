"use client";

import React, { useState, useEffect } from "react";
import {
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  ArrowUpDown,
  Edit2,
  PackageCheck,
  PackageX,
  History,
} from "lucide-react";
import { Product } from "@/lib/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW" | "OUT" | "HEALTHY">("ALL");
  const [threshold, setThreshold] = useState(10);

  // Quick adjustment modal
  const [adjustModal, setAdjustModal] = useState<{
    isOpen: boolean;
    product: Product | null;
    currentStock: number;
    adjustment: number;
    reason: string;
  }>({
    isOpen: false,
    product: null,
    currentStock: 0,
    adjustment: 0,
    reason: "RESTOCK",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal.product) return;

    const newStock = Math.max(0, adjustModal.currentStock + adjustModal.adjustment);

    try {
      setActionLoading(true);
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_stock",
          product_id: adjustModal.product.id,
          stock: newStock,
          reason: `${adjustModal.reason}: ${adjustModal.adjustment > 0 ? "+" : ""}${adjustModal.adjustment} units`,
        }),
      });

      setAdjustModal({
        isOpen: false,
        product: null,
        currentStock: 0,
        adjustment: 0,
        reason: "RESTOCK",
      });
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const stock = p.stock ?? 20;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).toLowerCase().includes(search.toLowerCase()) ||
      p.seller_name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === "OUT") return stock === 0;
    if (stockFilter === "LOW") return stock > 0 && stock <= threshold;
    if (stockFilter === "HEALTHY") return stock > threshold;
    return true;
  });

  const outOfStockCount = products.filter((p) => (p.stock ?? 20) === 0).length;
  const lowStockCount = products.filter((p) => (p.stock ?? 20) > 0 && (p.stock ?? 20) <= threshold).length;
  const healthyCount = products.filter((p) => (p.stock ?? 20) > threshold).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Warehouse className="w-7 h-7 text-emerald-600" />
            Inventory & Stock Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock level monitoring across all seller inventories with automated reorder warnings and audit tracking.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Stock
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStockFilter("ALL")}
          className={`p-4 rounded-xl border text-left transition-all ${
            stockFilter === "ALL"
              ? "bg-white shadow-xs ring-2 ring-emerald-500 border-transparent"
              : "bg-white hover:bg-slate-50/50 border-slate-200"
          }`}
        >
          <div className="text-xs font-semibold text-slate-500">Total Tracked SKUs</div>
          <div className="text-2xl font-bold mt-1 text-slate-900">{products.length}</div>
        </button>

        <button
          onClick={() => setStockFilter("LOW")}
          className={`p-4 rounded-xl border text-left transition-all ${
            stockFilter === "LOW"
              ? "bg-white shadow-xs ring-2 ring-amber-500 border-transparent"
              : "bg-white hover:bg-slate-50/50 border-slate-200"
          }`}
        >
          <div className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock (≤{threshold})
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{lowStockCount}</div>
        </button>

        <button
          onClick={() => setStockFilter("OUT")}
          className={`p-4 rounded-xl border text-left transition-all ${
            stockFilter === "OUT"
              ? "bg-white shadow-xs ring-2 ring-rose-500 border-transparent"
              : "bg-white hover:bg-slate-50/50 border-slate-200"
          }`}
        >
          <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
            <PackageX className="w-4 h-4 text-rose-500" /> Out of Stock
          </div>
          <div className="text-2xl font-bold mt-1 text-rose-600">{outOfStockCount}</div>
        </button>

        <button
          onClick={() => setStockFilter("HEALTHY")}
          className={`p-4 rounded-xl border text-left transition-all ${
            stockFilter === "HEALTHY"
              ? "bg-white shadow-xs ring-2 ring-emerald-500 border-transparent"
              : "bg-white hover:bg-slate-50/50 border-slate-200"
          }`}
        >
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-500" /> Adequate Inventory
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{healthyCount}</div>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, product name, seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>Alert threshold:</span>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-800"
          >
            <option value="5">5 units</option>
            <option value="10">10 units</option>
            <option value="15">15 units</option>
            <option value="20">20 units</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Checking stock quantities...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = p.stock ?? 20;
                  const isOut = stock === 0;
                  const isLow = stock > 0 && stock <= threshold;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || p.image_url || ""}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 leading-snug">{p.name}</div>
                            <div className="text-xs text-slate-400 font-mono">SKU: {p.sku || p.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {p.seller_name || "Apex Electronics Ltd."}
                      </td>

                      <td className="py-3 px-4 text-slate-500 capitalize text-xs">
                        {p.category}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        ${p.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="text-base font-extrabold text-slate-900">
                          {stock}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" /> Depleted
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Healthy
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            setAdjustModal({
                              isOpen: true,
                              product: p,
                              currentStock: stock,
                              adjustment: 10,
                              reason: "RESTOCK",
                            })
                          }
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <ArrowUpDown className="w-3 h-3 text-slate-500" /> Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustModal.isOpen && adjustModal.product && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Adjust Inventory Stock
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {adjustModal.product.name}
            </p>

            <form onSubmit={handleAdjustStock} className="mt-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Current Stock Level:</span>
                <span className="font-bold text-slate-900 text-base">{adjustModal.currentStock} units</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity Adjustment (+ or -)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModal({ ...adjustModal, adjustment: adjustModal.adjustment - 5 })}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    required
                    value={adjustModal.adjustment}
                    onChange={(e) =>
                      setAdjustModal({ ...adjustModal, adjustment: parseInt(e.target.value) || 0 })
                    }
                    className="w-full text-center p-2.5 text-base font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustModal({ ...adjustModal, adjustment: adjustModal.adjustment + 5 })}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-1 text-center">
                  Resulting Stock:{" "}
                  <span className="font-bold text-slate-900">
                    {Math.max(0, adjustModal.currentStock + adjustModal.adjustment)} units
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustModal.reason}
                  onChange={(e) => setAdjustModal({ ...adjustModal, reason: e.target.value })}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="RESTOCK">Vendor Restock Shipment Received</option>
                  <option value="CORRECTION">Physical Inventory Audit / Count Correction</option>
                  <option value="DAMAGED">Damaged / Expired / Written Off Units</option>
                  <option value="RETURN">Customer Return Restocked to Inventory</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModal({ isOpen: false, product: null, currentStock: 0, adjustment: 0, reason: "RESTOCK" })}
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
                  Confirm Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
