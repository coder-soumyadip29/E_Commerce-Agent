"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Check,
  RefreshCw,
  Building,
  ShieldCheck,
  DollarSign,
  Clock,
  Sliders,
} from "lucide-react";
import { PlatformSettings } from "@/lib/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: settings }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
        Loading platform parameters...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-emerald-600" />
            Marketplace Platform Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global marketplace business rules, vendor onboarding permissions, minimum disbursement levels, and contact info.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Marketplace Branding */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-bold text-slate-900">
            <Building className="w-5 h-5 text-emerald-600" /> General Identity & Support
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                required
                value={settings.platform_name || settings.marketplace_name || "CartWise Marketplace"}
                onChange={(e) => setSettings({ ...settings, platform_name: e.target.value, marketplace_name: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                required
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency Code
              </label>
              <input
                type="text"
                required
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                required
                value={settings.currency_symbol}
                onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Vendor & Operational Policies */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 font-bold text-slate-900">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Multi-Vendor & Moderation Policies
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={settings.allow_new_seller_registration ?? settings.require_seller_approval ?? true}
                onChange={(e) => setSettings({ ...settings, allow_new_seller_registration: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm mt-0.5"
              />
              <div>
                <span className="font-semibold text-slate-900 text-sm block">
                  Allow Public Seller Onboarding Registration
                </span>
                <span className="text-xs text-slate-500">
                  When enabled, merchants can sign up and submit KYC verification documents through the seller registration portal.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={settings.require_product_approval ?? true}
                onChange={(e) => setSettings({ ...settings, require_product_approval: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm mt-0.5"
              />
              <div>
                <span className="font-semibold text-slate-900 text-sm block">
                  Enforce Product Moderation Approval
                </span>
                <span className="text-xs text-slate-500">
                  New products submitted by vendors will require manual admin sign-off before being visible in the public catalog.
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Payout Disbursement Threshold ($)
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={settings.minimum_payout_amount ?? 50}
                onChange={(e) => setSettings({ ...settings, minimum_payout_amount: parseFloat(e.target.value) || 50 })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payout Schedule Frequency
              </label>
              <select
                value={settings.payout_schedule || "BI_WEEKLY"}
                onChange={(e) => setSettings({ ...settings, payout_schedule: e.target.value as any })}
                className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="BI_WEEKLY">Bi-Weekly (Every 14 days)</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Platform settings updated successfully
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
}
