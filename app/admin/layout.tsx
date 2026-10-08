import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
  title: "CartWise Admin — Marketplace Control Center",
  description: "Enterprise multi-vendor management dashboard for sellers, products, orders, payouts and economics.",
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
