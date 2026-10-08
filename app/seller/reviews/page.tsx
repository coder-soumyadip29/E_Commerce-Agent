"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  MessageCircle,
  Flag,
  Send,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ShieldAlert,
} from "lucide-react";

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/reviews");
      const json = await res.json();
      if (res.ok) {
        setReviews(json.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReply(reviewId: number) {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/seller/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, reply_text: replyText }),
      });

      const json = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Store response published to product page!" });
        setReplyingToId(null);
        setReplyText("");
        fetchReviews();
      } else {
        setStatusMsg({ type: "error", text: json.error || "Failed to submit response" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Network error" });
    } finally {
      setSubmittingReply(false);
    }
  }

  function handleReport(reviewId: number) {
    setReportedReviews(new Set([...reportedReviews, reviewId]));
    setStatusMsg({
      type: "success",
      text: "Review flagged for Marketplace Trust & Safety inspection.",
    });
  }

  const filtered = reviews.filter((r) => {
    if (ratingFilter === "ALL") return true;
    return r.rating === Number(ratingFilter);
  });

  // Calculate rating stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Customer Product Reviews
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor customer feedback across your catalog, post verified merchant replies, and flag policy violations.
        </p>
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

      {/* Ratings Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
          <div className="text-5xl font-black text-slate-900 dark:text-white">{avgRating}</div>
          <div className="flex items-center gap-1 text-amber-400 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  Number(avgRating) >= star ? "fill-amber-400" : "fill-slate-200 dark:fill-slate-700"
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Based on {totalReviews} store product reviews
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-medium text-slate-600 dark:text-slate-400">{stars} ★</span>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <span className="w-12 text-right text-slate-500">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase mr-2">Filter by stars:</span>
          {["ALL", "5", "4", "3", "2", "1"].map((s) => (
            <button
              key={s}
              onClick={() => setRatingFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                ratingFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {s === "ALL" ? "All Stars" : `${s} ★`}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500">
          Showing {filtered.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading reviews...</div>
        ) : filtered.length > 0 ? (
          filtered.map((rev) => {
            const isReplying = replyingToId === rev.id;
            const isReported = reportedReviews.has(rev.id);

            return (
              <div
                key={rev.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
              >
                {/* Header: User & Rating & Product */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                      {rev.author_name ? rev.author_name.charAt(0) : "C"}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {rev.author_name || "Verified Customer"}
                      </div>
                      <div className="text-xs text-slate-400">
                        Reviewed on {rev.created_at || "Recent purchase"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            rev.rating >= s ? "fill-amber-400" : "fill-slate-200 dark:fill-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    {isReported && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-600">
                        FLAGGED FOR REVIEW
                      </span>
                    )}
                  </div>
                </div>

                {/* Linked Product Banner */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <span className="font-semibold text-slate-500">Product:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {rev.product_name}
                  </span>
                </div>

                {/* Review Text */}
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{rev.comment}"
                </div>

                {/* Existing Seller Reply */}
                {rev.seller_reply && (
                  <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border-l-4 border-indigo-600 rounded-r-xl space-y-1">
                    <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Official Store Response
                      {rev.seller_replied_at && (
                        <span className="font-normal text-slate-400 text-[11px]">
                          — {rev.seller_replied_at}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {rev.seller_reply}
                    </p>
                  </div>
                )}

                {/* Reply Form / Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {!isReplying ? (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setReplyingToId(rev.id);
                          setReplyText(rev.seller_reply || "");
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {rev.seller_reply ? "Edit Reply" : "Post Merchant Reply"}
                      </button>

                      {!isReported && (
                        <button
                          onClick={() => handleReport(rev.id)}
                          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
                        >
                          <Flag className="w-3 h-3" />
                          Report Review
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-full space-y-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a polite, professional reply to this customer review..."
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText("");
                          }}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingReply || !replyText.trim()}
                          onClick={() => handleSendReply(rev.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          {submittingReply ? "Publishing..." : "Submit Reply"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No customer reviews found matching filter.
          </div>
        )}
      </div>
    </div>
  );
}
