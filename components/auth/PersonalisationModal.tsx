"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  X,
  Sliders,
  CheckCircle2,
  Heart,
  Bot,
  Zap,
} from "lucide-react";

export function PersonalisationModal() {
  const { isPersonalisationModalOpen, setIsPersonalisationModalOpen, user, updatePreferences } = useUser();

  const dietaryOptions = [
    "Certified Organic",
    "Raw & Cold-Pressed",
    "Gluten-Free",
    "Zero Preservatives",
    "100% Vegan",
    "Keto / Low-Carb",
    "Dairy-Free",
    "Non-GMO",
    "High-Protein",
    "Fresh Farm Harvest",
  ];

  const healthGoalsOptions = [
    "Immunity & Wellness",
    "Clean Eating",
    "Sustained Energy",
    "Gut Health & Digestion",
    "Heart Health",
    "Daily Nutrition",
  ];

  const [dietaryTags, setDietaryTags] = useState<string[]>(
    user?.preferences?.dietary_tags || ["Certified Organic", "Clean Eating"]
  );
  const [healthGoals, setHealthGoals] = useState<string[]>(
    user?.preferences?.health_goals || ["Immunity & Wellness", "Clean Eating"]
  );
  const [budget, setBudget] = useState<number>(user?.preferences?.max_spend_budget || 2500);
  const [copilotTone, setCopilotTone] = useState<"wholesale-deal-finder" | "concise" | "detailed">(
    user?.preferences?.copilot_tone || "wholesale-deal-finder"
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isPersonalisationModalOpen) return null;

  const toggleDietary = (item: string) => {
    if (dietaryTags.includes(item)) {
      setDietaryTags(dietaryTags.filter((t) => t !== item));
    } else {
      setDietaryTags([...dietaryTags, item]);
    }
  };

  const toggleGoal = (item: string) => {
    if (healthGoals.includes(item)) {
      setHealthGoals(healthGoals.filter((g) => g !== item));
    } else {
      setHealthGoals([...healthGoals, item]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await updatePreferences({
      dietary_tags: dietaryTags,
      health_goals: healthGoals,
      max_spend_budget: budget,
      copilot_tone: copilotTone,
    });

    setSaving(false);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsPersonalisationModalOpen(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-900 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Dietary & Shopping Preferences</h3>
              <p className="text-xs text-slate-500">Personalize recommendations tailored for you</p>
            </div>
          </div>

          <button
            onClick={() => setIsPersonalisationModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* 1. Dietary Standards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dietary Regimens & Preferences</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">{dietaryTags.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dietaryOptions.map((tag) => {
                const isSelected = dietaryTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleDietary(tag)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-400 shadow-xs"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Health & Wellness Goals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Health & Lifestyle Goals</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">{healthGoals.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {healthGoalsOptions.map((goal) => {
                const isSelected = healthGoals.includes(goal);
                return (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-teal-50 text-teal-800 border border-teal-400 shadow-xs"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Assistant Recommendation Style */}
          <div>
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Assistant Recommendation Focus</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: "wholesale-deal-finder", label: "Best Value Deals", desc: "Maximizes savings & discounts" },
                { id: "concise", label: "Fast & Concise", desc: "Quick top-3 choices" },
                { id: "detailed", label: "Nutritionist Mode", desc: "Deep ingredients review" },
              ].map((style) => (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => setCopilotTone(style.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    copilotTone === style.id
                      ? "bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-xs font-bold leading-tight text-slate-900">{style.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Weekly Spend Target */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>Target Weekly Grocery Budget</span>
              </label>
              <span className="font-extrabold text-sm text-slate-900">₹{budget}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="250"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
              <span>₹500/wk</span>
              <span>₹5,000/wk</span>
              <span>₹10,000/wk</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" />
                  <span>{saving ? "Saving…" : "Save Preferences"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
