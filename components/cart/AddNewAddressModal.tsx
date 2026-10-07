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
  const [city, setCity] = useState("Kolkata");
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
              addr.city || addr.town || addr.village || addr.county || "Kolkata";
            const detectedPin = addr.postcode || "";

            if (detectedStreet) setStreetAddress(detectedStreet);
            if (detectedCity) setCity(detectedCity);
            if (detectedPin && /^\d{6}$/.test(detectedPin)) setPincode(detectedPin);
            if (addr.neighbourhood || addr.suburb) setLandmark(addr.neighbourhood || addr.suburb);

            setLocationSuccessMsg(
              `📍 Location detected: ${detectedCity} (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`
            );
          } else {
            setErrorMessage("Could not resolve location address. Please enter details manually.");
          }
        } catch (err: any) {
          setErrorMessage("Failed to fetch address from coordinates.");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === 1) {
          setErrorMessage("Location access was denied. Please fill in your address manually.");
        } else {
          setErrorMessage("Unable to retrieve current location.");
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // 3. Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) return setErrorMessage("Full name is required.");
    if (!phone.trim() || phone.length < 10) return setErrorMessage("Enter a valid 10-digit phone number.");
    if (!streetAddress.trim()) return setErrorMessage("Street address is required.");
    if (!pincode.trim() || pincode.length !== 6) return setErrorMessage("Enter a valid 6-digit Indian PIN code.");
    if (!city.trim()) return setErrorMessage("City is required.");

    setIsSubmitting(true);

    try {
      const payload = {
        userId,
        address: {
          name: name.trim(),
          phone: phone.trim(),
          street_address: streetAddress.trim(),
          landmark: landmark.trim() || undefined,
          city: city.trim(),
          pincode: pincode.trim(),
          type,
          is_default: isDefault,
        },
      };

      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      setErrorMessage(err.message || "Network error while saving address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-900 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Add New Delivery Address</h3>
            <p className="text-xs text-slate-500">
              For 15-minute quick delivery
            </p>
          </div>
        </div>

        {/* GPS Location Quick-Fill Bar */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">GPS Detection</span>
              <span className="text-[11px] text-slate-500 block">Auto-fill street & PIN code</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={isDetectingLocation}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {isDetectingLocation ? "Locating..." : "📍 Use GPS"}
          </button>
        </div>

        {locationSuccessMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{locationSuccessMsg}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Recipient Name *</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Flat, House No., Building, Street *
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 3A, Tower 4, Greenwood Park"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Action Area 2 Metro Station"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-bold">PIN Code *</label>
                {isLookingUpPin && (
                  <span className="text-[10px] text-emerald-700">Auto-filling...</span>
                )}
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 700156"
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">City *</label>
              <input
                type="text"
                placeholder="Kolkata"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Address Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Home", "Work", "Other"] as AddressType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-1.5 px-3 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    type === t
                      ? "bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t === "Home" && <Home className="w-3.5 h-3.5" />}
                  {t === "Work" && <Briefcase className="w-3.5 h-3.5" />}
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="set_default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
            />
            <label htmlFor="set_default" className="text-slate-700 cursor-pointer">
              Set as default delivery address
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
