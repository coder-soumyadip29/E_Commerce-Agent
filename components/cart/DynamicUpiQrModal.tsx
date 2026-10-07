"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Check,
  Copy,
} from "lucide-react";

interface DynamicUpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPaymentSuccess: (receipt: any) => void;
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
  const payeeName = process.env.NEXT_PUBLIC_STORE_UPI_NAME || "CartWise Supermart";

  const amountInr = amount.toFixed(2);

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

  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amountInr}&cu=INR&tn=CartWise+Order+${orderId}`;

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiDeepLink
  )}`;

  const handleSimulatePayment = (app: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockPayId = `pay_upi_${app.toLowerCase()}_${Date.now().toString(36)}`;
      onPaymentSuccess({
        paymentId: mockPayId,
        method: "upi",
        upiApp: app,
        amount,
        status: "confirmed",
      });
      setIsProcessing(false);
    }, 1200);
  };

  const handleManualConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const refId = utrNumber.trim() ? `utr_${utrNumber.trim()}` : `pay_upi_qr_${Date.now().toString(36)}`;
      onPaymentSuccess({
        paymentId: refId,
        method: "upi",
        upiApp: "UPI QR",
        amount,
        status: "confirmed",
      });
      setIsProcessing(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-900 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
            UPI
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Scan &amp; Pay with Any UPI App</h3>
            <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
          </div>
        </div>

        {/* Payable Amount & Timer Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
              Amount to Pay
            </span>
            <span className="font-black text-xl text-slate-900">₹{amountInr}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-medium">QR Expires In</span>
            <span className="text-xs font-mono font-bold text-amber-700 flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" />
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* QR Code Canvas */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 shadow-xs mb-4">
          <img
            src={upiQrUrl}
            alt="UPI QR Code"
            className="w-48 h-48 rounded-lg object-contain"
          />
          <span className="text-[11px] font-bold text-slate-500 mt-2">
            Scan using any UPI App
          </span>
        </div>

        {/* Copy UPI ID */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 flex items-center justify-between text-xs">
          <div className="truncate mr-2">
            <span className="text-[10px] text-slate-500 block">UPI ID / VPA</span>
            <span className="font-mono font-bold text-slate-900 text-xs">{upiId}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Quick App Simulation Buttons */}
        <div className="space-y-2 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Instant Test Pay (1-Click Simulator):
          </span>
          <div className="grid grid-cols-3 gap-2">
            {["GPay", "PhonePe", "Paytm"].map((app) => (
              <button
                key={app}
                type="button"
                onClick={() => handleSimulatePayment(app)}
                disabled={isProcessing}
                className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200 flex items-center justify-center disabled:opacity-50"
              >
                <span>{app}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual UTR Input */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-slate-700">
            Or enter UPI Ref / UTR No. (after paying):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 410293847561"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />
            <button
              type="button"
              onClick={handleManualConfirm}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? "Verifying..." : "Confirm"}
            </button>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NPCI 256-Bit Encrypted UPI Payment</span>
        </div>
      </div>
    </div>
  );
}
