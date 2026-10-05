"use client";

import React from "react";
import { HelpCircle, ArrowRight, Bot } from "lucide-react";

interface ClarifyMessageProps {
  question: string;
  options: string[];
  onSelectOption: (option: string) => void;
}

export function ClarifyMessage({ question, options, onSelectOption }: ClarifyMessageProps) {
  return (
    <div className="flex items-start gap-2.5 w-full max-w-2xl animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <HelpCircle className="w-4 h-4 text-white" />
      </div>

      <div className="bg-[#121827] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-md text-slate-100 space-y-3 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-amber-300 leading-relaxed">
          {question}
        </p>

        {/* Interactive Option Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectOption(opt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-300 font-semibold text-xs bg-[#172033] hover:bg-[#1e2a44] hover:border-cyan-400 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <span>{opt}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
