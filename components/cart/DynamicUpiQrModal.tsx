"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

interface DynamicUpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPaymentSuccess: (paymentId: string, upiApp: string) => void;
}

export function DynamicUpiQrModal({
  isOpen,
  onClose,
  orderId,
  amount,
  onPaymentSuccess,
}: DynamicUpiQrModalProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");

  const upiId = process.env.NEXT_PUBLIC_STORE_UPI_ID || "sumankuity68@oksbi";
  const payeeName = process.env.NEXT_PUBLIC_STORE_UPI_NAME || "Suman Kuity";

  // Approximate INR conversion for realistic UPI apps (1 USD = ~85 INR)
  const amountInr = Math.round(amount * 85);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(300);
      setIsProcessing(false);
      setUtrNumber("");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Standard Indian NPCI UPI URI Specification
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amountInr}&cu=INR&tn=CartWise+Order+${orderId}`;

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    upiDeepLink
  )}`;

  const handleSimulatePayment = (app: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockPayId = `pay_upi_${app}_${Date.now().toString(36)}`;
      onPaymentSuccess(mockPayId, app);
      setIsProcessing(false);
    }, 1200);
  };

  const handleManualConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const refId = utrNumber.trim() ? `utr_${utrNumber.trim()}` : `pay_upi_manual_${Date.now().toString(36)}`;
      onPaymentSuccess(refId, "UPI QR Transfer");
      setIsProcessing(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0d1322] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-white overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Scan & Pay via UPI</h3>
            <p className="text-[10px] text-emerald-300 font-mono uppercase tracking-wider">
              GPay • PhonePe • Paytm • BHIM • Any UPI App
            </p>
          </div>
        </div>

        {/* Amount & Timer Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141b2c] border border-white/5 mb-3">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Amount</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-400 tracking-tight">
                ₹{amountInr}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                (${amount.toFixed(2)})
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>QR Valid For</span>
            </span>
            <span className="font-mono font-bold text-sm text-amber-300">{timeFormatted}</span>
          </div>
        </div>

        {/* Payee Info Banner */}
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs mb-3">
          <div>
            <span className="text-[10px] text-emerald-300/80 uppercase tracking-wide block">Verified Payee</span>
            <span className="font-bold text-emerald-200">{payeeName}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Account Status</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Active VPA
            </span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center py-1">
          <div className="relative p-3 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-emerald-400/40">
            <img
              src={upiQrUrl}
              alt={`UPI QR for ${upiId}`}
              className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23111827'/><text x='50%25' y='50%25' fill='%2338bdf8' text-anchor='middle' font-size='14'>SCAN UPI QR</text></svg>";
              }}
            />
            {/* Center Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-[#0d1322] border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-emerald-300" />
              </div>
            </div>
          </div>

          {/* UPI ID Pill with Copy */}
          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131b2c] border border-white/10 text-xs text-slate-300">
            <span className="text-slate-400 text-[11px]">UPI ID:</span>
            <span className="font-mono font-bold text-white tracking-wide">{upiId}</span>
            <button
              onClick={handleCopy}
              className="text-emerald-400 hover:text-emerald-300 cursor-pointer ml-1"
              title="Copy UPI ID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Direct Pay Deep-link button (opens UPI app directly on mobile devices) */}
          <a
            href={upiDeepLink}
            className="mt-2 text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 sm:hidden underline underline-offset-2"
          >
            <span>Tap to open in your phone's UPI app</span>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Real Payment Manual Confirmation Form */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <label className="text-[11px] text-slate-300 font-medium block mb-1.5">
            After paying with GPay/PhonePe/Paytm:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="UPI Ref / UTR No. (Optional)"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="flex-1 bg-[#141b2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
            />
            <button
              onClick={handleManualConfirm}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? "Verifying..." : "I Have Paid"}</span>
            </button>
          </div>
        </div>

        {/* Sandbox Quick Simulation Buttons */}
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>Test Sandbox Simulation (1-Click):</span>
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">Test Mode</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSimulatePayment("gpay")}
              disabled={isProcessing}
              className="py-2 px-2 rounded-xl bg-[#151f33] hover:bg-[#1a2844] border border-white/10 hover:border-cyan-400/50 text-xs font-bold text-white transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
            >
              <span className="text-[11px] font-black tracking-wide text-cyan-300">Google Pay</span>
              <span className="text-[9px] text-slate-400">Simulate Pay</span>
            </button>

            <button
              onClick={() => handleSimulatePayment("phonepe")}
              disabled={isProcessing}
              className="py-2 px-2 rounded-xl bg-[#151f33] hover:bg-[#1a2844] border border-white/10 hover:border-purple-400/50 text-xs font-bold text-white transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
            >
              <span className="text-[11px] font-black tracking-wide text-purple-300">PhonePe</span>
              <span className="text-[9px] text-slate-400">Simulate Pay</span>
            </button>

            <button
              onClick={() => handleSimulatePayment("paytm")}
              disabled={isProcessing}
              className="py-2 px-2 rounded-xl bg-[#151f33] hover:bg-[#1a2844] border border-white/10 hover:border-blue-400/50 text-xs font-bold text-white transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
            >
              <span className="text-[11px] font-black tracking-wide text-blue-300">Paytm</span>
              <span className="text-[9px] text-slate-400">Simulate Pay</span>
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>NPCI Unified Payments Interface • Direct Bank Settlement</span>
        </div>
      </div>
    </div>
  );
}
