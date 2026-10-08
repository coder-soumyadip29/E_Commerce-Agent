"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  FolderTree,
  Warehouse,
  ShoppingBag,
  RotateCcw,
  DollarSign,
  CreditCard,
  Percent,
  Banknote,
  Ticket,
  Sparkles,
  Star,
  FileBarChart,
  LineChart,
  Bell,
  ShieldAlert,
  History,
  Settings,
  ChevronRight,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AdminSidebarProps {
  onLogout?: () => void;
  adminName?: string;
  adminRole?: string;
  unreadCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  count?: number;
}

interface NavSection {
  title: string | null;
  items: NavItem[];
}

export function AdminSidebar({
  onLogout,
  adminName = "Administrator",
  adminRole = "SUPER_ADMIN",
  unreadCount = 3,
  isOpenMobile = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const NAV_SECTIONS: NavSection[] = [
    {
      title: null,
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Marketplace",
      items: [
        { label: "Sellers", href: "/admin/sellers", icon: Store, badge: "1 Pending" },
        { label: "Customers", href: "/admin/customers", icon: Users },
        { label: "Products", href: "/admin/products", icon: Package },
        { label: "Categories", href: "/admin/categories", icon: FolderTree },
        { label: "Inventory", href: "/admin/inventory", icon: Warehouse, badgeColor: "rose" },
      ],
    },
    {
      title: "Orders & Fulfillment",
      items: [
        { label: "All Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Returns", href: "/admin/returns", icon: RotateCcw },
        { label: "Refunds", href: "/admin/refunds", icon: DollarSign },
      ],
    },
    {
      title: "Finance & Economics",
      items: [
        { label: "Payments", href: "/admin/payments", icon: CreditCard },
        { label: "Commissions", href: "/admin/commissions", icon: Percent },
        { label: "Payouts", href: "/admin/payouts", icon: Banknote, badge: "1 Pending" },
      ],
    },
    {
      title: "Marketing & Growth",
      items: [
        { label: "Coupons", href: "/admin/coupons", icon: Ticket },
        { label: "Promotions", href: "/admin/promotions", icon: Sparkles },
        { label: "Reviews", href: "/admin/reviews", icon: Star },
      ],
    },
    {
      title: "Analytics & Reports",
      items: [
        { label: "Reports", href: "/admin/reports", icon: FileBarChart },
        { label: "Analytics", href: "/admin/analytics", icon: LineChart },
      ],
    },
    {
      title: "System & Governance",
      items: [
        { label: "Notifications", href: "/admin/notifications", icon: Bell, count: unreadCount },
        { label: "Admin Users", href: "/admin/admin-users", icon: ShieldAlert },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#07090E] text-slate-200 border-r border-amber-500/20 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="CartWise Plus Logo"
              className="w-10 h-10 rounded-xl object-contain bg-black p-0.5 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0"
            />
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>CartWise</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold shadow-xs">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-amber-300/70 font-medium">Marketplace Control Center</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-amber-400/80 mb-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-400 inline-block" />
                  <span>{section.title}</span>
                </h4>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-[0_0_18px_rgba(245,158,11,0.35)]"
                        : "text-slate-300 hover:text-white hover:bg-amber-500/10 hover:border-amber-500/20 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-black" : "text-amber-400/70 group-hover:text-amber-300"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          isActive
                            ? "bg-black/30 text-black border-black/20"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {typeof item.count === "number" && item.count > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                          {item.count}
                        </span>
                      )}
                      {!isActive && (
                        <ChevronRight className="w-3 h-3 text-amber-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Footer Actions */}
        <div className="p-3 border-t border-amber-500/20 bg-[#0A0D16] space-y-2">
          {/* Quick link to customer storefront */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white font-medium">Customer Storefront</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">Live</span>
          </Link>

          {/* Admin User info & logout */}
          <div className="p-2.5 rounded-xl bg-[#0F1422] border border-amber-500/30 flex items-center justify-between shadow-xs">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-extrabold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-amber-400 font-mono font-bold tracking-wider truncate">{adminRole}</p>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out of Admin Center"
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer border border-transparent hover:border-amber-500/30"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
