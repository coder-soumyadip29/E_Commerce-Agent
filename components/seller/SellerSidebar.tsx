"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Settings,
  Package,
  PlusCircle,
  Star,
  Warehouse,
  ShoppingBag,
  RotateCcw,
  DollarSign,
  Percent,
  CreditCard,
  Ticket,
  BarChart2,
  Bell,
  HelpCircle,
  User,
  X,
  ExternalLink,
} from "lucide-react";
import { Seller } from "@/lib/types";

interface SellerSidebarProps {
  seller: Seller;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  exact?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function SellerSidebar({ seller, isOpen, onClose }: SellerSidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      group: "Store & Brand",
      items: [
        { label: "My Store", href: "/seller/store", icon: Store },
        { label: "Store Settings", href: "/seller/settings/store", icon: Settings },
      ],
    },
    {
      group: "Catalog & Stock",
      items: [
        { label: "All Products", href: "/seller/products", icon: Package, exact: true },
        { label: "Add Product", href: "/seller/products/new", icon: PlusCircle },
        { label: "Inventory & Stock", href: "/seller/inventory", icon: Warehouse },
        { label: "Product Reviews", href: "/seller/reviews", icon: Star },
      ],
    },
    {
      group: "Fulfillment",
      items: [
        { label: "Orders & Shipping", href: "/seller/orders", icon: ShoppingBag },
        { label: "Returns & RMA", href: "/seller/returns", icon: RotateCcw },
      ],
    },
    {
      group: "Finance & Balance",
      items: [
        { label: "Earnings Summary", href: "/seller/earnings", icon: DollarSign },
        { label: "Commission History", href: "/seller/commissions", icon: Percent },
        { label: "Payout Requests", href: "/seller/payouts", icon: CreditCard },
      ],
    },
    {
      group: "Marketing & Growth",
      items: [
        { label: "Store Coupons", href: "/seller/coupons", icon: Ticket },
        { label: "Sales Analytics", href: "/seller/analytics", icon: BarChart2 },
      ],
    },
    {
      group: "Communication & Help",
      items: [
        { label: "Notifications", href: "/seller/notifications", icon: Bell },
        { label: "Help & Support", href: "/seller/support", icon: HelpCircle },
        { label: "Seller Profile", href: "/seller/profile", icon: User },
      ],
    },
  ];

  const storeSlug = seller.store_slug || seller.store_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <Link href="/seller/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-950">
              CW
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight">CartWise</span>
              <span className="ml-1.5 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Seller
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose()}
                      className={`group flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50 font-bold"
                          : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? "text-white" : "text-slate-500 group-hover:text-emerald-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Public Store Banner Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
              <span className="truncate">{seller.store_name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                {seller.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">
              Commission Rate: {seller.commission_rate}%
            </p>
            <Link
              href={`/store/${storeSlug}`}
              target="_blank"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 transition-colors"
            >
              <span>Customer Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
