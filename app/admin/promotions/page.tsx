"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Megaphone,
  Check,
  Eye,
  Sliders,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function AdminPromotionsPage() {
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: "🔥 Spring Marketplace Mega Sale — Up to 40% OFF with code SPRING25!",
    badge: "Limited Time",
    link: "/category/electronics",
    color: "emerald",
  });

  const [heroCampaign, setHeroCampaign] = useState({
    title: "Next-Gen Electronics & Audio Gear",
    subtitle: "Explore high-fidelity headphones, smart home tech, and flagship gadgets from verified creators.",
    cta: "Shop The Collection",
    discountBadge: "Save 25% Today",
    active: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-600" />
            Promotions & Hero Banners
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure global announcements, hero spotlight campaigns, seasonal countdowns, and storefront promotional ribbons.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "Saved Successfully" : "Publish Banner Changes"}
        </button>
      </div>

      {/* Live Preview Ribbon */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Eye className="w-4 h-4" /> Live Announcement Preview
        </div>
        {announcement.enabled ? (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm font-medium shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="bg-white/20 text-white font-bold text-[11px] px-2 py-0.5 rounded-md uppercase">
                {announcement.badge}
              </span>
              <span>{announcement.text}</span>
            </div>
            <span className="underline cursor-pointer flex items-center gap-1 text-xs">
              Explore Now <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        ) : (
          <div className="bg-slate-100 text-slate-400 p-4 rounded-xl text-center text-xs font-medium">
            Announcement banner is currently disabled.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcement Ribbon Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              Storefront Top Ribbon
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={announcement.enabled}
                onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Title</label>
            <input
              type="text"
              value={announcement.badge}
              onChange={(e) => setAnnouncement({ ...announcement, badge: e.target.value })}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Copy</label>
            <textarea
              rows={2}
              value={announcement.text}
              onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination URL</label>
            <input
              type="text"
              value={announcement.link}
              onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
            />
          </div>
        </div>

        {/* Hero Spotlight Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Layers className="w-5 h-5 text-indigo-600" />
              Homepage Hero Spotlight
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
            <input
              type="text"
              value={heroCampaign.title}
              onChange={(e) => setHeroCampaign({ ...heroCampaign, title: e.target.value })}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle</label>
            <textarea
              rows={2}
              value={heroCampaign.subtitle}
              onChange={(e) => setHeroCampaign({ ...heroCampaign, subtitle: e.target.value })}
              className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tag</label>
              <input
                type="text"
                value={heroCampaign.discountBadge}
                onChange={(e) => setHeroCampaign({ ...heroCampaign, discountBadge: e.target.value })}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Call to Action</label>
              <input
                type="text"
                value={heroCampaign.cta}
                onChange={(e) => setHeroCampaign({ ...heroCampaign, cta: e.target.value })}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
