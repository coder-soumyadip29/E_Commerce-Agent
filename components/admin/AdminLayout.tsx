"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";
import { AdminUser, AdminNotification } from "@/lib/types";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // If already on login page, skip authentication wrapper
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAdminUser(data.user);
        } else {
          router.replace("/admin/login");
        }
      } catch (err) {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [isLoginPage, router]);

  // Load notifications
  useEffect(() => {
    if (!adminUser || isLoginPage) return;
    async function loadNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch (e) {}
    }
    loadNotifications();
  }, [adminUser, isLoginPage]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      setAdminUser(null);
      router.replace("/admin/login");
    } catch (e) {
      router.replace("/admin/login");
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await fetch(`/api/admin/notifications?id=${id}`, { method: "PATCH" });
    } catch (e) {}
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg animate-pulse">
          CW
        </div>
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400 tracking-wider">Verifying Admin Session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Fixed Left Navigation Sidebar */}
      <AdminSidebar
        onLogout={handleLogout}
        adminName={adminUser?.name || "Master Administrator"}
        adminRole={adminUser?.role || "SUPER_ADMIN"}
        unreadCount={notifications.filter((n) => !n.is_read).length}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset by 64px = 16rem on desktop) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminNavbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          adminName={adminUser?.name || "Master Administrator"}
          adminRole={adminUser?.role || "SUPER_ADMIN"}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
