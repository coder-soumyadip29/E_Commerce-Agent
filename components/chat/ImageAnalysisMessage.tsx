"use client";

import React from "react";
import { Product } from "@/lib/types";
import { ProductsMessage } from "./ProductsMessage";
import { Camera, Sparkles, Tag, Bot } from "lucide-react";

interface ImageAnalysisMessageProps {
  tags: string[];
  description: string;
  matchedProducts?: Product[];
  uploadedImage?: string;
  onOpenTrace?: (trace: any) => void;
}

export function ImageAnalysisMessage({
  tags,
  description,
  matchedProducts = [],
  uploadedImage,
  onOpenTrace,
}: ImageAnalysisMessageProps) {
  const isNonProduct = matchedProducts.length === 0;

  return (
    <div className="flex items-start gap-2.5 w-full max-w-4xl animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Camera className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 space-y-3">
        {/* Analysis Card */}
        <div className="bg-[#121827] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-md">
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            {uploadedImage && (
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#090d16] border border-white/10 flex-shrink-0 flex items-center justify-center p-1">
                <img
                  src={uploadedImage}
                  alt="Uploaded search item"
                  className="max-h-full max-w-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/honey.png";
                  }}
                />
                <span className="absolute bottom-1 right-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-300" /> Snap
                </span>
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Visual Intelligence Analysis
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {description}
              </p>

              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#182136] text-slate-300 border border-white/5"
                    >
                      <Tag className="w-3 h-3 text-cyan-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* If products matched */}
        {!isNonProduct && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block px-1">
              Top Matched Items in Store:
            </span>
            <ProductsMessage
              products={matchedProducts}
              onOpenTrace={onOpenTrace}
            />
          </div>
        )}
      </div>
    </div>
  );
}
