"use client";

import React from "react";
import { Product } from "@/lib/types";
import { ProductsMessage } from "./ProductsMessage";
import { Camera, Sparkles, Tag } from "lucide-react";

interface ImageAnalysisMessageProps {
  tags: string[];
  description: string;
  matchedProducts?: Product[];
  uploadedImage?: string;
  onOpenTrace?: (trace: any) => void;
  onSelectProduct?: (product: Product) => void;
}

export function ImageAnalysisMessage({
  tags,
  description,
  matchedProducts = [],
  uploadedImage,
  onOpenTrace,
  onSelectProduct,
}: ImageAnalysisMessageProps) {
  const isNonProduct = matchedProducts.length === 0;

  return (
    <div className="flex items-start gap-2.5 w-full max-w-4xl animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <Camera className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-3">
        {/* Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            {uploadedImage && (
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center p-1">
                <img
                  src={uploadedImage}
                  alt="Uploaded search item"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/honey.png";
                  }}
                />
                <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                  Photo Match
                </span>
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Visual Product Identification
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {description}
              </p>

              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <Tag className="w-3 h-3 text-emerald-600" />
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
            <span className="text-xs font-bold text-slate-700 block px-1">
              Top Matched Items in Store:
            </span>
            <ProductsMessage
              products={matchedProducts}
              onOpenTrace={onOpenTrace}
              onSelectProduct={onSelectProduct}
            />
          </div>
        )}
      </div>
    </div>
  );
}
