"use client";

import React from "react";
import { Sparkles, ArrowRight, Bot, Scale, Coffee, Utensils, Zap, Package } from "lucide-react";

interface EmptyChatPromptProps {
  onSelectPrompt: (query: string) => void;
}

const SUGGESTIONS = [
  {
    category: "Verified Match & Track",
    query: "Find me top organic honey under $20 and track order #1040.",
    badge: "SCREENSHOT MATCH",
    icon: Package,
  },
  {
    category: "Pantry Comparison",
    query: "Compare steel-cut oats and rolled oats",
    badge: "NUTRITION MATRIX",
    icon: Scale,
  },
  {
    category: "Healthy Essentials",
    query: "Find a healthy breakfast under $15",
    badge: "SMART BUNDLE",
    icon: Utensils,
  },
  {
    category: "Herbal & Sleep",
    query: "Which tea is good for sleep?",
    badge: "WELLNESS",
    icon: Coffee,
  },
];

export function EmptyChatPrompt({ onSelectPrompt }: EmptyChatPromptProps) {
  return (
    <div className="flex flex-col justify-center items-center py-6 px-3 sm:px-4 w-full">
      <div className="text-center max-w-md mx-auto mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 mb-3">
          <div className="w-full h-full bg-[#0d121f] rounded-[15px] flex items-center justify-center">
            <Bot className="w-6 h-6 text-cyan-300" />
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1">
          Aura AI Copilot v3.8
        </h3>
        <p className="text-xs text-slate-400">
          Ask to find products, compare pantry items, track shipments, or apply wholesale coupons.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 w-full max-w-md">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.query)}
              className="group text-left p-3 rounded-xl bg-[#131a29] border border-white/5 hover:border-cyan-500/40 hover:bg-[#182136] transition-all flex items-center justify-between cursor-pointer shadow-sm active:scale-98"
            >
              <div className="pr-3 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                  {item.query}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#1b2336] group-hover:bg-cyan-400 group-hover:text-black flex items-center justify-center text-slate-400 transition-colors flex-shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
