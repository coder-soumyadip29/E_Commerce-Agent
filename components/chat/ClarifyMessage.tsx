"use client";

import React from "react";
import { HelpCircle, ArrowRight } from "lucide-react";

interface ClarifyMessageProps {
  question: string;
  options: string[];
  onSelectOption: (option: string) => void;
}

export function ClarifyMessage({ question, options, onSelectOption }: ClarifyMessageProps) {
  return (
    <div className="flex items-start gap-2.5 w-full max-w-2xl animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs font-bold">
        <HelpCircle className="w-4 h-4" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-sm text-slate-900 space-y-3 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
          {question}
        </p>

        {/* Interactive Option Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectOption(opt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-800 font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>{opt}</span>
              <ArrowRight className="w-3 h-3 text-emerald-700" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
