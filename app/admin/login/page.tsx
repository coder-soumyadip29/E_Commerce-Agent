"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  ExternalLink,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@cartwise.com");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Check your credentials.");
        setLoading(false);
        return;
      }

      // Success, route to dashboard
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@cartwise.com");
    setPassword("Admin@12345");
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient gold lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E131F] border border-amber-500/30 text-xs text-amber-300 font-mono mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="font-bold">Restricted Portal • Authorized Personnel Only</span>
        </div>

        <div className="flex justify-center mb-3">
          <img
            src="/logo.png"
            alt="CartWise Plus Logo"
            className="w-16 h-16 rounded-2xl object-contain bg-black p-1 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.45)]"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Marketplace Admin Center
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Sign in with your administrative credentials to manage vendors, orders, and finance.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0E131F]/90 border border-amber-500/30 backdrop-blur-xl py-8 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cartwise.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121826] border border-amber-500/25 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-xs text-white outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121826] border border-amber-500/25 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-xs text-white outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Quick Demo Pre-fill helper */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Fill Super Admin Credentials</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
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
