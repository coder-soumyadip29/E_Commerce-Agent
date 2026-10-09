"use client";

import React from "react";
import { Sparkles, ArrowRight, Bot, Scale, Coffee, Utensils, Zap, Package } from "lucide-react";

interface EmptyChatPromptProps {
  onSelectPrompt: (query: string) => void;
}

const SUGGESTIONS = [
  {
    category: "Quick Find & Order Status",
    query: "Find me top organic honey under ₹500 and track order #1040.",
    badge: "POPULAR",
    icon: Package,
  },
  {
    category: "Nutrition Comparison",
    query: "Compare steel-cut oats and rolled oats",
    badge: "PANTRY",
    icon: Scale,
  },
  {
    category: "AI Chef Recipe Bundler",
    query: "Recipe for high-protein superfood oats breakfast bowl with ingredients",
    badge: "CHEF AI",
    icon: Utensils,
  },
  {
    category: "Herbal & Wellness",
    query: "Which tea is good for sleep?",
    badge: "WELLNESS",
    icon: Coffee,
  },
];

export function EmptyChatPrompt({ onSelectPrompt }: EmptyChatPromptProps) {
  return (
    <div className="flex flex-col justify-center items-center py-6 px-3 sm:px-4 w-full">
      <div className="text-center max-w-md mx-auto mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mb-3 shadow-xs">
          <Bot className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1">
          CartWise AI Grocery Assistant
        </h3>
        <p className="text-xs text-slate-500">
          Search 105 farm-fresh groceries, compare nutritional details, track deliveries, or apply discount vouchers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 w-full max-w-md">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.query)}
              className="group text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer active:scale-98"
            >
              <div className="pr-3 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {item.category}
                  </span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                  {item.query}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors flex-shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
