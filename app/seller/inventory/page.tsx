"use client";

import React, { useState, useEffect } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  Warehouse,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  RefreshCw,
  Plus,
  Minus,
  Layers,
} from "lucide-react";

export default function SellerInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/inventory?search=${encodeURIComponent(search)}&filter=${filter}`);
      if (res.ok) {
        const json = await res.json();
        setInventory(json.inventory || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const saveStock = async (productId: number, newStock: number) => {
    try {
      setUpdating(true);
      const res = await fetch("/api/seller/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stock: newStock }),
      });
      if (res.ok) {
        setEditingId(null);
        await fetchInventory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const lowStockCount = inventory.filter((i) => i.status === "LOW_STOCK").length;
  const outOfStockCount = inventory.filter((i) => i.status === "OUT_OF_STOCK").length;
  const inStockCount = inventory.filter((i) => i.status === "IN_STOCK").length;

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-emerald-600" />
              Inventory & Warehouse Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time stock tracking with reserved order allocation and low-stock replenishment warnings.
            </p>
          </div>

          <button
            onClick={fetchInventory}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            Refresh Stock
          </button>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setFilter("ALL")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              filter === "ALL"
                ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Catalog SKUs</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{inventory.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{inStockCount} Healthy Stock</div>
          </button>

          <button
            onClick={() => setFilter("LOW")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              filter === "LOW"
                ? "bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Low Stock Warnings</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{lowStockCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Stock ≤ 10 units threshold</div>
          </button>

          <button
            onClick={() => setFilter("OUT")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              filter === "OUT"
                ? "bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700">Out of Stock</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{outOfStockCount}</div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">Unavailable for customer purchase</div>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by product name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            Filter
          </button>
        </form>

        {/* Inventory Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Total Warehouse Stock</th>
                  <th className="py-3 px-4">Reserved in Orders</th>
                  <th className="py-3 px-4">Available to Sell</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Stock Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => {
                    const isEditing = editingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 leading-snug truncate">
                                {item.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                SKU: {item.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800">₹{item.price}</td>

                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={tempStock}
                                onChange={(e) => setTempStock(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-20 px-2 py-1 text-xs border border-emerald-500 rounded-lg font-bold"
                              />
                              <button
                                onClick={() => saveStock(item.id, tempStock)}
                                disabled={updating}
                                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                title="Save"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                                title="Cancel"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-bold text-slate-900 text-sm">{item.totalStock}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {item.reservedStock} units
                        </td>

                        <td className="py-3.5 px-4 font-black text-emerald-700 font-mono text-sm">
                          {item.availableStock} units
                        </td>

                        <td className="py-3.5 px-4">
                          {item.status === "IN_STOCK" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> In Stock
                            </span>
                          )}
                          {item.status === "LOW_STOCK" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          )}
                          {item.status === "OUT_OF_STOCK" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => saveStock(item.id, Math.max(0, item.totalStock - 5))}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-[11px]"
                              title="Decrease 5"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => saveStock(item.id, item.totalStock + 10)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700 font-bold text-[11px]"
                              title="Add 10"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setTempStock(item.totalStock);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
                              title="Edit Exact Count"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
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
      </div>
    </SellerLayout>
  );
}
