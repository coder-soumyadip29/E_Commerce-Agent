"use client";

import React, { useState, useEffect } from "react";
import { X, Radio, Satellite, Navigation, Clock, ShieldCheck, MapPin, Truck } from "lucide-react";

interface SatelliteGpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | number;
  productName?: string;
  carrier?: string;
  estimatedArrival?: string;
}

export function SatelliteGpsModal({
  isOpen,
  onClose,
  orderId = "#1040",
  productName = "Organic Japanese Sencha Green Tea",
  carrier = "CartWise FastFleet",
  estimatedArrival = "Today by 3:45 PM",
}: SatelliteGpsModalProps) {
  const [pulseCoord, setPulseCoord] = useState({ lat: 37.7749, lng: -122.4194 });
  const [satelliteId] = useState("STARLINK-4091B");

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPulseCoord((prev) => ({
        lat: Number((prev.lat + (Math.random() - 0.49) * 0.0005).toFixed(4)),
        lng: Number((prev.lng + (Math.random() - 0.49) * 0.0005).toFixed(4)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f1422] border border-cyan-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-cyan-500/10 flex flex-col text-slate-100">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#131b2d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Satellite className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">Live Satellite GPS Telemetry</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  SIGNAL LOCK: 99.4%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tracking Order {orderId} • Synced via {satelliteId}
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

        {/* Holographic Satellite Map Simulation */}
        <div className="relative h-64 sm:h-72 bg-[#090d16] flex items-center justify-center overflow-hidden border-b border-white/10">
          {/* Radar scan grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(#00f2fe 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
              backgroundSize: "20px 20px, 40px 40px, 40px 40px",
            }}
          />

          {/* Sweeping Radar Circle */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-cyan-500/30 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-cyan-500/20 flex items-center justify-center" />
            <div className="absolute inset-0 rounded-full border-t border-cyan-400/60 animate-spin" style={{ animationDuration: "4s" }} />

            {/* Courier marker */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-emerald-400/30 animate-ping" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/50">
                  <Truck className="w-4 h-4 text-black" />
                </div>
              </div>
              <div className="mt-1.5 px-2 py-0.5 rounded-md bg-[#0d1220]/90 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 shadow">
                FastFleet Courier #412
              </div>
            </div>

            {/* Destination Marker */}
            <div className="absolute top-6 right-8 flex items-center gap-1 text-[10px] text-cyan-300 font-semibold bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Your Address (1.4 km)</span>
            </div>
          </div>

          {/* Telemetry HUD badges */}
          <div className="absolute bottom-3 left-3 bg-[#0d1322]/80 backdrop-blur border border-white/10 px-2.5 py-1.5 rounded-xl text-[11px] font-mono text-cyan-300 space-y-0.5">
            <div>LAT: {pulseCoord.lat}° N</div>
            <div>LNG: {pulseCoord.lng}° W</div>
            <div className="text-slate-400">SPEED: 28 km/h • HDOP: 0.8</div>
          </div>

          <div className="absolute top-3 right-3 bg-[#0d1322]/80 backdrop-blur border border-white/10 px-2.5 py-1.5 rounded-xl text-[11px] text-right font-mono text-emerald-400">
            <div className="flex items-center gap-1 justify-end font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE BEACON</span>
            </div>
            <div className="text-slate-400">UPDATED: 2s ago</div>
          </div>
        </div>

        {/* Dispatch Info Details */}
        <div className="p-4 sm:p-5 space-y-4 bg-[#0d1322]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#141b2e] border border-white/5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Carrier</span>
              <span className="font-semibold text-xs text-white truncate block">{carrier}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141b2e] border border-white/5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Status</span>
              <span className="font-bold text-xs text-emerald-400 block">Out for Delivery</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141b2e] border border-white/5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">ETA</span>
              <span className="font-bold text-xs text-cyan-300 block">{estimatedArrival}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141b2e] border border-white/5">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Security</span>
              <span className="font-bold text-xs text-purple-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                <span>Protected</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Cargo: <strong className="text-slate-200">{productName}</strong></span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Close Telemetry Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
