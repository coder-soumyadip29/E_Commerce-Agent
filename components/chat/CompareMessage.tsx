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
      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs font-bold">
        <Scale className="w-4 h-4" />
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-sm overflow-hidden text-slate-900">
        {/* Header */}
        <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Product Comparison Matrix
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
            {products.length} Products Compared
          </span>
        </div>

        {/* Responsive Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[480px]">
            <thead>
              <tr>
                <th className="p-2.5 w-1/3 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 rounded-tl-lg">
                  Key Metrics
                </th>
                {products.map((product) => {
                  const isAdded = Boolean(addedIds[product.id]);
                  return (
                    <th key={product.id} className="p-2.5 align-top bg-slate-50/70 border-l border-slate-100">
                      <div className="space-y-1.5">
                        <div className="w-full h-20 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1 border border-slate-200">
                          <img
                            src={product.image_url || "/images/honey.png"}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/honey.png";
                            }}
                          />
                        </div>

                        <span className="font-bold text-xs text-slate-900 block truncate">
                          {product.name}
                        </span>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            ★ {product.average_rating || 4.8}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAdd(product)}
                          className="w-full py-1 px-2 rounded-md text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
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
            <tbody className="divide-y divide-slate-100 text-xs">
              {pointKeys.map((key) => {
                const values = comparisonPoints[key] || [];
                return (
                  <tr key={key} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-semibold text-slate-600 capitalize bg-slate-50/40">
                      {key.replace(/_/g, " ")}
                    </td>
                    {values.map((val, i) => (
                      <td key={i} className="p-2.5 text-slate-800 border-l border-slate-100">
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
