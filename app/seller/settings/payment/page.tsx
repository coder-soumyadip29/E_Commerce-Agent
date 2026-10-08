"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, CheckCircle, AlertCircle, ArrowLeft, Save, Lock } from "lucide-react";

export default function SellerPaymentSettingsPage() {
  const [bank, setBank] = useState<any>({
    account_holder: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch: "",
    upi_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/profile");
      const json = await res.json();
      if (res.ok && json.seller) {
        if (json.seller.bank_details) {
          setBank(json.seller.bank_details);
        } else {
          setBank({
            account_holder: json.seller.owner_name || "",
            bank_name: "HDFC Bank",
            account_number: "•••• •••• •••• 0123",
            ifsc_code: "HDFC0001234",
            branch: "Indiranagar, Bangalore",
            upi_id: `${json.seller.store_slug || "merchant"}@hdfcbank`,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/seller/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bank_details: bank }),
      });
      const json = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Payout disbursement information updated successfully." });
      } else {
        setStatusMsg({ type: "error", text: json.error || "Failed to update payout details." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Network error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/seller/payouts" className="hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to Payouts
          </Link>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Payout Account & Settlement Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure verified commercial bank coordinates for automated marketplace disbursements.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {statusMsg.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Security Banner */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">KYC & PCI DSS Guarded:</strong> Account number modifications trigger an automated identity audit. All bank credentials are encrypted at rest with AES-256 and never shared with customers or other merchants.
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Account Beneficiary Name
            </label>
            <input
              type="text"
              required
              value={bank.account_holder || ""}
              onChange={(e) => setBank({ ...bank, account_holder: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Financial Institution / Bank
            </label>
            <input
              type="text"
              required
              value={bank.bank_name || ""}
              onChange={(e) => setBank({ ...bank, bank_name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={bank.account_number || ""}
                onChange={(e) => setBank({ ...bank, account_number: e.target.value })}
                className="w-full pl-3.5 pr-8 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Lock className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              IFSC / Swift Code
            </label>
            <input
              type="text"
              required
              value={bank.ifsc_code || ""}
              onChange={(e) => setBank({ ...bank, ifsc_code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Branch Location
            </label>
            <input
              type="text"
              value={bank.branch || ""}
              onChange={(e) => setBank({ ...bank, branch: e.target.value })}
              placeholder="e.g. Indiranagar, Bangalore"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              UPI VPA (Optional)
            </label>
            <input
              type="text"
              value={bank.upi_id || ""}
              onChange={(e) => setBank({ ...bank, upi_id: e.target.value })}
              placeholder="merchant@okhdfcbank"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Bank Coordinates"}
          </button>
        </div>
      </form>
    </div>
  );
}
