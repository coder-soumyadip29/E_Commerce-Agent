"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Bot,
  Mail,
  Send,
  ArrowUp,
  MapPin,
  Phone,
  CheckCircle2,
  ExternalLink,
  Lock,
  Heart,
  HelpCircle,
} from "lucide-react";

interface FooterProps {
  onSelectCategory?: (category: string) => void;
  onAskAI?: (query: string) => void;
  onOpenOrders?: () => void;
  onScrollToTop?: () => void;
}

export function Footer({
  onSelectCategory,
  onAskAI,
  onOpenOrders,
  onScrollToTop,
}: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
      }, 3000);
    }
  };

  const handleScrollTop = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-8 bg-slate-950 text-slate-300 border-t border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. Value Assurance Strip */}
      <div className="border-b border-white/10 bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 px-4 sm:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">15-Min Delivery</h4>
              <p className="text-[11px] text-slate-400">Hyperlocal dispatch, free over ₹199</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">100% Genuine</h4>
              <p className="text-[11px] text-slate-400">Direct brand authorized stock</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">7-Day Free Returns</h4>
              <p className="text-[11px] text-slate-400">Doorstep pickup &amp; instant refund</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">256-Bit SSL Secure</h4>
              <p className="text-[11px] text-slate-400">RBI compliant payment gateways</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Columns */}
      <div className="px-4 sm:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 text-xs">
          {/* Brand Info & Newsletter (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="CartWise Plus"
                className="w-9 h-9 rounded-xl bg-slate-900 p-0.5 border border-amber-500/40 object-contain shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-white tracking-tight">CartWise</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950">
                    PLUS+
                  </span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-medium">
                  Smarter Search • Better Choices
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              CartWise Plus is India’s next-generation retail intelligence platform. We combine
              instant 15-minute fulfillment, verified local SQLite inventory, and autonomous AI
              assistants to help you make confident buying decisions.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-xs font-bold text-white block mb-1.5">
                Subscribe for Exclusive Member Deals
              </span>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Get ₹200 off your first purchase and price drop notifications.
              </p>

              {subscribed ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Welcome! Check your inbox for code <strong>WELCOME200</strong>.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                  >
                    <span>Join</span>
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>

            {/* Registered Address */}
            <div className="pt-1 flex items-start gap-2 text-[10px] text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Ecospace Tech Park, Block 3B, New Town, Kolkata, West Bengal 700156
              </span>
            </div>
          </div>

          {/* Quick Shop Categories (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-wider text-amber-400">
              Categories
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>
                <button
                  onClick={() => onSelectCategory?.("mobiles")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Smartphones &amp; 5G Mobiles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("electronics")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Laptops &amp; OLED Displays
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("electronics")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  4K Smart TVs &amp; Soundbars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("fashion")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Men &amp; Women Fashion
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("appliances")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Refrigerators &amp; Smart Appliances
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory?.("groceries")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Organic Groceries &amp; Staples
                </button>
              </li>
              <li>
                <button
                  onClick={() => onAskAI?.("Show me all current top deals")}
                  className="text-amber-400 font-bold hover:underline transition-colors text-left cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Explore All Live Deals</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-wider text-amber-400">
              Customer Support
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>
                <button
                  onClick={onOpenOrders}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Track Your Deliveries &amp; Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => onAskAI?.("What is your refund and return policy?")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                >
                  Returns &amp; Doorstep Replacements
                </button>
              </li>
              <li>
                <button
                  onClick={() => onAskAI?.("Help me find a gift under 3000 rupees")}
                  className="hover:text-amber-400 transition-colors text-left cursor-pointer flex items-center gap-1"
                >
                  <Bot className="w-3 h-3 text-amber-400" />
                  <span>Ask AI Shopping Assistant</span>
                </button>
              </li>
              <li>
                <span className="text-slate-500">Shipping Rates &amp; Dark Store Logistics</span>
              </li>
              <li>
                <span className="text-slate-500">CartWise Plus Membership Perks</span>
              </li>
              <li>
                <span className="text-slate-500">Terms of Service &amp; User Privacy</span>
              </li>
              <li className="pt-1 flex items-center gap-1.5 text-slate-300 font-medium">
                <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                <span>24/7 Helpline: 1800-CART-WISE</span>
              </li>
            </ul>
          </div>

          {/* Safe Payments & App (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-wider text-amber-400">
              Verified Secure
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Zero-fraud protected transactions with instant UPI and card tokens.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                UPI
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                GPay
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                PhonePe
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                Visa
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                MasterCard
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-400">
                RuPay
              </span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                COD
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleScrollTop}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright Bar */}
      <div className="border-t border-white/10 bg-slate-950 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <div>
          © 2024–2026 CartWise Plus Retail Technologies Pvt. Ltd. All rights reserved.
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Notice</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Conditions of Sale</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Security Safeguards</span>
          <span>•</span>
          <span className="text-amber-400/80 font-semibold">Grounded AI Architecture</span>
        </div>
      </div>
    </footer>
  );
}
