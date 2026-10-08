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
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left Area: Mobile hamburger & search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Marketplace Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sellers, orders, products, customers..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Right Area: Storefront link, Notifications, Profile Card */}
      <div className="flex items-center gap-3">
        {/* Quick Customer Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">Admin Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead && onMarkNotificationRead(n.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.is_read
                          ? "bg-white border-slate-100 text-slate-600"
                          : "bg-emerald-50/50 border-emerald-200/60 text-slate-900"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.type === "danger" ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        ) : n.type === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 leading-snug">{n.message}</p>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                            {n.created_at}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                >
                  View All System Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Mini Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shadow-xs">
            SA
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{adminName}</p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{adminRole}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
