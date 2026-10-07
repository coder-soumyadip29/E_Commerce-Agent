"use client";

import React from "react";
import {
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  CreditCard,
} from "lucide-react";
import { InvoiceData } from "@/lib/types";

function PrinterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  );
}

function FileTextIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

export function InvoiceModal({ isOpen, onClose, invoice }: InvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="print:hidden bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
              <FileTextIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>Tax Invoice &amp; Cash Receipt</span>
                <span className="font-mono text-[10px] text-slate-700 font-bold px-2 py-0.5 rounded bg-slate-200">
                  {invoice.invoiceNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                GST Compliant • Registered Business Invoice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          id="cartwise-printable-invoice"
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 print:text-black print:bg-white print:p-0 print:overflow-visible print:text-xs"
        >
          {/* Printable Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                  CartWise
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  SUPERMART
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                CartWise Retail Private Limited
              </p>
              <p className="text-xs text-slate-500">
                Plot 4A, Major Arterial Road, New Town, Kolkata - 700156
              </p>
              <p className="text-xs text-slate-500">
                GSTIN: <strong className="font-mono text-slate-800">19AAACC1206D1ZM</strong> • FSSAI Lic: <strong className="font-mono text-slate-800">10020031000123</strong>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ORIGINAL TAX INVOICE
              </span>
              <div className="text-xs font-mono">
                <span className="text-slate-500">Invoice: </span>
                <strong className="text-slate-900">{invoice.invoiceNumber}</strong>
              </div>
              <div className="text-xs text-slate-500">
                <span>Date: </span>
                <span className="font-medium text-slate-900">{invoice.invoiceDate}</span>
              </div>
              <div className="text-xs text-slate-500">
                <span>Place of Supply: </span>
                <strong className="text-slate-900">West Bengal (19)</strong>
              </div>
            </div>
          </div>

          {/* Billed To & Shipped To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                Billed To (Customer):
              </span>
              <p className="font-bold text-slate-900 text-sm">{invoice.customer.name}</p>
              <p className="text-slate-600">{invoice.customer.email}</p>
              <p className="text-slate-600">{invoice.customer.phone}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                Delivery Destination:
              </span>
              <p className="font-semibold text-slate-900">{invoice.deliveryAddress.name} ({invoice.deliveryAddress.type})</p>
              <p className="text-slate-600">{invoice.deliveryAddress.street_address}</p>
              <p className="text-slate-600">
                {invoice.deliveryAddress.city}, {invoice.deliveryAddress.pincode}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">HSN</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{item.hsnCode || "040900"}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations & GST Breakup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                Payment Verification
              </span>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <strong className="text-slate-900 uppercase">{invoice.paymentDetails.method}</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>Transaction ID:</span>
                <span className="text-slate-800">{invoice.paymentDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="text-emerald-700 font-bold">PAID &amp; SETTLED</span>
              </div>
            </div>

            <div className="space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-mono font-semibold">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({invoice.discountCode}):</span>
                  <span className="font-mono">-₹{invoice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>CGST (2.5%):</span>
                <span className="font-mono">₹{invoice.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (2.5%):</span>
                <span className="font-mono">₹{invoice.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee:</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>
              <div className="pt-2 border-t-2 border-slate-200 flex justify-between font-black text-base text-slate-900">
                <span>Total Invoice Value:</span>
                <span className="text-slate-900 font-mono">₹{invoice.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Legal Sign-off Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Computer-generated official tax invoice • No physical signature required</span>
            </div>
            <span>Thank you for shopping at CartWise Supermart!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
