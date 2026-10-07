"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import {
  Search,
  Camera,
  ShoppingCart,
  Heart,
  ChevronDown,
  Sparkles,
  Zap,
  Shirt,
  Smartphone,
  Laptop,
  Flame,
  Home,
  Tv,
  Baby,
  HeartPulse,
  Car,
  Trophy,
  Menu,
  X,
  MapPin,
  User,
  Sliders,
  LogOut,
  Package,
  Clock,
  ShieldCheck,
  Phone,
} from "lucide-react";

interface NavbarProps {
  onNewChat: () => void;
  onOpenTrace?: () => void;
  onSearch?: (term: string) => void;
  onOpenPhotoModal?: () => void;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export const CATEGORIES_NAV = [
  { id: "all", label: "For You", icon: Sparkles, isSpecial: true },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "mobiles", label: "Mobiles", icon: Smartphone },
  { id: "electronics", label: "Electronics", icon: Laptop },
  { id: "beauty", label: "Beauty", icon: Flame },
  { id: "home", label: "Home", icon: Home },
  { id: "appliances", label: "Appliances", icon: Tv },
  { id: "toys-baby", label: "Toys, baby..", icon: Baby },
  { id: "food-health", label: "Food & Health", icon: HeartPulse },
  { id: "auto-accessories", label: "Auto Access...", icon: Car },
  { id: "sports-fitness", label: "Sports & Fitn...", icon: Trophy },
];

export function Navbar({
  onNewChat,
  onOpenTrace,
  onSearch,
  onOpenPhotoModal,
  onSelectCategory,
  selectedCategory = "all",
}: NavbarProps) {
  const { cartCount, subtotal, setIsCartOpen, activeTab, setActiveTab } = useCart();
  const {
    user,
    isAuthenticated,
    activeAddress,
    setIsAuthModalOpen,
    setAuthModalTab,
    setIsAddressModalOpen,
    setIsPersonalisationModalOpen,
    logout,
  } = useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "VIP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs w-full">
      {/* Top Value Ribbon - Sleek Onyx & Gold */}
      <div className="bg-slate-950 text-slate-200 text-[11px] py-1 px-3 sm:px-6 border-b border-amber-500/20">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1.5 font-bold text-amber-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cartwise Plus Exclusive
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden md:inline font-medium text-slate-300 truncate">
              ⚡ Lowest Price Guarantee Across Mobiles, Tech &amp; Daily Essentials
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] shrink-0">
            <span className="hidden sm:inline">Use coupon <strong className="text-slate-950 font-mono bg-gradient-to-r from-amber-400 to-yellow-400 px-2 py-0.5 rounded font-black">SAVE10</strong></span>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-2 cursor-pointer"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Cartwise Plus Brand Logo & Location */}
        <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
          <button
            onClick={() => {
              setActiveTab("chat");
              onNewChat();
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-amber-400/40 text-amber-400 font-black flex items-center justify-center text-base sm:text-lg shadow-sm group-hover:border-amber-400 transition-all shrink-0">
              C
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-base sm:text-xl tracking-tight text-slate-950">
                  Cartwise
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs">
                  PLUS
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium block -mt-1 hidden xs:block">
                Explore <span className="text-amber-600 font-bold">Cartwise Plus</span>
              </span>
            </div>
          </button>

          {/* Quick Location Selector */}
          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-xs leading-tight">
              <span className="text-[10px] text-slate-500 block font-medium">Deliver to</span>
              <span className="font-bold text-slate-800 truncate max-w-[130px] block">
                {activeAddress ? `${activeAddress.city} ${activeAddress.zip_code}` : "Kolkata 700156"}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Global Search Bar (Hidden on extra small mobile, shown on sm+) */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-2 lg:mx-auto">
          <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for Products, Brands and More"
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl py-2 pl-10 pr-24 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 transition-all focus:outline-none shadow-inner"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              {onOpenPhotoModal && (
                <button
                  type="button"
                  onClick={onOpenPhotoModal}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Snap Search (Photo lookup)"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-amber-400 bg-slate-950 hover:bg-slate-900 border border-amber-500/40 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Account Menu */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs text-slate-800 hidden md:inline">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalTab("signin");
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 transition-all cursor-pointer"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>Login</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-slate-800 animate-fade-in">
                <div className="p-3 border-b border-slate-100 space-y-0.5 bg-slate-50 rounded-xl mb-1">
                  <div className="font-bold text-xs text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  <div className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    {user.vip_level || "Cartwise Plus"}
                  </div>
                </div>

                <div className="py-1 space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveTab("orders");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50/50 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Package className="w-4 h-4 text-slate-500" />
                    <span>My Orders &amp; Live Tracking</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsAddressModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50/50 transition-colors text-left cursor-pointer font-medium"
                  >
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>Saved Delivery Addresses</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsPersonalisationModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50/50 transition-colors text-left cursor-pointer font-medium"
                  >
                    <Sliders className="w-4 h-4 text-slate-500" />
                    <span>Dietary &amp; AI Preferences</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Orders Quick Tab */}
          <button
            onClick={() => setActiveTab(activeTab === "orders" ? "chat" : "orders")}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-slate-900 text-amber-400 border border-amber-500/40"
                : "text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Orders</span>
          </button>

          {/* Cart Pill with Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-amber-500/40 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-xs shrink-0"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden xs:inline text-slate-100">Cart</span>
            {subtotal > 0 && (
              <span className="text-[11px] font-black text-amber-400 border-l border-slate-700 pl-1.5">
                ₹{subtotal.toFixed(0)}
              </span>
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Row (< sm screens) */}
      <div className="sm:hidden px-3 pb-2.5 pt-1 border-t border-slate-100">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Products, Brands..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl py-2 pl-9 pr-18 text-xs text-slate-900 placeholder:text-slate-500 transition-all focus:outline-none shadow-inner"
          />
          <div className="absolute right-1 flex items-center gap-1">
            {onOpenPhotoModal && (
              <button
                type="button"
                onClick={onOpenPhotoModal}
                className="p-1 text-slate-500 hover:text-amber-600"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400 bg-slate-950 border border-amber-500/40 shadow-xs"
            >
              Go
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Hamburger Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white p-3 space-y-2 animate-fade-in text-xs font-medium text-slate-700">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsAddressModalOpen(true);
            }}
            className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left"
          >
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">
              Deliver to: <strong>{activeAddress ? `${activeAddress.city} ${activeAddress.zip_code}` : "Kolkata 700156"}</strong>
            </span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveTab("orders");
            }}
            className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left"
          >
            <Package className="w-4 h-4 text-slate-600" />
            <span>My Orders &amp; Track Deliveries</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsPersonalisationModalOpen(true);
            }}
            className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            <span>Dietary &amp; AI Copilot Preferences</span>
          </button>
        </div>
      )}

      {/* Category Navigation Icons Ribbon (Smooth Touch Horizontal Scroll) */}
      <div className="border-t border-slate-200 bg-white overflow-x-auto scrollbar-none px-2 sm:px-6">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-start sm:justify-between gap-1.5 sm:gap-2 py-2">
          {CATEGORIES_NAV.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory?.(cat.id);
                  if (activeTab !== "chat") setActiveTab("chat");
                }}
                className={`flex flex-col items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 relative group ${
                  isSelected
                    ? "text-slate-950 font-bold"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-slate-950 text-amber-400 shadow-xs"
                      : "bg-slate-50 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
                  {cat.label}
                </span>
                {isSelected && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
