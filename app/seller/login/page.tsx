"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Sparkles,
  ExternalLink,
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
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Gold Lights */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-3">
          <img
            src="/logo.png"
            alt="CartWise Plus Logo"
            className="w-16 h-16 rounded-2xl object-contain bg-black p-1 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.45)]"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>MERCHANT &amp; SELLER PORTAL</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          CartWise Seller Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
          Manage your store catalog, incoming orders, payouts, and customer engagement.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0E131F]/90 border border-amber-500/30 backdrop-blur-xl py-8 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-3xl sm:px-10">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-[#121826] p-1 mb-6 border border-amber-500/20">
            <button
              onClick={() => {
                setActiveTab("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In to Store
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register New Store
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === "login" ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                  Merchant Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-amber-400/70" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seller@cartwise.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121826] border border-amber-500/25 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-amber-400/70" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121826] border border-amber-500/25 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Merchant…</span>
                  </>
                ) : (
                  <>
                    <span>Enter Seller Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Accounts Quick-Fill Section */}
              <div className="pt-4 border-t border-amber-500/20">
                <p className="text-[11px] font-extrabold uppercase text-amber-400/90 mb-2 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>One-Click Test Accounts:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => autofill("vikram@natureharvest.in")}
                    className="p-2 rounded-xl bg-[#121826] hover:bg-amber-500/10 border border-amber-500/25 hover:border-amber-400 transition-all text-[11px] cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Nature's Harvest</div>
                    <div className="text-[10px] text-amber-300 font-mono">Active (10% Fee)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => autofill("meera@purebotanics.com")}
                    className="p-2 rounded-xl bg-[#121826] hover:bg-amber-500/10 border border-amber-500/25 hover:border-amber-400 transition-all text-[11px] cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Pure Botanics</div>
                    <div className="text-[10px] text-amber-300 font-mono">Active (12% Fee)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => autofill("rohit@earthyroots.org")}
                    className="p-2 rounded-xl bg-[#121826] hover:bg-amber-500/10 border border-amber-500/25 hover:border-amber-400 transition-all text-[11px] cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">Earthy Roots</div>
                    <div className="text-[10px] text-amber-300 font-mono">Active (8% Fee)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => autofill("ananya@greenlife.co")}
                    className="p-2 rounded-xl bg-[#121826] hover:bg-amber-500/10 border border-amber-500/25 hover:border-amber-400 transition-all text-[11px] cursor-pointer"
                  >
                    <div className="font-bold text-white truncate">GreenLife Farms</div>
                    <div className="text-[10px] text-yellow-300 font-mono">Pending Review</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1">
                  Store / Brand Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-2.5 w-4 h-4 text-amber-400/70" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Organic Spice Co."
                    value={regData.store_name}
                    onChange={(e) => setRegData({ ...regData, store_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#121826] border border-amber-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1">
                  Merchant Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-amber-400/70" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={regData.owner_name}
                    onChange={(e) => setRegData({ ...regData, owner_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#121826] border border-amber-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rajesh@brand.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121826] border border-amber-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121826] border border-amber-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1">
                  Business / Warehouse Address
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Plot 14, Industrial Area, Sector 62, Noida, UP"
                  value={regData.business_address}
                  onChange={(e) => setRegData({ ...regData, business_address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121826] border border-amber-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1">
                  GSTIN / Tax ID Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="07AAAAA0000A1Z5"
                  value={regData.tax_id}
                  onChange={(e) => setRegData({ ...regData, tax_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121826] border border-amber-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Application…</span>
                  </>
                ) : (
                  <>
                    <span>Submit Onboarding Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
          >
            <span>Return to Customer Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
