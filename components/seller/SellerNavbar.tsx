"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  Store,
  Star,
  ShieldCheck,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Seller } from "@/lib/types";

interface SellerNavbarProps {
  seller: Seller;
  onMenuToggle: () => void;
  unreadCount?: number;
}

export default function SellerNavbar({ seller, onMenuToggle, unreadCount = 0 }: SellerNavbarProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/seller/auth", { method: "DELETE" });
      router.push("/seller/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const storeSlug = seller.store_slug || seller.store_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile Menu Toggle & Store Identity */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white font-bold shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {seller.store_name}
              </span>
              {seller.verification_status === "VERIFIED" && (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Merchant" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center text-amber-600 font-semibold gap-0.5">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {seller.rating || "5.0"} Rating
              </span>
              <span>•</span>
              <span className="font-mono text-emerald-700 font-bold uppercase">{seller.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, orders, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Public Store Link, Notifications, User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Public Storefront Link */}
        <Link
          href={`/store/${storeSlug}`}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all shadow-2xs"
          title="Open your public customer store page"
        >
          <span>Live Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/seller/notifications"
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Seller Account Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-slate-800 to-slate-950 text-emerald-400 font-bold flex items-center justify-center text-xs border border-slate-300">
              {seller.owner_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-slate-900 leading-tight">{seller.owner_name}</div>
              <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{seller.email}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden xl:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-900">{seller.store_name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{seller.email}</div>
                </div>

                <Link
                  href="/seller/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Seller Profile
                </Link>

                <Link
                  href="/seller/settings/store"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Store Settings
                </Link>

                <Link
                  href={`/store/${storeSlug}`}
                  target="_blank"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                  Customer Storefront
                </Link>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
