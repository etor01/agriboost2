"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart, CheckCircle, Clock, Truck, XCircle,
  ChevronLeft, ChevronRight, Search, X,
} from "lucide-react";
import { AdminBadge, AdminEmptyState } from "@/components/admin/ui";
import type { LucideIcon } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusVariant = "warn" | "blue" | "purple" | "success" | "danger";

export interface OrderRecord {
  id: string;
  quantity: number | null;
  unit_price: number | null;
  total_amount: number | null;
  status: string;
  created_at: string;
  listings: { name: string } | null;
  buyers: { profiles: { firstname: string | null; lastname: string | null } | null } | null;
}

const statusConfig: Record<string, { label: string; icon: LucideIcon; variant: StatusVariant }> = {
  processing: { label: "Processing", icon: Clock,       variant: "warn" },
  confirmed:  { label: "Confirmed",  icon: CheckCircle, variant: "blue" },
  packed:     { label: "Packed",     icon: CheckCircle, variant: "purple" },
  shipped:    { label: "Shipped",    icon: Truck,       variant: "purple" },
  paid:       { label: "Paid",       icon: CheckCircle, variant: "blue" },
  in_transit: { label: "In Transit", icon: Truck,       variant: "purple" },
  delivered:  { label: "Delivered",  icon: CheckCircle, variant: "success" },
  cancelled:  { label: "Cancelled",  icon: XCircle,     variant: "danger" },
};

const STATUS_FILTERS = [
  { value: "all",        label: "All" },
  { value: "processing", label: "Processing" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "packed",     label: "Packed" },
  { value: "shipped",    label: "Shipped" },
  { value: "delivered",  label: "Delivered" },
  { value: "cancelled",  label: "Cancelled" },
];

const PAGE_SIZE = 10;

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrdersTableClient({ orders }: { orders: OrderRecord[] }) {
  const [filter, setFilter]           = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage]               = useState(1);

  const filtered = useMemo(() => {
    let list = filter === "all" ? orders : orders.filter((o) => o.status === filter);
    if (activeSearch.trim()) {
      const q = activeSearch.trim().toLowerCase();
      list = list.filter((o) => o.id.toLowerCase().includes(q));
    }
    return list;
  }, [orders, filter, activeSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilter = (val: string) => { setFilter(val); setPage(1); };
  const handleSearch = () => { setActiveSearch(searchInput); setPage(1); };
  const handleClear  = () => { setSearchInput(""); setActiveSearch(""); setPage(1); };

  const start = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(safePage * PAGE_SIZE, filtered.length);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (safePage > 3) pages.push("…");
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) pages.push(p);
    if (safePage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }, [totalPages, safePage]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Controls bar */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex flex-col gap-3">
        {/* Row 1: filters + count */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilter(opt.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === opt.value
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 whitespace-nowrap">
            {filtered.length === 0 ? "No records" : `${start}–${end} of ${filtered.length}`}
          </p>
        </div>

        {/* Row 2: search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by Order ID…"
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-8 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
            />
            {searchInput && (
              <button onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="flex-shrink-0 px-4 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-700 transition-colors"
          >
            Search
          </button>
          {activeSearch && (
            <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
              ID: {activeSearch}
              <button onClick={handleClear} className="ml-0.5 text-zinc-400 hover:text-zinc-700 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              {["Order ID", "Listing", "Buyer", "Amount", "Status", "Date"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {pageItems.map((order) => {
              const ui = statusConfig[order.status] ?? statusConfig["processing"];
              const Icon = ui.icon;
              const buyer = (order.buyers as any)?.profiles;
              const buyerName = buyer ? [buyer.firstname, buyer.lastname].filter(Boolean).join(" ") : "Unknown";
              return (
                <tr key={order.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <p className="font-mono text-[10px] text-zinc-300">{order.id.slice(8, 20)}…</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-700">{(order.listings as any)?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600">{buyerName}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-zinc-900 whitespace-nowrap">GH₵ {(order.total_amount ?? 0).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <AdminBadge variant={ui.variant} icon={Icon}>{ui.label}</AdminBadge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <AdminEmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={activeSearch ? `No orders matched ID "${activeSearch}".` : filter !== "all" ? "Try a different status filter." : "Orders will appear here when buyers make purchases."}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span key={`el-${i}`} className="w-7 text-center text-xs text-zinc-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                    p === safePage ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
