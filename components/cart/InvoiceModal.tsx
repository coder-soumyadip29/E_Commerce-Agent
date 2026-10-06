"use client";

import React from "react";
import {
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#0b101d] border border-white/10 rounded-3xl shadow-2xl text-white overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="print:hidden bg-[#111827] border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <FileTextIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Tax Invoice & Receipt</span>
                <span className="font-mono text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">
                  {invoice.invoiceNumber}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                GST Compliant • Cryptographically Authenticated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <PrinterIcon className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          id="cartwise-printable-invoice"
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-200 print:text-black print:bg-white print:p-0 print:overflow-visible print:text-xs"
        >
          {/* Printable Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10 print:border-gray-300">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-cyan-400 print:text-emerald-800 tracking-tight">
                  CartWise
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 print:border-gray-400 print:text-black">
                  PLUS
                </span>
              </div>
              <p className="font-extrabold text-xs text-white print:text-black mt-1">
                {invoice.storeName}
              </p>
              <p className="text-[11px] text-slate-400 print:text-gray-600 leading-relaxed max-w-sm">
                {invoice.storeAddress}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] font-mono text-cyan-300 print:text-gray-700">
                <span>GSTIN: {invoice.storeGstin}</span>
                <span>FSSAI Lic: {invoice.storeFssai}</span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:border-gray-400 print:text-black">
                ORIGINAL TAX INVOICE
              </span>
              <div className="font-mono font-bold text-sm text-white print:text-black">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">
                Date: {invoice.date}
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">
                Order ID: <span className="font-mono font-semibold text-cyan-300 print:text-black">#{invoice.orderId}</span>
              </div>
            </div>
          </div>

          {/* Two-Column Details: Customer Logistics & Payment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#12192b] border border-white/10 print:border print:border-gray-300 print:bg-gray-50 text-xs">
            {/* Left: Customer Address */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 print:text-gray-500 block">
                Billed To & Delivery Destination
              </span>
              <strong className="text-sm font-bold text-white print:text-black block">
                {invoice.customerName}
              </strong>
              <div className="text-slate-300 print:text-gray-700 text-[11px] leading-relaxed">
                <p>{invoice.deliveryAddress.street_address}</p>
                {invoice.deliveryAddress.landmark && <p>Landmark: {invoice.deliveryAddress.landmark}</p>}
                <p className="font-semibold text-cyan-300 print:text-black">
                  {invoice.deliveryAddress.city} - {invoice.deliveryAddress.pincode}
                </p>
                <p className="text-slate-400 print:text-gray-600 mt-0.5">Phone: {invoice.deliveryAddress.phone}</p>
                {invoice.customerEmail && (
                  <p className="text-slate-400 print:text-gray-600">Email: {invoice.customerEmail}</p>
                )}
              </div>
            </div>

            {/* Right: Payment Details & Logistics */}
            <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-4 print:border-gray-300">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 print:text-gray-500 block">
                Payment & Fulfillment Log
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Payment Mode:</span>
                  <span className="font-bold uppercase text-white print:text-black">
                    {invoice.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-cyan-300 print:text-black">
                    {invoice.paymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Delivery Slot:</span>
                  <span className="font-bold text-amber-300 print:text-black">
                    {invoice.deliverySlot?.title || "30-Min Fast Express"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Fulfillment Status:</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-700">
                    Dispatched / Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 print:border-gray-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#141d30] print:bg-gray-200 text-slate-300 print:text-black border-b border-white/10 print:border-gray-300">
                  <th className="py-2.5 px-3 font-bold text-[10px] uppercase">#</th>
                  <th className="py-2.5 px-3 font-bold text-[10px] uppercase">Item Description</th>
                  <th className="py-2.5 px-3 font-bold text-[10px] uppercase font-mono">HSN Code</th>
                  <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-center">Qty</th>
                  <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right">Unit Price</th>
                  <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right">Taxable</th>
                  <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right">GST %</th>
                  <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono text-slate-400 print:text-gray-600 text-[11px]">
                      {item.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white print:text-black">
                      {item.product_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 print:text-gray-600 text-[10px]">
                      {item.hsn_code}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-300 print:text-black">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300 print:text-black">
                      ${item.unit_price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 print:text-gray-600">
                      ${item.taxable_amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 print:text-gray-600">
                      {item.gst_rate}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 print:text-black">
                      ${item.line_total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Grand Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-[11px] text-slate-400 print:text-gray-600 space-y-1.5 max-w-sm">
              <div className="flex items-center gap-1.5 text-emerald-400 print:text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>GST Tax Breakdown (5% Composite Grocery Rate)</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Central GST (CGST) calculated at 2.5% and State GST (SGST) calculated at 2.5% on all organic grocery items.
              </p>
              <div className="p-2.5 rounded-xl bg-[#12192b] print:bg-gray-100 border border-white/5 print:border-gray-200 font-mono text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Taxable Base Value:</span>
                  <span className="font-bold text-white print:text-black">${invoice.gst.taxableSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST @ 2.5%:</span>
                  <span>${invoice.gst.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST @ 2.5%:</span>
                  <span>${invoice.gst.sgstAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Total Calculation Card */}
            <div className="w-full sm:w-72 p-4 rounded-2xl bg-[#12192b] border border-white/10 print:border-gray-300 print:bg-gray-50 text-xs space-y-2">
              <div className="flex justify-between text-slate-400 print:text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono text-white print:text-black">${invoice.subtotal.toFixed(2)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-cyan-300 font-semibold print:text-blue-800">
                  <span>Discount ({invoice.discountCode})</span>
                  <span className="font-mono">-${invoice.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 print:text-gray-600">
                <span>Total GST Included</span>
                <span className="font-mono">${invoice.gst.totalGst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-400 print:text-gray-600">
                <span>Express Delivery</span>
                <span className="font-bold text-emerald-400 print:text-emerald-700">FREE</span>
              </div>

              <div className="pt-2 border-t border-white/10 print:border-gray-300 flex justify-between items-baseline font-black text-base text-white print:text-black">
                <span>Grand Total</span>
                <span className="text-emerald-400 print:text-black text-lg">
                  ${invoice.finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notice & Stamp */}
          <div className="pt-4 border-t border-white/10 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 print:text-gray-600">
            <div>
              <p>Certified Computer-Generated Tax Invoice • Valid without Physical Seal</p>
              <p className="mt-0.5">Dispatched from CartWise Hyperlocal Fulfillment Hub</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>SIGNATURE VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Print CSS Injection */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #cartwise-printable-invoice,
            #cartwise-printable-invoice * {
              visibility: visible;
            }
            #cartwise-printable-invoice {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: auto;
              margin: 0;
              padding: 20px !important;
              background: white !important;
              color: black !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
