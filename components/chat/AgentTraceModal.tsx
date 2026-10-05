"use client";

import React from "react";
import { AgentTrace } from "@/lib/types";
import { X, Sparkles, Database, CheckCircle, ShieldCheck, Terminal } from "lucide-react";

interface AgentTraceModalProps {
  trace: AgentTrace | null;
  onClose: () => void;
}

export function AgentTraceModal({ trace, onClose }: AgentTraceModalProps) {
  if (!trace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f1422] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#131b2d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Agent Trace & SQL Verification
              </h3>
              <p className="text-xs text-slate-400">
                Full deterministic execution trail grounded in SQLite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Query & Intent */}
          <div className="p-4 rounded-xl bg-[#141b2a] border border-white/5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Input Query & Parsed Intent
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white">
              &ldquo;{trace.query || "Query processed"}&rdquo;
            </p>
            {trace.parsed_intent && (
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-indigo-400">Intent:</span> {trace.parsed_intent}
              </p>
            )}
          </div>

          {/* Applied Filters */}
          {trace.filters && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Active Filter Parameters
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#141b2a] border border-white/5">
                  <span className="text-slate-400 block text-[10px]">Keyword</span>
                  <span className="font-bold text-cyan-300">{trace.filters.keyword || "Any"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141b2a] border border-white/5">
                  <span className="text-slate-400 block text-[10px]">Organic Only</span>
                  <span className="font-bold text-emerald-400">
                    {trace.filters.is_organic !== undefined ? (trace.filters.is_organic ? "Yes" : "No") : "Any"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141b2a] border border-white/5">
                  <span className="text-slate-400 block text-[10px]">Max Price</span>
                  <span className="font-bold text-purple-300">
                    {trace.filters.max_price ? `$${trace.filters.max_price}` : "No limit"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#141b2a] border border-white/5">
                  <span className="text-slate-400 block text-[10px]">Min Rating</span>
                  <span className="font-bold text-amber-300">
                    {trace.filters.min_rating ? `${trace.filters.min_rating}★` : "Any"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SQL Verification Box */}
          {trace.sql_query && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Verified SQLite Query (Zero Hallucination)
              </span>
              <div className="p-3 rounded-xl bg-[#090d16] border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto">
                <code>{trace.sql_query}</code>
              </div>
            </div>
          )}

          {/* Trace Steps */}
          {trace.steps && trace.steps.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Execution Steps
              </span>
              <div className="space-y-2">
                {trace.steps.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#141b2a] border border-white/5 flex items-start gap-2.5"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white">{s.title}</h4>
                      <p className="text-[11px] text-slate-400">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
