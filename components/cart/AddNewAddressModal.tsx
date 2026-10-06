"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  CheckCircle2,
  Home,
  Briefcase,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { UserAddressRecord, AddressType } from "@/lib/types";

interface AddNewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressCreated: (newAddress: UserAddressRecord) => void;
  userId?: number;
}

export function AddNewAddressModal({
  isOpen,
  onClose,
  onAddressCreated,
  userId = 1,
}: AddNewAddressModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [pincode, setPincode] = useState("");
  const [type, setType] = useState<AddressType>("Home");
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. PIN code auto-fill handler
  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    setErrorMessage(null);

    if (cleaned.length === 6) {
      setIsLookingUpPin(true);
      try {
        const res = await fetch(`/api/addresses/pincode?pin=${cleaned}`);
        if (res.ok) {
          const data = await res.json();
          if (data.city) setCity(data.city);
          if (data.landmark && !landmark) setLandmark(data.landmark);
        }
      } catch (e) {
        // Fallback
      } finally {
        setIsLookingUpPin(false);
      }
    }
  };

  // 2. Geolocation Access (Real Browser Geolocation + Reverse Geocoding)
  const handleDetectCurrentLocation = () => {
    setErrorMessage(null);
    setLocationSuccessMsg(null);

    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            const detectedStreet = [
              addr.house_number,
              addr.road || addr.street,
              addr.suburb || addr.neighbourhood,
            ]
              .filter(Boolean)
              .join(", ");

            const detectedCity =
              addr.city || addr.town || addr.municipality || addr.state_district || "Bangalore";
            const detectedPincode = addr.postcode ? addr.postcode.replace(/\D/g, "").slice(0, 6) : "";
            const detectedLandmark = addr.amenity || addr.building || addr.suburb || "";

            if (detectedStreet) setStreetAddress(detectedStreet);
            if (detectedCity) setCity(detectedCity);
            if (detectedPincode) setPincode(detectedPincode);
            if (detectedLandmark && !landmark) setLandmark(detectedLandmark);

            setLocationSuccessMsg(`📍 Location detected: ${detectedCity} (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
          } else {
            setLocationSuccessMsg(`📍 Coordinates captured: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
          }
        } catch (err: any) {
          setLocationSuccessMsg("📍 GPS Coordinates detected. Please verify street details.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMessage("Location permission denied. Please enter address manually.");
        } else {
          setErrorMessage("Unable to retrieve location. Please fill manually.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // 3. Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter recipient name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter contact phone number.");
      return;
    }
    if (!streetAddress.trim()) {
      setErrorMessage("Please enter flat, house no., or street address.");
      return;
    }
    if (!city.trim()) {
      setErrorMessage("Please enter city.");
      return;
    }
    if (!pincode.trim() || pincode.length < 5) {
      setErrorMessage("Please enter a valid PIN code (e.g. 560103).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          address: {
            name: name.trim(),
            phone: phone.trim(),
            street_address: streetAddress.trim(),
            landmark: landmark.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            type,
            is_default: isDefault,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to save address.");
        setIsSubmitting(false);
        return;
      }

      onAddressCreated(data.address);
      onClose();
    } catch (err: any) {
      setErrorMessage("Network error while saving address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0e1422] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-white overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Add Delivery Address</h3>
            <p className="text-[11px] text-slate-400">
              Saved to your logistics profile in SQLite & synced with instant fulfillment
            </p>
          </div>
        </div>

        {/* GPS Location Quick-Fill Bar */}
        <div className="p-3 rounded-2xl bg-[#141b2c] border border-white/10 mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <div>
              <span className="text-xs font-bold text-white block">Hyperlocal GPS Detection</span>
              <span className="text-[10px] text-slate-400 block">Auto-fill street, city, and PIN code</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={isDetectingLocation}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {isDetectingLocation ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Current Location</span>
              </>
            )}
          </button>
        </div>

        {locationSuccessMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{locationSuccessMsg}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Maya Sterling"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#151f33] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-[#151f33] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Flat, House No., Building, Street *
            </label>
            <input
              type="text"
              placeholder="e.g. Penthouse 4B, 742 Evergreen Terrace"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
              className="w-full bg-[#151f33] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Pine Valley Tech Park / Opposite Metro Pillar"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full bg-[#151f33] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* PIN code & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">PIN Code *</label>
                {isLookingUpPin && (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span>Auto-filling...</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 560103"
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                required
                className="w-full bg-[#151f33] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">City *</label>
              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-[#151f33] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Address Type Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Address Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("Home")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === "Home"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10"
                    : "bg-[#141b2c] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => setType("Work")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === "Work"
                    ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/10"
                    : "bg-[#141b2c] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work</span>
              </button>

              <button
                type="button"
                onClick={() => setType("Other")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === "Other"
                    ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/10"
                    : "bg-[#141b2c] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <line x1="9" y1="22" x2="9" y2="22.01" />
                  <line x1="15" y1="22" x2="15" y2="22.01" />
                </svg>
                <span>Other</span>
              </button>
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultAddr"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-[#151f33] border-white/20 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isDefaultAddr" className="text-slate-300 cursor-pointer select-none">
              Make this my default delivery address
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Address</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
