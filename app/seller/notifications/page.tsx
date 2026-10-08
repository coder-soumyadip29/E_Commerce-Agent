"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  CheckCheck,
  Inbox,
} from "lucide-react";

export default function SellerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/notifications");
      const json = await res.json();
      if (res.ok) {
        setNotifications(json.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: number) {
    try {
      await fetch("/api/seller/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/seller/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = notifications.filter((n) =>
    filter === "UNREAD" ? !n.is_read : true
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications & System Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time feed of sub-orders, payout status, catalog approvals, and inventory alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 rounded-lg transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === "ALL"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            filter === "UNREAD"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading alerts...</div>
        ) : filtered.length > 0 ? (
          filtered.map((n) => {
            let Icon = Info;
            let iconClass = "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40";
            if (n.type === "success") {
              Icon = CheckCircle;
              iconClass = "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40";
            } else if (n.type === "warning") {
              Icon = AlertTriangle;
              iconClass = "text-amber-600 bg-amber-50 dark:bg-amber-900/40";
            }

            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
                  n.is_read
                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80"
                    : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-sm"
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${iconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {n.created_at}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  {n.link && (
                    <div className="mt-2.5">
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {!n.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2"></span>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <Inbox className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm">No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
