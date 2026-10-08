"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";

export default function SellerLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("vikram@natureharvest.in");
  const [loginPassword, setLoginPassword] = useState("Seller@12345");

  // Registration form state
  const [regData, setRegData] = useState({
    store_name: "",
    owner_name: "",
    email: "",
    phone: "",
    business_address: "",
    tax_id: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/seller/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      router.push("/seller/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/seller/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", ...regData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccessMsg("Application submitted! Your seller store is under review.");
      setTimeout(() => {
        router.push("/seller/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const autofill = (email: string) => {
    setLoginEmail(email);
    setLoginPassword("Seller@12345");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-500/20 mb-4 ring-1 ring-white/20">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white">CartWise Seller Center</h2>
        <p className="mt-2 text-sm text-slate-400">
          Multi-Vendor Merchant Portal & Fulfillment Dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-800 sm:px-10">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-950/80 rounded-xl mb-6 border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "login"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In to Store
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "register"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Apply as New Vendor
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-300 font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-300 font-medium">{successMsg}</div>
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-wide uppercase text-slate-300 mb-2">
                  Merchant Business Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="merchant@store.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wide uppercase text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Access Vendor Dashboard <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Store / Brand Name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regData.store_name}
                      onChange={(e) => setRegData({ ...regData, store_name: e.target.value })}
                      placeholder="e.g. Pure Roots Spice Co."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Owner / Contact Person</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regData.owner_name}
                      onChange={(e) => setRegData({ ...regData, owner_name: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      placeholder="owner@brand.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      placeholder="+91 98000 12345"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Business / Warehouse Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={regData.business_address}
                    onChange={(e) => setRegData({ ...regData, business_address: e.target.value })}
                    placeholder="Warehouse Estate, Bangalore, 560100"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">GSTIN / Tax ID</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={regData.tax_id}
                    onChange={(e) => setRegData({ ...regData, tax_id: e.target.value })}
                    placeholder="29AAACC1206D1ZM"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Merchant Application <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Pre-fill Pills */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 text-center">
              One-Click Demo Store Accounts (Password: Seller@12345)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => autofill("vikram@natureharvest.in")}
                className="p-2.5 text-left rounded-xl bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600/50 transition-all group"
              >
                <div className="font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                  Nature Harvest Organics
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Active (Groceries)</div>
              </button>

              <button
                type="button"
                onClick={() => autofill("ananya@techvault.com")}
                className="p-2.5 text-left rounded-xl bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600/50 transition-all group"
              >
                <div className="font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                  TechVault Express
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Active (Electronics)</div>
              </button>

              <button
                type="button"
                onClick={() => autofill("pooja@glowbotanicals.in")}
                className="p-2.5 text-left rounded-xl bg-slate-950/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-600/50 transition-all group"
              >
                <div className="font-bold text-slate-200 group-hover:text-amber-400 truncate">
                  Glow Botanicals
                </div>
                <div className="text-[11px] text-amber-400 font-mono mt-0.5">Pending (Under Review)</div>
              </button>

              <button
                type="button"
                onClick={() => autofill("siddharth@auraliving.in")}
                className="p-2.5 text-left rounded-xl bg-slate-950/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-600/50 transition-all group"
              >
                <div className="font-bold text-slate-200 group-hover:text-rose-400 truncate">
                  Aura Living Decor
                </div>
                <div className="text-[11px] text-rose-400 font-mono mt-0.5">Suspended Account</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          CartWise Multi-Vendor Network • Protected by End-to-End Ownership Guards
        </div>
      </div>
    </div>
  );
}
