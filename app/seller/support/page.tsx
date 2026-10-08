"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  User,
  Shield,
} from "lucide-react";

export default function SellerSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New ticket state
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Order");
  const [priority, setPriority] = useState("MEDIUM");
  const [initialMessage, setInitialMessage] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/support");
      const json = await res.json();
      if (res.ok) {
        setTickets(json.tickets || []);
        if (json.tickets?.length > 0 && !selectedTicket) {
          setSelectedTicket(json.tickets[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingTicket(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/seller/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          category,
          priority,
          message: initialMessage,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Support ticket opened successfully!" });
        setModalOpen(false);
        setSubject("");
        setInitialMessage("");
        fetchTickets();
      } else {
        setStatusMsg({ type: "error", text: json.error || "Failed to create ticket" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Network error" });
    } finally {
      setSubmittingTicket(false);
    }
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const res = await fetch("/api/seller/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          ticket_id: selectedTicket.id,
          message: replyText,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setReplyText("");
        setSelectedTicket(json.ticket);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Merchant Help & Support Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Direct communication channel with CartWise Marketplace Operations & Seller Services.
          </p>
        </div>

        <button
          onClick={() => {
            setStatusMsg(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Open Support Ticket
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            statusMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Ticket Two-Pane Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List Pane */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-1 border-b border-slate-100 dark:border-slate-800">
            Active Tickets ({tickets.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading tickets...</div>
            ) : tickets.length > 0 ? (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                let statusBadge = "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400";
                if (t.status === "RESOLVED" || t.status === "CLOSED") {
                  statusBadge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400";
                }

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-700 shadow-sm"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-mono text-slate-400">#TK-{t.id}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${statusBadge}`}>
                        {t.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs mt-1.5 line-clamp-2">
                      {t.subject}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>{t.category}</span>
                      <span>{t.updated_at.slice(0, 10)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No support inquiries found.
              </div>
            )}
          </div>
        </div>

        {/* Message Thread Pane */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
          {selectedTicket ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono">#TK-{selectedTicket.id}</span>
                      <span>•</span>
                      <span>Category: {selectedTicket.category}</span>
                      <span>•</span>
                      <span>Priority: {selectedTicket.priority}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {selectedTicket.subject}
                    </h2>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="space-y-4 py-4 max-h-[380px] overflow-y-auto">
                  {selectedTicket.messages?.map((m: any) => {
                    const isSeller = m.sender === "SELLER";

                    return (
                      <div
                        key={m.id}
                        className={`flex gap-3 ${isSeller ? "justify-end" : "justify-start"}`}
                      >
                        {!isSeller && (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 flex items-center justify-center shrink-0">
                            <Shield className="w-4 h-4" />
                          </div>
                        )}

                        <div
                          className={`max-w-md p-4 rounded-2xl text-xs space-y-1 ${
                            isSeller
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 font-semibold text-[11px] opacity-80">
                            <span>{m.sender_name || (isSeller ? "Store Merchant" : "CartWise Ops")}</span>
                            <span>{m.created_at}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        </div>

                        {isSeller && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to Marketplace Operations..."
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyText.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <LifeBuoy className="w-10 h-10 text-slate-300" />
              <p className="text-sm">Select a ticket on the left to read conversation thread.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-indigo-600" />
                Open Support Ticket
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Courier pickup discrepancy for Wayanad hub"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Department Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Order">Order Fulfillment</option>
                    <option value="Payment">Payments & Gateway</option>
                    <option value="Payout">Disbursements / Payouts</option>
                    <option value="Product">Catalog & Products</option>
                    <option value="Account">Account & Verification</option>
                    <option value="Technical issue">Technical Issue</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Inquiry Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Provide complete details including Order IDs, Tracking Numbers, or SKU codes where relevant..."
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg"
                >
                  {submittingTicket ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
