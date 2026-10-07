"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  X,
  MapPin,
  Plus,
  Home,
  Briefcase,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Truck,
} from "lucide-react";
import { UserAddress } from "@/lib/types";

export function AddressModal() {
  const {
    isAddressModalOpen,
    setIsAddressModalOpen,
    user,
    activeAddress,
    addAddress,
    setDefaultAddress,
    deleteAddress,
  } = useUser();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [label, setLabel] = useState<string>("Home");
  const [recipientName, setRecipientName] = useState(user?.name || "");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Kolkata");
  const [state, setState] = useState("West Bengal");
  const [zipCode, setZipCode] = useState("700156");
  const [isDefault, setIsDefault] = useState(true);

  if (!isAddressModalOpen) return null;

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !recipientName.trim()) {
      setError("Please fill out street, city, and recipient name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const addressData: Omit<UserAddress, "id" | "user_id"> = {
      label,
      recipient_name: recipientName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip_code: zipCode.trim(),
      country: "India",
      is_default: isDefault,
    };

    const res = await addAddress(addressData);
    setSubmitting(false);

    if (res.success) {
      setIsAddingNew(false);
      setStreet("");
    } else {
      setError(res.error || "Failed to add address.");
    }
  };

  const handleSetDefault = async (id: number) => {
    await setDefaultAddress(id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this delivery address?")) {
      await deleteAddress(id);
    }
  };

  const addresses = user?.addresses || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-900 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Saved Delivery Addresses</h3>
              <p className="text-xs text-slate-500">Manage 15-minute quick delivery destinations</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddressModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {!isAddingNew ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Your Saved Locations ({addresses.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500">No delivery address saved yet.</p>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                  >
                    + Add Address Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {addresses.map((addr) => {
                    const isDef = Boolean(addr.is_default);
                    return (
                      <div
                        key={addr.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isDef
                            ? "bg-emerald-50/70 border-emerald-500 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                              {addr.label === "Home" && <Home className="w-2.5 h-2.5" />}
                              {addr.label === "Work" && <Briefcase className="w-2.5 h-2.5" />}
                              <span>{addr.label}</span>
                            </span>
                            {isDef && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                            {addr.recipient_name} ({addr.phone})
                          </span>
                          <p className="text-slate-600 leading-snug">{addr.street}</p>
                          <p className="font-medium text-slate-500">
                            {addr.city}, {addr.state} - {addr.zip_code}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!isDef && (
                            <button
                              onClick={() => handleSetDefault(addr.id)}
                              className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(addr.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleAddNew} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Add New Delivery Location</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Type</label>
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setLabel(t)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        label === t
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Street / Apartment / House No.</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat 4B, Greenwood Park, Action Area 2"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="700156"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-xs text-slate-700">Make this my default delivery address</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{submitting ? "Saving Address…" : "Save Delivery Address"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
