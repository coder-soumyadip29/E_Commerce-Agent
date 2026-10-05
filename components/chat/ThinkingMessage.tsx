"use client";

import React from "react";
import { Bot, Sparkles } from "lucide-react";

interface ThinkingMessageProps {
  label?: string;
}

export function ThinkingMessage({ label = "Searching organic catalog…" }: ThinkingMessageProps) {
  return (
    <div className="flex items-start gap-2.5 w-full max-w-xl animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
      </div>

      <div className="bg-[#121827] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-md flex-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            Aura Copilot Processing
          </span>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-slate-100 mb-2.5">
          {label}
        </p>

        {/* Pulsing indicator dots */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Syncing with SQLite store catalog
          </span>
        </div>
      </div>
    </div>
  );
}
