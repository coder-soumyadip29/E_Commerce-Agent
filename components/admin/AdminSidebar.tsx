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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
              CW
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>CartWise</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Marketplace Control Center</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {section.title}
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
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "text-slate-300 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                      {typeof item.count === "number" && item.count > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                          {item.count}
                        </span>
                      )}
                      {!isActive && (
                        <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Footer Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
          {/* Quick link to customer storefront */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Storefront</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live</span>
          </Link>

          {/* Admin User info & logout */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <p className="text-[10px] text-emerald-400 font-mono truncate">{adminRole}</p>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign out of Admin Center"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
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
