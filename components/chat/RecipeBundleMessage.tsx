"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Utensils,
  Sparkles,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  Clock,
  Flame,
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  Leaf,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { RecipeIngredient, AgentTrace } from "@/lib/types";
import { useCart } from "@/context/CartContext";

interface RecipeBundleMessageProps {
  recipeName: string;
  dishType?: string;
  servings: number;
  prepTime?: string;
  caloriesPerServing?: number;
  nutrition?: {
    protein: string;
    carbs: string;
    fats: string;
    fiber?: string;
  };
  dietaryTags?: string[];
  instructions?: string[];
  ingredients: RecipeIngredient[];
  totalBundlePrice: number;
  originalBundlePrice?: number;
  bundleDiscountPercent?: number;
  text?: string;
  trace?: AgentTrace;
  onOpenTrace?: (trace: AgentTrace) => void;
}

export function RecipeBundleMessage({
  recipeName,
  dishType = "Healthy Meal",
  servings: initialServings,
  prepTime = "15 mins",
  caloriesPerServing = 380,
  nutrition,
  dietaryTags = ["100% Organic", "High-Protein"],
  instructions = [],
  ingredients,
  bundleDiscountPercent = 10,
  text,
  trace,
  onOpenTrace,
}: RecipeBundleMessageProps) {
  const { addToCart, setIsCartOpen } = useCart();

  // State to track which ingredients the user wants (e.g., if they already have honey or oil in pantry)
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    ingredients.forEach((ing) => {
      init[ing.product.id] = true;
    });
    return init;
  });

  // State to track customized quantities for each ingredient
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    ingredients.forEach((ing) => {
      init[ing.product.id] = ing.requiredQty || 1;
    });
    return init;
  });

  const [showInstructions, setShowInstructions] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Toggle selection for an ingredient
  const toggleIngredient = (productId: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Adjust quantity
  const updateQty = (productId: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  // Calculate live dynamic bundle pricing
  const activeIngredients = ingredients.filter((ing) => selectedItems[ing.product.id]);
  const rawSubtotal = activeIngredients.reduce((sum, ing) => {
    const qty = quantities[ing.product.id] || 1;
    return sum + (Number(ing.product.price) || 0) * qty;
  }, 0);

  const discountRate = bundleDiscountPercent > 0 ? bundleDiscountPercent / 100 : 0.1;
  const bundleSavings = Math.round(rawSubtotal * discountRate);
  const finalPayable = Math.max(0, rawSubtotal - bundleSavings);

  // Handle deterministic bulk cart addition
  const handleAddBundleToCart = async () => {
    if (activeIngredients.length === 0) return;
    setIsAddingAll(true);

    try {
      for (const ing of activeIngredients) {
        const qty = quantities[ing.product.id] || 1;
        await addToCart(ing.product, qty);
      }
      setAddedSuccess(true);
      setTimeout(() => {
        setIsCartOpen(true);
      }, 400);
      setTimeout(() => {
        setAddedSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed adding recipe bundle to cart", err);
    } finally {
      setIsAddingAll(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-slate-100 shadow-xl backdrop-blur-md relative overflow-hidden transition-all my-2">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-wide uppercase">
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            Chef AI • Recipe Bundler
          </span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            {dishType}
          </span>
        </div>

        {trace && onOpenTrace && (
          <button
            onClick={() => onOpenTrace(trace)}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/60 hover:bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-500/30 cursor-pointer"
          >
            <Search className="w-3 h-3" />
            <span>Trace SQL</span>
          </button>
        )}
      </div>

      {/* Introductory Text if present */}
      {text && (
        <p className="text-xs text-slate-300 mb-3 leading-relaxed font-normal">
          {text}
        </p>
      )}

      {/* Recipe Title & Macros Showcase */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 mb-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{recipeName}</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <Leaf className="w-2.5 h-2.5" /> 100% In-Stock
            </span>
          </h3>
          <span className="text-xs text-amber-300/90 font-medium">
            Yield: {initialServings} {initialServings === 1 ? "Serving" : "Servings"}
          </span>
        </div>

        {/* Quick Nutritional Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Prep Time</span>
            </div>
            <div className="text-xs font-bold text-white">{prepTime}</div>
          </div>

          <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Flame className="w-3 h-3 text-red-400" />
              <span>Calories</span>
            </div>
            <div className="text-xs font-bold text-white">{caloriesPerServing} kcal</div>
          </div>

          {nutrition?.protein && (
            <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/80">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Protein</span>
              </div>
              <div className="text-xs font-bold text-emerald-300">{nutrition.protein}</div>
            </div>
          )}

          {nutrition?.carbs && (
            <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/80">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Carbs</span>
              </div>
              <div className="text-xs font-bold text-amber-300">{nutrition.carbs}</div>
            </div>
          )}
        </div>

        {/* Dietary Badges */}
        {dietaryTags && dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-slate-800/80">
            {dietaryTags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Pantry Ingredient Picker */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Pantry Checklist ({activeIngredients.length}/{ingredients.length} Selected)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Uncheck what you already have
          </span>
        </div>

        <div className="space-y-2">
          {ingredients.map((ing) => {
            const isSelected = !!selectedItems[ing.product.id];
            const qty = quantities[ing.product.id] || 1;
            const linePrice = (Number(ing.product.price) || 0) * qty;

            return (
              <div
                key={ing.product.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-slate-950/80 border-amber-500/40 shadow-xs"
                    : "bg-slate-950/40 border-slate-800 opacity-60"
                }`}
              >
                {/* Custom Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleIngredient(ing.product.id)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? "bg-amber-500 border-amber-400 text-slate-950"
                      : "border-slate-700 bg-slate-900 hover:border-slate-500 text-transparent"
                  }`}
                  aria-label={isSelected ? "Deselect item" : "Select item"}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {/* Product Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/60 flex-shrink-0">
                  <Image
                    src={ing.product.image || ing.product.image_url || "/images/placeholder.jpg"}
                    alt={ing.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">
                      {ing.product.name}
                    </p>
                    {ing.product.is_organic && (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30 flex-shrink-0">
                        Organic
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-amber-300/80 font-medium truncate mt-0.5">
                    {ing.unit} • {ing.purpose}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    ₹{ing.product.price} each
                  </div>
                </div>

                {/* Quantity Stepper & Price */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-md p-0.5">
                    <button
                      type="button"
                      disabled={!isSelected || qty <= 1}
                      onClick={() => updateQty(ing.product.id, -1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-mono font-bold w-4 text-center text-white">
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={!isSelected || qty >= 10}
                      onClick={() => updateQty(ing.product.id, 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="text-xs font-bold text-amber-400 font-mono">
                    ₹{linePrice.toFixed(0)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Cooking Guide (Collapsible) */}
      {instructions && instructions.length > 0 && (
        <div className="mb-4 bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Step-by-Step Preparation Guide ({instructions.length} Steps)</span>
            </div>
            {showInstructions ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showInstructions && (
            <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2 mt-2">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bundle Checkout Footer */}
      <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Bundle Total:</span>
            {bundleSavings > 0 && (
              <span className="text-xs line-through text-slate-500 font-mono">
                ₹{rawSubtotal.toFixed(0)}
              </span>
            )}
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
              ₹{finalPayable.toFixed(0)}
            </span>
          </div>

          {bundleSavings > 0 && (
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Includes {bundleDiscountPercent}% Recipe Bundle Savings (Save ₹{bundleSavings})
            </p>
          )}
        </div>

        {/* 1-Click Bundle Add to Cart Button */}
        <button
          type="button"
          disabled={activeIngredients.length === 0 || isAddingAll}
          onClick={handleAddBundleToCart}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg active:scale-98 ${
            addedSuccess
              ? "bg-emerald-600 text-white"
              : activeIngredients.length === 0
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-amber-300 hover:shadow-amber-500/25"
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Added to Cart!</span>
            </>
          ) : isAddingAll ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Bundling Ingredients...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Bundle {activeIngredients.length} Items to Cart (₹{finalPayable.toFixed(0)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
