"use client";

import React, { useState, useEffect } from "react";
import {
  Percent,
  Layers,
  Store,
  DollarSign,
  Calculator,
  RefreshCw,
  Edit2,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { CommissionConfig } from "@/lib/types";

export default function AdminCommissionsPage() {
  const [config, setConfig] = useState<CommissionConfig | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Global edit state
  const [editingGlobal, setEditingGlobal] = useState(false);
  const [globalRateInput, setGlobalRateInput] = useState(10);

  // Calculator State
  const [calcAmount, setCalcAmount] = useState(100);
  const [calcCategory, setCalcCategory] = useState("");
  const [calcSeller, setCalcSeller] = useState("");

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/commissions");
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setGlobalRateInput(data.config?.default_rate ?? 10);
        setCategories(data.categories || []);
        setSellers(data.sellers || []);
        if (data.categories?.length > 0 && !calcCategory) {
          setCalcCategory(data.categories[0].id);
        }
        if (data.sellers?.length > 0 && !calcSeller) {
          setCalcSeller(data.sellers[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleSaveGlobal = async () => {
    try {
      setActionLoading(true);
      await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_default",
          default_rate: globalRateInput,
        }),
      });
      setEditingGlobal(false);
      await fetchCommissions();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategoryRate = async (catId: string, newRate: number) => {
    try {
      await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_category",
          category_id: catId,
          rate: newRate,
        }),
      });
      await fetchCommissions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSellerRate = async (sellerId: string, newRate: number) => {
    try {
      await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_seller",
          seller_id: sellerId,
          rate: newRate,
        }),
      });
      await fetchCommissions();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculator resolution logic:
  // Hierarchy: Category override -> Seller override -> Global fallback
  const selectedCatObj = categories.find((c) => c.id === calcCategory);
  const selectedSellerObj = sellers.find((s) => s.id === calcSeller);

  let activeRate = config?.default_rate || 10;
  let ruleReason = "Global Default Platform Rate";

  if (selectedCatObj?.commission_rate !== undefined) {
    activeRate = selectedCatObj.commission_rate;
    ruleReason = `Category Override (${selectedCatObj.name})`;
  } else if (selectedSellerObj?.commission_rate !== undefined) {
    activeRate = selectedSellerObj.commission_rate;
    ruleReason = `Seller Custom Agreement (${selectedSellerObj.name})`;
  }

  const platformFee = (calcAmount * activeRate) / 100;
  const vendorPayout = calcAmount - platformFee;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Percent className="w-7 h-7 text-emerald-600" />
            Marketplace Commission Engine & Rules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Govern multi-tiered platform revenue retention rates across categories, seller contracts, and default marketplace baselines.
          </p>
        </div>
        <button
          onClick={fetchCommissions}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Reload Rules
        </button>
      </div>

      {/* Global Setting & Hierarchy Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Default Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Marketplace Baseline
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Global Commission Rate</h2>
            <p className="text-xs text-slate-500 mt-1">
              Applied automatically whenever no specific category or vendor override is defined.
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              {editingGlobal ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={globalRateInput}
                    onChange={(e) => setGlobalRateInput(parseFloat(e.target.value) || 0)}
                    className="w-24 p-2 text-2xl font-black border border-slate-300 rounded-lg text-slate-900"
                  />
                  <span className="text-2xl font-bold text-slate-400">%</span>
                </div>
              ) : (
                <div className="text-5xl font-black tracking-tight text-emerald-600">
                  {config?.default_rate ?? 10}%
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
            {editingGlobal ? (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => setEditingGlobal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGlobal}
                  disabled={actionLoading}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Save Rate
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingGlobal(true)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                Change Global Rate
              </button>
            )}
          </div>
        </div>

        {/* Live Simulation Calculator */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Calculator className="w-4 h-4" /> Real-time Fee Simulator
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                Hierarchy Rule: {ruleReason}
              </span>
            </div>
            <h3 className="text-lg font-bold mt-1 text-slate-100">Simulate Order Payout & Fee</h3>
            <p className="text-xs text-slate-400 mt-1">
              Test how commission snapshots will freeze across combinations of cart totals, categories, and sellers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Item Price ($)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-sm focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={calcCategory}
                  onChange={(e) => setCalcCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.commission_rate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Seller
                </label>
                <select
                  value={calcSeller}
                  onChange={(e) => setCalcSeller(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-emerald-500"
                >
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.commission_rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Calculator Output summary */}
          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Applied Rate</span>
              <span className="text-xl font-bold text-emerald-400">{activeRate}%</span>
            </div>
            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/50">
              <span className="text-xs text-emerald-400 block">Platform Fee Retained</span>
              <span className="text-xl font-black text-emerald-300">${platformFee.toFixed(2)}</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Vendor Net Payout</span>
              <span className="text-xl font-bold text-white">${vendorPayout.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Category Rates vs Seller Overrides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Rates Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Category Commission Rates</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">{categories.length} categories</span>
          </div>

          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{cat.name}</div>
                  <div className="text-xs text-slate-400 font-mono">/{cat.slug}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">{cat.commission_rate}%</span>
                  <button
                    onClick={() => {
                      const input = prompt(`Enter commission rate (%) for ${cat.name}:`, String(cat.commission_rate));
                      if (input !== null) {
                        const parsed = parseFloat(input);
                        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                          handleUpdateCategoryRate(cat.id, parsed);
                        }
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                    title="Edit Rate"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seller Specific Overrides Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Vendor Custom Contracts</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">{sellers.length} registered vendors</span>
          </div>

          <div className="divide-y divide-slate-100">
            {sellers.map((seller) => (
              <div key={seller.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{seller.name}</div>
                  <div className="text-xs text-slate-400">
                    Lifetime Sales: ${seller.total_sales?.toLocaleString() || "0"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {seller.commission_rate}%
                  </span>
                  <button
                    onClick={() => {
                      const input = prompt(`Enter custom commission rate (%) for ${seller.name}:`, String(seller.commission_rate));
                      if (input !== null) {
                        const parsed = parseFloat(input);
                        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                          handleUpdateSellerRate(seller.id, parsed);
                        }
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                    title="Edit Custom Rate"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
