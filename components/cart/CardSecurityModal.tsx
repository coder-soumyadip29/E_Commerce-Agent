"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CardSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  last4: string;
  bankName: string;
  onVerificationSuccess: (receipt: any) => void;
}

export function CardSecurityModal({
  isOpen,
  onClose,
  orderId,
  amount,
  last4,
  bankName,
  onVerificationSuccess,
}: CardSecurityModalProps) {
  const [otp, setOtp] = useState("482910");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter the verification code.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      const mockPayId = `pay_card_${Date.now().toString(36)}`;
      onVerificationSuccess({
        paymentId: mockPayId,
        method: "card",
        amount,
        status: "confirmed",
      });
      setIsVerifying(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Bank & 3D Secure Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">{bankName || "HDFC Bank Gateway"}</h3>
            <p className="text-xs text-slate-500">
              Verified by Visa / Mastercard 3DS 2.0
            </p>
          </div>
        </div>

        {/* Order Details Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Merchant:</span>
            <strong className="text-slate-900">CartWise Supermart</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Card ending in:</span>
            <span className="font-mono text-slate-900 font-bold">•••• •••• •••• {last4 || "4242"}</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200">
            <span>Amount to Pay:</span>
            <strong className="text-slate-900 text-sm font-black">₹{amount.toFixed(2)}</strong>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Enter One-Time Password (OTP)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-center font-mono text-base tracking-widest text-slate-900 focus:outline-none focus:border-emerald-600"
            />
            <span className="text-[10px] text-slate-500 block text-center mt-1">
              Sent to mobile linked with this card
            </span>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{isVerifying ? "Authenticating with Bank…" : `Authorize Payment (₹${amount.toFixed(2)})`}</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RBI Certified 2-Factor Authentication</span>
        </div>
      </div>
    </div>
  );
}
