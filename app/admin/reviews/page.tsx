"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { Review } from "@/lib/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (ratingFilter !== "ALL") params.append("rating", ratingFilter);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", review_id: id, status }),
      });
      await fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", review_id: id }),
      });
      await fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Star className="w-7 h-7 text-emerald-600" />
            Customer Reviews & Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review product ratings and feedback to protect marketplace integrity against spam or inappropriate content.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "All Reviews", value: "ALL", count: counts.all },
          { label: "Pending Moderation", value: "PENDING", count: counts.pending },
          { label: "Approved Public", value: "APPROVED", count: counts.approved },
          { label: "Rejected / Hidden", value: "REJECTED", count: counts.rejected },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              statusFilter === tab.value
                ? "bg-white shadow-xs ring-2 ring-emerald-500 border-transparent"
                : "bg-white hover:bg-slate-50 border-slate-200"
            }`}
          >
            <div className="text-xs font-semibold text-slate-500">{tab.label}</div>
            <div className="text-2xl font-bold mt-1 text-slate-900">{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            No reviews matching filter.
          </div>
        ) : (
          reviews.map((r: any) => (
            <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400 text-sm">
                    {"★".repeat(r.rating || 5)}
                    {"☆".repeat(5 - (r.rating || 5))}
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{r.user_name || "Customer"}</span>
                  <span className="text-xs text-slate-400">for Product: {r.product_id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      r.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : r.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {r.status || "APPROVED"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(r.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                "{r.comment || "Great product."}"
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                {r.status !== "APPROVED" && (
                  <button
                    onClick={() => handleUpdateStatus(String(r.id), "APPROVED")}
                    className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                  >
                    Approve
                  </button>
                )}
                {r.status !== "REJECTED" && (
                  <button
                    onClick={() => handleUpdateStatus(String(r.id), "REJECTED")}
                    className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(String(r.id))}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
