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
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [zipCode, setZipCode] = useState("94103");
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
      country: "United States",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0e1422] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-white overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Delivery Addresses</h3>
              <p className="text-[10px] text-slate-400">Manage where CartWise FastFleet delivers your fresh orders</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAddressModalOpen(false);
              setIsAddingNew(false);
            }}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isAddingNew ? (
            <>
              {/* Existing Address List */}
              <div className="space-y-2.5">
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No addresses on file. Add your first delivery destination below.
                  </div>
                ) : (
                  addresses.map((addr) => {
                    const isSelected = activeAddress?.id === addr.id;
                    const IconComponent = addr.label.toLowerCase().includes("work") ? Briefcase : Home;

                    return (
                      <div
                        key={addr.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isSelected
                            ? "bg-[#141d30] border-cyan-400/50 shadow-lg shadow-cyan-500/10"
                            : "bg-[#111726] border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`p-2 rounded-xl mt-0.5 ${
                                isSelected ? "bg-cyan-500/20 text-cyan-300" : "bg-[#161f33] text-slate-400"
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white">{addr.label}</span>
                                {addr.is_default && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-200">{addr.recipient_name}</p>
                              <p className="text-xs text-slate-300">{addr.street}</p>
                              <p className="text-[11px] text-slate-400">
                                {addr.city}, {addr.state} {addr.zip_code} • {addr.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {!addr.is_default && (
                              <button
                                onClick={() => handleSetDefault(addr.id)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-300 hover:text-white bg-[#1a233a] hover:bg-[#202c48] border border-white/10 cursor-pointer"
                              >
                                Set Default
                              </button>
                            )}
                            {addresses.length > 1 && (
                              <button
                                onClick={() => handleDelete(addr.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete Address"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add New Address Button */}
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2.5 rounded-2xl font-bold text-xs text-cyan-300 bg-[#131b2d] hover:bg-[#18233a] border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Delivery Address</span>
              </button>
            </>
          ) : (
            /* Add New Address Form */
            <form onSubmit={handleAddNew} className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
                  Add New Delivery Location
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Tag Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Home", "Work", "Other"].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setLabel(t)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        label === t
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
                          : "bg-[#141b2a] text-slate-400 border-white/5 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
              </div>

              {/* Street */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Street Address & Apartment / Suite
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 500 Howard St, Apt 22A"
                  className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Zip"
                    className="w-full bg-[#151c2e] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-white/20 bg-[#151c2e] text-indigo-500 focus:ring-0"
                />
                <span>Set as default shipping address</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? "Saving Address…" : "Save Delivery Address"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>FastFleet automated dispatch enabled</span>
          </div>
          <span>Satellite GPS synced</span>
        </div>
      </div>
    </div>
  );
}
