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
      <div className="w-7 h-7 rounded-lg bg-[#1a2337] border border-white/10 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
        <SearchX className="w-4 h-4 text-slate-400" />
      </div>

      <div className="bg-[#121827] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-md text-slate-100 space-y-3 flex-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Catalog Lookup Notice
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{reason}</p>
        </div>

        {suggestions.length > 0 && (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Suggested products available in store:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-cyan-300 hover:border-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span>{s}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
