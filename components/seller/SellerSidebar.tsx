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
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#07090E] border-r border-amber-500/20 text-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent">
          <Link href="/seller/dashboard" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="CartWise Plus Logo"
              className="w-9 h-9 rounded-xl object-contain bg-black p-0.5 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0"
            />
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">CartWise</span>
              <span className="ml-1.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                SELLER
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-500/10 hover:text-amber-300 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400 inline-block" />
                <span>{group.group}</span>
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
                      className={`group flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all border border-transparent ${
                        isActive
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-[0_0_18px_rgba(245,158,11,0.35)]"
                          : "text-slate-300 hover:bg-amber-500/10 hover:text-white hover:border-amber-500/20"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? "text-black" : "text-amber-400/70 group-hover:text-amber-300"
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
        <div className="p-3 border-t border-amber-500/20 bg-[#0A0D16]">
          <div className="p-3 rounded-2xl bg-[#0F1422] border border-amber-500/30 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
              <span className="truncate">{seller.store_name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold uppercase">
                {seller.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 mb-2.5">
              Commission Rate: <span className="text-amber-400 font-bold">{seller.commission_rate}%</span>
            </p>
            <Link
              href={`/store/${storeSlug}`}
              target="_blank"
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all"
            >
              <span>View Live Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
