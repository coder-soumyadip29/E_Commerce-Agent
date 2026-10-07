"use client";

import React, { useState, useEffect } from "react";
import { X, Navigation, Clock, ShieldCheck, MapPin, Truck, Phone, CheckCircle2 } from "lucide-react";

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
  carrier = "CartWise FastFleet Rider",
  estimatedArrival = "Today by 3:45 PM",
}: SatelliteGpsModalProps) {
  const [pulseCoord, setPulseCoord] = useState({ lat: 22.5726, lng: 88.3639 });

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPulseCoord((prev) => ({
        lat: Number((prev.lat + (Math.random() - 0.49) * 0.0003).toFixed(4)),
        lng: Number((prev.lng + (Math.random() - 0.49) * 0.0003).toFixed(4)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-900">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Live Delivery Tracking</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                  ON TIME • 15 MINS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Order {orderId} • Delivered by {carrier}
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

        {/* Live Delivery Map Simulation */}
        <div className="relative h-64 sm:h-72 bg-emerald-50/40 flex items-center justify-center overflow-hidden border-b border-slate-200">
          {/* Subtle grid map pattern */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(#059669 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
              backgroundSize: "20px 20px, 40px 40px, 40px 40px",
            }}
          />

          {/* Delivery Route Path */}
          <div className="relative w-64 h-48 flex items-center justify-between">
            {/* Store Hub */}
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                CartWise Hub
              </span>
            </div>

            {/* Connecting dashed route */}
            <div className="flex-1 border-t-2 border-dashed border-emerald-500 mx-2 relative flex items-center justify-center">
              {/* Rider on the route */}
              <div className="absolute -top-5 flex flex-col items-center animate-bounce">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-emerald-900 bg-white px-1.5 py-0.2 rounded border border-emerald-300 mt-0.5">
                  Rider #412
                </span>
              </div>
            </div>

            {/* Customer Home */}
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                Your Address
              </span>
            </div>
          </div>

          {/* Delivery Time Badge */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 shadow-sm space-y-0.5">
            <div className="font-bold text-emerald-700">Estimated Delivery: 12 mins</div>
            <div className="text-[11px] text-slate-500">Speed: 24 km/h • Distance: 1.2 km</div>
          </div>

          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-right text-slate-700 shadow-sm">
            <div className="flex items-center gap-1.5 justify-end font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>LIVE GPS SYNC</span>
            </div>
            <div className="text-[10px] text-slate-400">Updated a few seconds ago</div>
          </div>
        </div>

        {/* Order Info & Delivery Partner Details */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Current Package
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{productName}</h4>
              <p className="text-xs text-slate-500">Order ID: {orderId}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Status
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900">Out for Delivery</span>
            </div>
          </div>

          {/* Rider contact bar */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                RM
              </div>
              <div>
                <div className="font-bold text-slate-900">Ramesh Kumar</div>
                <div className="text-[11px] text-slate-500">CartWise FastFleet Executive (★ 4.9)</div>
              </div>
            </div>

            <button
              onClick={() => alert("Connecting you to Ramesh Kumar (FastFleet Delivery Partner)...")}
              className="px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Rider</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Contactless Delivery Guarantee</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
