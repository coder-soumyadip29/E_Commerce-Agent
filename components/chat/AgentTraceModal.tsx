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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Live Query & Database Verification
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic catalog execution grounded in SQLite store records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Query & Intent */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              User Search Intent
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-900">
              &ldquo;{trace.query || "Query processed"}&rdquo;
            </p>
            {trace.parsed_intent && (
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Parsed Target:</span> {trace.parsed_intent}
              </p>
            )}
          </div>

          {/* Applied Filters */}
          {trace.filters && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Active Catalog Filters
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Keyword</span>
                  <span className="font-bold text-slate-900">{trace.filters.keyword || "Any"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Organic Only</span>
                  <span className="font-bold text-emerald-700">
                    {trace.filters.is_organic !== undefined ? (trace.filters.is_organic ? "Yes" : "No") : "Any"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Max Price</span>
                  <span className="font-bold text-slate-900">
                    {trace.filters.max_price ? `₹${trace.filters.max_price}` : "No limit"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Min Rating</span>
                  <span className="font-bold text-amber-700">
                    {trace.filters.min_rating ? `${trace.filters.min_rating}★` : "Any"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SQL Verification Box */}
          {trace.sql_query && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                Verified SQLite Query Execution
              </span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                <code>{trace.sql_query}</code>
              </div>
            </div>
          )}

          {/* Execution Pipeline Steps */}
          {trace.steps && trace.steps.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Verification Steps
              </span>
              <div className="space-y-2">
                {trace.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-slate-900">{step.title}</span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.2 rounded">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SQLite Grounded • Zero Hallucination Guarantee</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
