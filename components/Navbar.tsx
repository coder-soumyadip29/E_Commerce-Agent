import React, { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import {
  Search,
  Camera,
  ShoppingCart,
  Heart,
  Store,
  ChevronDown,
  Sparkles,
  Zap,
  Apple,
  Wheat,
  Flame,
  Droplets,
  Nut,
  Milk,
  Coffee,
  Cookie,
  Menu,
  X,
  CheckCircle2,
  MapPin,
  User,
  Sliders,
  LogOut,
  LogIn,
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
  { id: "all", label: "Top Offers", icon: Zap, isSpecial: true },
  { id: "fruits-vegetables", label: "Fruits & Veggies", icon: Apple },
  { id: "staples", label: "Staples & Grains", icon: Wheat },
  { id: "spices-masalas", label: "Spices & Masalas", icon: Flame },
  { id: "oils-ghee", label: "Oils & Ghee", icon: Droplets },
  { id: "dry-fruits-nuts", label: "Dry Fruits & Nuts", icon: Nut },
  { id: "dairy-eggs", label: "Dairy & Eggs", icon: Milk },
  { id: "beverages", label: "Beverages", icon: Coffee },
  { id: "snacks-packaged-foods", label: "Snacks & Bakery", icon: Cookie },
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
  const [wishlistCount] = useState(4);
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
    <header className="sticky top-0 z-50 bg-[#0c1019]/90 backdrop-blur-md border-b border-white/10 transition-colors">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand / Logo & Delivery Address */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => {
              setActiveTab("chat");
              onSelectCategory?.("all");
            }}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d121f] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  CartWise
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30">
                  PLUS
                </span>
              </div>
              <span className="block text-[9px] font-semibold tracking-widest text-slate-400 uppercase -mt-0.5">
                EXPLORE AI UNIVERSE
              </span>
            </div>
          </button>

          {/* Delivery Location Pill */}
          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131b2c] hover:bg-[#18233a] border border-white/10 hover:border-cyan-400/40 text-left transition-all cursor-pointer group"
            title="Change Delivery Address"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 group-hover:animate-bounce" />
            <div className="text-[11px] leading-tight max-w-[130px] md:max-w-[170px] truncate">
              <span className="text-slate-400 font-medium">Deliver to: </span>
              <span className="text-white font-bold">
                {activeAddress ? `${activeAddress.label} (${activeAddress.city})` : "Select Address"}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-cyan-300" />
          </button>
        </div>

        {/* Center: Search Bar with Pill Aesthetics */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-4">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full relative flex items-center bg-[#141b2a] border border-white/10 rounded-full py-1 pl-4 pr-1.5 hover:border-white/20 focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all shadow-inner"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search organic raw honey, oats, cold-pressed oils..."
              className="w-full bg-transparent border-none text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none"
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {onOpenPhotoModal && (
                <button
                  type="button"
                  onClick={onOpenPhotoModal}
                  className="p-1.5 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Snap Search (Image Upload)"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
              >
                Find
              </button>
            </div>
          </form>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile / Auth Cluster with Interactive Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#131927] border border-white/10 hover:border-cyan-400/40 transition-colors cursor-pointer"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-emerald-400/50 bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs">
                  {getInitials(user.name)}
                </div>
                <div className="hidden md:block text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    <span>{user.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{user.vip_level}</span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalTab("signin");
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0e1422] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-white/10 space-y-0.5">
                  <div className="font-bold text-xs text-white">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  <div className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {user.vip_level}
                  </div>
                </div>

                <div className="py-1 space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsAddressModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Delivery Addresses ({user.addresses?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsPersonalisationModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Personalisation & Diet</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setAuthModalTab("signup");
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Switch / Create Account</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-white/10">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Become a Seller */}
          <button
            onClick={() => alert("CartWise Seller Portal: AI Automated Inventory onboarding active.")}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-purple-400" />
            <span>Become a Seller</span>
          </button>

          {/* Wishlist Heart */}
          <button
            onClick={() => alert(`Your Wishlist has ${wishlistCount} saved organic items.`)}
            className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-4 h-4 text-slate-300" />
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-[17px] text-[10px] font-bold text-white bg-purple-600 rounded-full border border-[#0c1019]">
              {wishlistCount}
            </span>
          </button>

          {/* Cart Pill with Price */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151d2e] hover:bg-[#1a2337] border border-white/10 hover:border-emerald-400/40 text-slate-200 transition-all cursor-pointer group"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">Cart</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] font-black text-emerald-300 bg-emerald-500/20">
              {cartCount}
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-slate-300 border-l border-white/10 pl-2">
              ${subtotal.toFixed(2)}
            </span>
          </button>

          {/* Live Agent Grid Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live 75/25 Agent Grid</span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>


      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0c1019] px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search organic catalog..."
              className="w-full bg-[#141b2a] border border-white/10 rounded-full py-2 pl-9 pr-20 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-full"
            >
              Search
            </button>
          </form>

          {/* User Quick Actions on Mobile */}
          <div className="p-2.5 rounded-2xl bg-[#141c2c] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{user ? user.name : "Guest Shopper"}</div>
                  <div className="text-[10px] text-cyan-300">{user ? user.vip_level : "Sign in for VIP perks"}</div>
                </div>
              </div>

              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs font-semibold text-rose-400 hover:underline"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalTab("signin");
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAddressModalOpen(true);
                }}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-[#1a2336] text-[11px] font-semibold text-slate-200"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">Addresses</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsPersonalisationModalOpen(true);
                }}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-[#1a2336] text-[11px] font-semibold text-slate-200"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate">Diet & AI Prefs</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setActiveTab("chat");
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold text-center ${
                activeTab === "chat" ? "bg-indigo-600 text-white" : "bg-[#141b2a] text-slate-300"
              }`}
            >
              Copilot Chat
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold text-center ${
                activeTab === "orders" ? "bg-indigo-600 text-white" : "bg-[#141b2a] text-slate-300"
              }`}
            >
              Past Orders
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-slate-400">
            <span>Agent Status: Online</span>
            <button
              onClick={() => {
                onOpenTrace?.();
                setMobileMenuOpen(false);
              }}
              className="text-cyan-400 font-semibold underline"
            >
              Inspect Agent Trace
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
