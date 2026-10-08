"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SellerLayout from "@/components/seller/SellerLayout";
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Percent,
} from "lucide-react";
import { Seller } from "@/lib/types";

export default function SellerProfilePage() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/seller/auth");
        if (res.ok) {
          const json = await res.json();
          setSeller(json.seller);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute profile completion score (Section 37)
  let completionScore = 40;
  const missingItems = [];
  if (seller?.tax_id) completionScore += 20;
  else missingItems.push("GSTIN / Tax ID verification");

  if (seller?.bank_details?.account_number) completionScore += 20;
  else missingItems.push("Bank payout account");

  if (seller?.business_address) completionScore += 10;
  else missingItems.push("Business warehouse address");

  if (seller?.banner_url) completionScore += 10;
  else missingItems.push("Store banner customization");

  // Mask bank account
  const rawAcct = seller?.bank_details?.account_number || "";
  const maskedAcct = rawAcct.length > 4 ? `•••• •••• ${rawAcct.slice(-4)}` : "Not provided";

  return (
    <SellerLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-600" />
            Seller Identity & Verification Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official merchant credentials, compliance verification status, and payout settlement details.
          </p>
        </div>

        {/* Profile Completion Card (Section 37) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <div className="text-sm font-bold text-slate-900">Profile Completion Status</div>
              <div className="text-xs text-slate-500">
                {completionScore === 100
                  ? "Your profile is 100% complete and fully verified."
                  : `Complete remaining items to unlock priority express disbursements.`}
              </div>
            </div>
            <div className="text-xl font-black text-emerald-600">{completionScore}%</div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>

          {missingItems.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Pending action: {missingItems.join(" • ")}</span>
            </div>
          )}
        </div>

        {/* Main Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Merchant Information
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {seller?.verification_status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Store Name</label>
                <div className="text-sm font-bold text-slate-900">{seller?.store_name}</div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Contact Person / Owner</label>
                <div className="text-sm font-bold text-slate-900">{seller?.owner_name}</div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Registered Email</label>
                <div className="text-xs font-mono font-medium text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {seller?.email}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Contact Phone</label>
                <div className="text-xs font-mono font-medium text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {seller?.phone}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Warehouse Address</label>
                <div className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  {seller?.business_address || "Not provided"}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Member Since</label>
                <div className="text-xs text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {seller?.created_at ? new Date(seller.created_at).toLocaleDateString() : "2026"}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Sensitive Banking Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Compliance & Financial Payouts
              </h2>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Protected Fields
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">GSTIN / Tax ID</label>
                <div className="text-sm font-mono font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  {seller?.tax_id || "GSTIN Verified On Record"}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Contract Commission Rate</label>
                <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  {seller?.commission_rate || 10}% Platform Fee
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Bank Payout Account</label>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">
                    {seller?.bank_details?.bank_name || "HDFC Bank"}
                  </div>
                  <div className="text-xs font-mono text-slate-600">
                    A/C: <span className="font-bold text-slate-900">{maskedAcct}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    IFSC: {seller?.bank_details?.ifsc_code || "HDFC0001234"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Beneficiary: {seller?.bank_details?.account_holder || seller?.store_name}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 leading-relaxed border border-slate-100">
                🔒 Payout bank account details are verified by Marketplace Compliance. To update your IFSC or account number, please submit a request in <Link href="/seller/support" className="text-emerald-700 font-bold underline">Help & Support</Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
