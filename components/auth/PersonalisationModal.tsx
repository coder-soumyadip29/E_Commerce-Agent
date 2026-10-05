"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  X,
  Sparkles,
  Sliders,
  CheckCircle2,
  DollarSign,
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
    "Halal Certified",
  ];

  const healthGoalsOptions = [
    "Immunity & Longevity",
    "Clean Eating",
    "Sustained Energy",
    "Gut Health & Digestion",
    "Cardio & Heart Health",
    "Athletic Recovery",
  ];

  const [dietaryTags, setDietaryTags] = useState<string[]>(
    user?.preferences?.dietary_tags || ["Certified Organic", "Clean Eating"]
  );
  const [healthGoals, setHealthGoals] = useState<string[]>(
    user?.preferences?.health_goals || ["Immunity & Longevity", "Clean Eating"]
  );
  const [budget, setBudget] = useState<number>(user?.preferences?.max_spend_budget || 300);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0e1422] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-white overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0d121f] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">AI Personalisation & Diet</h3>
              <p className="text-[10px] text-slate-400">Customise what CartWise Copilot recommends and prioritises</p>
            </div>
          </div>

          <button
            onClick={() => setIsPersonalisationModalOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* 1. Dietary Standards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dietary Tags & Dietary Regimens</span>
              </label>
              <span className="text-[10px] text-slate-400">{dietaryTags.length} selected</span>
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
                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-400/50 shadow-sm shadow-emerald-500/10"
                        : "bg-[#141b2a] text-slate-400 border border-white/5 hover:text-white hover:border-white/15"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Health & Wellness Goals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Health & Wellness Goals</span>
              </label>
              <span className="text-[10px] text-slate-400">{healthGoals.length} selected</span>
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
                        ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-400/50 shadow-sm shadow-purple-500/10"
                        : "bg-[#141b2a] text-slate-400 border border-white/5 hover:text-white hover:border-white/15"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Copilot Tone */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Copilot Reasoning Style</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: "wholesale-deal-finder", label: "Wholesale Deal Hunter", desc: "Maximizes promo & arbitrage" },
                { id: "concise", label: "Fast & Concise", desc: "Brief, high-speed recommendations" },
                { id: "detailed", label: "Nutritionist Deep-Dive", desc: "Detailed ingredient breakdowns" },
              ].map((style) => (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => setCopilotTone(style.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    copilotTone === style.id
                      ? "bg-[#172238] border-cyan-400/50 text-white shadow-sm"
                      : "bg-[#111726] border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{style.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Weekly Spend Target */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Weekly Grocery Budget</span>
              </label>
              <span className="font-extrabold text-sm text-emerald-400">${budget}</span>
            </div>
            <input
              type="range"
              min="50"
              max="750"
              step="25"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-[#151c2e] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>$50/wk</span>
              <span>$350/wk</span>
              <span>$750/wk</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Preferences Synced!</span>
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" />
                  <span>{saving ? "Syncing with AI Engine…" : "Save Personalisation"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
