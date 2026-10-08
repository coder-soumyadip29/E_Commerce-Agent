"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  ArrowUpRight,
} from "lucide-react";

export default function SellerPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchPayouts();
  }, []);

  async function fetchPayouts() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/payouts");
      const json = await res.json();
      if (res.ok) {
        setPayouts(json.payouts || []);
        setSummary(json.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/seller/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), notes }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Failed to submit payout request");
      } else {
        setSuccessMsg(json.message);
        setModalOpen(false);
        setAmount("");
        setNotes("");
        fetchPayouts();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  const available = summary?.availableBalance ?? 0;
  const pending = summary?.pendingBalance ?? 0;
  const paidOut = summary?.totalPaidOut ?? 0;
  const bank = summary?.bankDetails;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payouts & Disbursements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Request funds withdrawals to your verified bank account and monitor disbursement statuses.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg("");
            setSuccessMsg("");
            setModalOpen(true);
          }}
          disabled={available < 500}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <DollarSign className="w-4 h-4" />
          Request Payout
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Available For Withdrawal
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">
            ₹{available.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Minimum withdrawal threshold: ₹500
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending Processing
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            ₹{pending.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            In review or bank transmission queue
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Paid Out
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{paidOut.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Lifetime settled merchant transfers
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Linked Payout Account
            </span>
            <Link href="/seller/settings/payment" className="text-xs text-indigo-600 hover:underline">
              Edit
            </Link>
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            {bank?.bank_name || "HDFC Bank"}
          </div>
          <div className="text-xs font-mono text-slate-500 mt-0.5">
            {bank?.account_number ? `A/c •••• ${bank.account_number.slice(-4)}` : "A/c •••• 0123"}
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Disbursement History
          </h2>
          <span className="text-xs text-slate-500">{payouts.length} total payouts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4 text-right">Requested Amount</th>
                <th className="py-3 px-4 text-right">Net Transferred</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Requested On</th>
                <th className="py-3 px-4">Processed Date</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading payout history...
                  </td>
                </tr>
              ) : payouts.length > 0 ? (
                payouts.map((p) => {
                  let badge = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
                  if (p.status === "COMPLETED") {
                    badge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
                  } else if (p.status === "REJECTED" || p.status === "FAILED") {
                    badge = "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                        PAY-{p.id}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        ₹{p.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ₹{p.net_amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {p.requested_at}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {p.processed_at || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {p.notes || "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payout disbursements requested yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Payout Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Request Payout
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="500"
                    max={available}
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`e.g. ${Math.min(5000, available)}`}
                    className="w-full pl-8 pr-4 py-2.5 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                  <span>Min: ₹500</span>
                  <button
                    type="button"
                    onClick={() => setAmount(String(available))}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Max (₹{available.toLocaleString()})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Destination Bank A/c
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {bank?.bank_name || "HDFC Bank"} — {bank?.account_number ? `•••• ${bank.account_number.slice(-4)}` : "•••• 0123"}
                  </div>
                  <div className="text-slate-500 font-mono">
                    IFSC: {bank?.ifsc_code || "HDFC0001234"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. End of month inventory liquidation payout"
                  className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || Number(amount) < 500 || Number(amount) > available}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  {submitting ? "Submitting..." : "Confirm Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
