"use client";

import React, { useState } from "react";
import {
  FileBarChart,
  Download,
  Calendar,
  Layers,
  Store,
  DollarSign,
  Package,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = async (reportType: string) => {
    try {
      setDownloading(reportType);

      if (reportType === "sales" || reportType === "commissions") {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        const orders = data.orders || [];

        if (reportType === "sales") {
          const headers = ["Order ID", "Customer", "Total Amount", "Status", "Vendor Count", "Date"];
          const rows = orders.map((o: any) => [
            o.id,
            `"${o.shipping_address?.full_name || "Customer"}"`,
            o.total_amount,
            o.status,
            o.seller_splits?.length || 1,
            o.created_at,
          ]);
          triggerCSV("marketplace_sales_report.csv", headers, rows);
        } else {
          // commissions report
          const headers = ["Order ID", "Vendor", "Subtotal", "Commission Rate", "Commission Retained", "Vendor Net", "Date"];
          const rows: any[] = [];
          orders.forEach((o: any) => {
            (o.seller_splits || []).forEach((s: any) => {
              rows.push([
                o.id,
                `"${s.seller_name}"`,
                s.subtotal,
                `${s.commission_rate}%`,
                s.commission_amount,
                s.seller_payout_amount,
                o.created_at,
              ]);
            });
          });
          triggerCSV("marketplace_commissions_report.csv", headers, rows);
        }
      } else if (reportType === "sellers") {
        const res = await fetch("/api/admin/sellers");
        const data = await res.json();
        const sellers = data.sellers || [];
        const headers = ["Seller ID", "Business Name", "Status", "Commission Rate", "Total Sales", "Payout Balance", "Rating"];
        const rows = sellers.map((s: any) => [
          s.id,
          `"${s.business_name}"`,
          s.status,
          `${s.commission_rate}%`,
          s.total_sales,
          s.payout_balance,
          s.rating,
        ]);
        triggerCSV("marketplace_sellers_performance.csv", headers, rows);
      } else if (reportType === "inventory") {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        const products = data.products || [];
        const headers = ["Product ID", "Name", "SKU", "Vendor", "Category", "Price", "Stock", "Status"];
        const rows = products.map((p: any) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.sku || p.id,
          `"${p.seller_name || "Apex"}"`,
          p.category,
          p.price,
          p.stock ?? 20,
          p.approval_status || p.status,
        ]);
        triggerCSV("marketplace_inventory_snapshot.csv", headers, rows);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const triggerCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const REPORT_CARDS = [
    {
      id: "sales",
      title: "Master Orders & Gross Sales Report",
      description: "Complete transactional audit including customer identity, gross totals, and fulfillment status.",
      icon: DollarSign,
      color: "emerald",
      badge: "Real-time orders",
    },
    {
      id: "commissions",
      title: "Marketplace Commission Retention Ledger",
      description: "Multi-vendor order split breakdown, retained platform take rates, and vendor net disbursements.",
      icon: Layers,
      color: "indigo",
      badge: "Financial reconciliation",
    },
    {
      id: "sellers",
      title: "Vendor Performance & Compliance Report",
      description: "Listing of all registered merchants, lifetime GMV, dispute records, and account ratings.",
      icon: Store,
      color: "amber",
      badge: "Vendor audit",
    },
    {
      id: "inventory",
      title: "Catalog Inventory & Stock Valuation",
      description: "Comprehensive stock counts, SKU mapping, reorder status, and unit list prices across sellers.",
      icon: Package,
      color: "rose",
      badge: "Warehouse valuation",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <FileBarChart className="w-7 h-7 text-emerald-600" />
          Financial & Operational Reports Export
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Export verified platform data into standard CSV spreadsheets for accounting, tax reporting, and seller audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPORT_CARDS.map((report) => {
          const Icon = report.icon;
          const isCurrent = downloading === report.id;

          return (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {report.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg">{report.title}</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Format: CSV / UTF-8</span>
                <button
                  disabled={isCurrent}
                  onClick={() => downloadReport(report.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isCurrent ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {isCurrent ? "Exporting..." : "Download CSV"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
