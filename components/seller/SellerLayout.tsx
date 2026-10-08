"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import SellerNavbar from "./SellerNavbar";
import SellerSidebar from "./SellerSidebar";
import { Seller } from "@/lib/types";
import { ShieldAlert, Clock, AlertTriangle, Mail } from "lucide-react";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    let isMounted = true;

    async function checkSellerSession() {
      try {
        const res = await fetch("/api/seller/auth");
        if (!res.ok) {
          router.push("/seller/login");
          return;
        }

        const data = await res.json();
        if (data.authenticated && data.seller) {
          if (isMounted) {
            setSeller(data.seller);
            setLoading(false);
          }
        } else {
          router.push("/seller/login");
        }
      } catch (err) {
        console.error("Seller session check failed", err);
        router.push("/seller/login");
      }
    }

    checkSellerSession();

    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-300">
        <img
          src="/logo.png"
          alt="CartWise Plus Logo"
          className="w-16 h-16 rounded-2xl object-contain bg-black p-1 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-pulse mb-4"
        />
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs font-mono text-amber-300 font-bold uppercase tracking-widest">Loading Seller Portal...</p>
      </div>
    );
  }

  if (!seller) return null;

  // Account Status Restriction: Suspended / Blocked
  if (seller.status === "SUSPENDED" || seller.status === "BLOCKED") {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-[#0E131F] border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Seller Account Suspended</h1>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Your store <strong className="text-white">"{seller.store_name}"</strong> has been temporarily suspended
            by Marketplace Compliance. Dashboard operations and customer transactions are paused.
          </p>

          <div className="p-4 rounded-xl bg-[#121826] border border-amber-500/20 text-xs text-left mb-6 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Merchant:</span>
              <span className="font-semibold text-white">{seller.owner_name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="font-bold text-rose-400">{seller.status}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Registered Email:</span>
              <span className="font-mono text-amber-300">{seller.email}</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="mailto:support@cartwise.com"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 transition-all text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Compliance Team</span>
            </a>
            <button
              onClick={async () => {
                await fetch("/api/seller/auth", { method: "DELETE" });
                router.push("/seller/login");
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Sign Out of Merchant Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Account Status Restriction: Pending Approval
  if (seller.status === "PENDING" && pathname !== "/seller/profile" && pathname !== "/seller/support") {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-[#0E131F] border border-amber-500/40 rounded-3xl p-8 text-center shadow-[0_0_35px_rgba(245,158,11,0.2)]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-5">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Application Under Review</h1>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Welcome, <strong className="text-white">{seller.owner_name}</strong>! Your merchant store application
            for <strong className="text-amber-300">"{seller.store_name}"</strong> is currently being reviewed by our onboarding team.
          </p>

          <div className="p-4 rounded-xl bg-[#121826] border border-amber-500/20 text-xs text-left mb-6 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Merchant Email:</span>
              <span className="font-mono text-white">{seller.email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="font-bold text-amber-300">PENDING ONBOARDING REVIEW</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Timeline:</span>
              <span className="font-semibold text-slate-200">Within 24 business hours</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/seller/profile")}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 transition-all text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <span>View Submitted Profile</span>
            </button>
            <button
              onClick={async () => {
                await fetch("/api/seller/auth", { method: "DELETE" });
                router.push("/seller/login");
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white">
      {/* Sidebar Component */}
      <SellerSidebar
        seller={seller}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <SellerNavbar
          seller={seller}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#07090E] text-white seller-portal-scope">
          {children}
        </main>
      </div>
    </div>
  );
}
