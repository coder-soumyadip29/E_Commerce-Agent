"use client";

import React from "react";
import { Bot, Sparkles } from "lucide-react";

interface ThinkingMessageProps {
  label?: string;
}

export function ThinkingMessage({ label = "Searching organic store catalog…" }: ThinkingMessageProps) {
  return (
    <div className="flex items-start gap-2.5 w-full max-w-xl animate-fade-in">
      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Bot className="w-4 h-4 text-white" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-xs flex-1">
        <div className="flex items-center gap-1.5 mb-1 text-emerald-700 font-bold text-[11px] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
          <span>CartWise Assistant</span>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">
          {label}
        </p>

        {/* Pulsing indicator dots */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Fetching realtime inventory & deals
          </span>
        </div>
      </div>
    </div>
  );
}
