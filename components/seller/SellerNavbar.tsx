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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-amber-500/20 bg-[#07090E]/95 px-4 backdrop-blur-md sm:px-6 shadow-lg">
      {/* Left: Mobile Menu Toggle & Store Identity */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-xl p-2 text-amber-400 hover:text-white hover:bg-amber-500/10 border border-amber-500/20 lg:hidden cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm sm:text-base leading-tight">
                {seller.store_name}
              </span>
              {seller.verification_status === "VERIFIED" && (
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" title="Verified Merchant" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center text-amber-300 font-bold gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {seller.rating || "5.0"} Rating
              </span>
              <span>•</span>
              <span className="font-mono text-amber-400 font-bold uppercase bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30 text-[10px]">
                {seller.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-400/80" />
          <input
            type="text"
            placeholder="Search products, orders, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#0E131F] border border-amber-500/25 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:bg-[#121826] transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Public Store Link, Notifications, User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Public Storefront Link */}
        <Link
          href={`/store/${storeSlug}`}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/15 transition-all shadow-xs"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </Link>

        {/* Notifications Bell */}
        <Link
          href="/seller/notifications"
          className="relative p-2 text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition-colors border border-transparent hover:border-amber-500/20"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-amber-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            </span>
          )}
        </Link>

        {/* User / Merchant Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0E131F] border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-black font-black text-xs">
              {seller.owner_name?.slice(0, 1).toUpperCase() || "S"}
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-white max-w-[120px] truncate">
              {seller.owner_name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0E131F] border border-amber-500/30 p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-50 animate-fade-in backdrop-blur-xl">
              <div className="px-3 py-2 border-b border-amber-500/20">
                <p className="text-xs font-bold text-white truncate">{seller.owner_name}</p>
                <p className="text-[10px] text-amber-400/80 font-mono truncate">{seller.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/seller/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-amber-500/15 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Seller Profile</span>
                </Link>
                <Link
                  href="/seller/settings/store"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-amber-500/15 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Store Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-amber-500/20">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
