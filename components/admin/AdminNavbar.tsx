"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { AdminNotification } from "@/lib/types";

interface AdminNavbarProps {
  onToggleMobileMenu: () => void;
  adminName?: string;
  adminRole?: string;
  notifications?: AdminNotification[];
  onMarkNotificationRead?: (id: number) => void;
  onSearch?: (term: string) => void;
}

export function AdminNavbar({
  onToggleMobileMenu,
  adminName = "Administrator",
  adminRole = "SUPER_ADMIN",
  notifications = [],
  onMarkNotificationRead,
  onSearch,
}: AdminNavbarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#07090E]/95 backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-6 flex items-center justify-between shadow-lg">
      {/* Left Area: Mobile hamburger & search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-amber-400 hover:text-white hover:bg-amber-500/10 transition-colors md:hidden cursor-pointer border border-amber-500/20"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Marketplace Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden sm:block">
          <Search className="w-4 h-4 text-amber-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sellers, orders, products, customers..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0E131F] border border-amber-500/25 focus:bg-[#121826] focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-xs text-white outline-none transition-all placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Right Area: Storefront link, Notifications, Profile Card */}
      <div className="flex items-center gap-3">
        {/* Quick Customer Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/15 transition-all cursor-pointer shadow-xs"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </Link>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer border border-transparent hover:border-amber-500/20"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-black animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0E131F] border border-amber-500/30 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] p-3 z-50 animate-fade-in backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white">Admin Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-black">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-amber-500/10 max-h-72 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No new operations alerts.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead && onMarkNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                        n.is_read ? "opacity-60 hover:opacity-100 hover:bg-white/5" : "bg-amber-500/10 hover:bg-amber-500/15"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === "CRITICAL" ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        ) : n.type === "SECURITY" ? (
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{n.title}</p>
                          <span className="text-[10px] text-amber-400/80 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-amber-500/20 text-center">
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  View all alerts & logs →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Identity Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-amber-500/20">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-600 text-black font-black text-xs flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-tight">{adminName}</p>
            <p className="text-[10px] text-amber-400 font-mono font-bold">{adminRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
