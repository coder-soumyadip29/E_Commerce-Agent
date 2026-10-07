"use client";

import React from "react";
import { SearchX, ArrowRight } from "lucide-react";

interface EmptyStateMessageProps {
  reason: string;
  suggestions?: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function EmptyStateMessage({
  reason,
  suggestions = [],
  onSelectSuggestion,
}: EmptyStateMessageProps) {
  return (
    <div className="flex items-start gap-2.5 w-full max-w-2xl animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5">
        <SearchX className="w-4 h-4" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-sm text-slate-900 space-y-3 flex-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Store Inventory Notice
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{reason}</p>
        </div>

        {suggestions.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Suggested products available in stock:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <span>{s}</span>
                  <ArrowRight className="w-3 h-3 text-emerald-700" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
