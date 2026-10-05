"use client";

import React, { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check, Scale } from "lucide-react";

interface CompareMessageProps {
  products: Product[];
  comparisonPoints: Record<string, string[]>;
}

export function CompareMessage({ products, comparisonPoints }: CompareMessageProps) {
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  const handleAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const pointKeys = Object.keys(comparisonPoints);

  return (
    <div className="flex items-start gap-2.5 w-full animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Scale className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 bg-[#121827] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 sm:p-5 shadow-md overflow-hidden text-slate-100">
        {/* Header */}
        <div className="pb-3 mb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Product Comparison Matrix
            </h3>
          </div>
          <span className="text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20">
            {products.length} Products
          </span>
        </div>

        {/* Responsive Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr>
                <th className="p-2.5 w-1/4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0d1320] rounded-tl-xl">
                  Attributes
                </th>
                {products.map((product) => {
                  const isAdded = Boolean(addedIds[product.id]);
                  return (
                    <th key={product.id} className="p-2.5 align-top bg-[#151c2e]/60">
                      <div className="space-y-1.5">
                        <div className="w-full h-24 rounded-lg bg-[#0a0e17] overflow-hidden flex items-center justify-center p-1 border border-white/5">
                          <img
                            src={product.image_url || "/images/honey.png"}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/honey.png";
                            }}
                          />
                        </div>

                        <span className="font-bold text-xs text-white block truncate">
                          {product.name}
                        </span>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-amber-300">
                            ★ {product.average_rating || 4.5}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAdd(product)}
                          className="w-full py-1 px-2 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-300" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3 h-3" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {pointKeys.map((key) => (
                <tr key={key} className="hover:bg-white/5 transition-colors">
                  <td className="p-2.5 font-bold text-slate-400 bg-[#0d1320] text-[11px]">
                    {key}
                  </td>
                  {products.map((_, pIdx) => {
                    const value = comparisonPoints[key]?.[pIdx] || "—";
                    return (
                      <td key={pIdx} className="p-2.5 text-slate-200">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
