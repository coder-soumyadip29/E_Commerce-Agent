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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mb-4">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading Seller Portal...</p>
      </div>
    );
  }

  if (!seller) return null;

  // SECTION 5: ACCOUNT STATUS RESTRICTION CHECK
  if (seller.status === "SUSPENDED" || seller.status === "BLOCKED") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 mx-auto flex items-center justify-center mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Seller Account Suspended</h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Your store <strong className="text-white">"{seller.store_name}"</strong> has been temporarily suspended
            by Marketplace Compliance. Dashboard operations and customer transactions are paused.
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-left mb-6 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Merchant:</span>
              <span className="font-semibold text-slate-200">{seller.owner_name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="font-bold text-rose-400">{seller.status}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Registered Email:</span>
              <span className="font-mono text-slate-300">{seller.email}</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="mailto:support@cartwise.com"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              Contact Marketplace Support
            </a>
            <button
              onClick={async () => {
                await fetch("/api/seller/auth", { method: "DELETE" });
                router.push("/seller/login");
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isUnderReview = seller.status === "PENDING" || seller.verification_status === "UNDER_REVIEW";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <SellerSidebar
        seller={seller}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <SellerNavbar
          seller={seller}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          unreadCount={unreadCount}
        />

        {/* Verification Alert Banner if Pending */}
        {isUnderReview && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs sm:text-sm text-amber-900 font-medium">
                <strong>Verification In Progress:</strong> Your store application is currently undergoing admin review. You can configure your store and add draft products while awaiting final authorization.
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
