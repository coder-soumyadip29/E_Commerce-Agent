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
  onVerificationSuccess: (paymentId: string) => void;
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
      onVerificationSuccess(mockPayId);
      setIsVerifying(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0d1322] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Bank & 3D Secure Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-cyan-300">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">{bankName || "Verified Bank Gateway"}</h3>
            <p className="text-[10px] text-cyan-300 font-mono uppercase tracking-wider">
              3D Secure 2.0 • Sandbox Authentication
            </p>
          </div>
        </div>

        {/* Order Details Banner */}
        <div className="p-3.5 rounded-2xl bg-[#141b2c] border border-white/5 mb-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Merchant:</span>
            <strong className="text-white">CartWise PLUS Groceries</strong>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Card ending in:</span>
            <span className="font-mono text-cyan-300">•••• •••• •••• {last4 || "4242"}</span>
          </div>
          <div className="flex justify-between text-slate-300 pt-1 border-t border-white/5">
            <span>Amount:</span>
            <strong className="text-emerald-400 text-sm font-black">${amount.toFixed(2)}</strong>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 text-center">
              One-Time Password (OTP)
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full text-center text-xl font-mono tracking-[0.4em] py-2.5 bg-[#151c2e] border border-white/15 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[10px] text-slate-400 text-center mt-1">
              Sandbox test code auto-filled: <span className="text-cyan-300 font-mono font-bold">482910</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isVerifying ? "Authorizing with Bank…" : "Authorize Payment"}</span>
          </button>
        </form>

        <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit SSL End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
}
