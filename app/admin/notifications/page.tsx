"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  Clock,
  AlertTriangle,
  Store,
  DollarSign,
  Package,
} from "lucide-react";
import { AdminNotification } from "@/lib/types";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notification_id: id }),
      });
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_SELLER":
        return <Store className="w-5 h-5 text-amber-500" />;
      case "NEW_ORDER":
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case "LOW_STOCK":
        return <Package className="w-5 h-5 text-rose-500" />;
      case "PAYOUT_REQUEST":
        return <DollarSign className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-emerald-600" />
            Platform Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time activity feed across vendor onboarding, inventory thresholds, and payout requests.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" /> Mark All as Read
          </button>
          <button
            onClick={fetchNotifications}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            No active notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                n.is_read
                  ? "bg-white border-slate-200"
                  : "bg-emerald-50/40 border-emerald-200 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 mt-1 inline-block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(String(n.id))}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
