"use client";

import React, { useState, useMemo } from "react";
import {
  Activity, Leaf, MapPin, ShoppingBag, Sparkles,
  CheckSquare, CreditCard, User, ChevronLeft, ChevronRight, Search, X,
} from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ActivityRecord {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
  profiles: { firstname: string | null; lastname: string | null; role: string | null } | null;
}

// ── Meta ──────────────────────────────────────────────────────────────────────

const activityMeta: Record<string, { icon: React.ElementType; iconColor: string; iconBg: string; label: string }> = {
  crop_created:     { icon: Leaf,        iconColor: "text-emerald-600", iconBg: "bg-emerald-50", label: "Crop Created" },
  farm_created:     { icon: MapPin,      iconColor: "text-teal-600",    iconBg: "bg-teal-50",    label: "Farm Created" },
  listing_created:  { icon: ShoppingBag, iconColor: "text-blue-600",    iconBg: "bg-blue-50",    label: "Listing" },
  scan_performed:   { icon: Sparkles,    iconColor: "text-purple-600",  iconBg: "bg-purple-50",  label: "AI Scan" },
  task_completed:   { icon: CheckSquare, iconColor: "text-amber-600",   iconBg: "bg-amber-50",   label: "Task Done" },
  payment_received: { icon: CreditCard,  iconColor: "text-green-600",   iconBg: "bg-green-50",   label: "Payment" },
};
const fallbackMeta = { icon: Activity, iconColor: "text-zinc-500", iconBg: "bg-zinc-100", label: "Activity" };

const PAGE_SIZE = 10;

const ALL_FILTER_OPTIONS = [
  { value: "all",              label: "All" },
  { value: "crop_created",     label: "Crops" },
  { value: "farm_created",     label: "Farms" },
  { value: "listing_created",  label: "Listings" },
  { value: "scan_performed",   label: "AI Scans" },
  { value: "task_completed",   label: "Tasks" },
  { value: "payment_received", label: "Payments" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityLogClient({ activities }: { activities: ActivityRecord[] }) {
  const [filter, setFilter]         = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // applied on button click / Enter
  const [page, setPage]             = useState(1);

  // Apply filter → then search by ID
  const filtered = useMemo(() => {
    let list = filter === "all" ? activities : activities.filter((a) => a.activity_type === filter);
    if (activeSearch.trim()) {
      const q = activeSearch.trim().toLowerCase();
      list = list.filter((a) => a.id.toLowerCase().includes(q));
    }
    return list;
  }, [activities, filter, activeSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilter = (val: string) => { setFilter(val); setPage(1); };
  const handleSearch = () => { setActiveSearch(searchInput); setPage(1); };
  const handleClear  = () => { setSearchInput(""); setActiveSearch(""); setPage(1); };

  // Group current page by date
  const grouped: Record<string, ActivityRecord[]> = {};
  pageItems.forEach((act) => {
    const key = new Date(act.created_at).toLocaleDateString("en-GH", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(act);
  });

  const start = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(safePage * PAGE_SIZE, filtered.length);

  // Page numbers: show max 7 buttons with ellipsis logic
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
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {ALL_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === opt.value
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by record ID…"
              className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-8 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-sm"
            />
            {searchInput && (
              <button onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="flex-shrink-0 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Record count + active search badge */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-zinc-400">
          {filtered.length === 0 ? "No records" : `Showing ${start}–${end} of ${filtered.length} records`}
        </p>
        {activeSearch && (
          <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
            ID: {activeSearch}
            <button onClick={handleClear} className="ml-0.5 text-zinc-400 hover:text-zinc-700 transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

      {/* Activity Feed */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-5">
          {Object.entries(grouped).map(([dateLabel, acts]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{dateLabel}</span>
                <div className="flex-1 h-px bg-zinc-200" />
                <span className="text-xs text-zinc-400">{acts.length} event{acts.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white shadow-sm divide-y divide-zinc-100 overflow-hidden">
                {acts.map((act) => {
                  const meta = activityMeta[act.activity_type] ?? fallbackMeta;
                  const Icon = meta.icon;
                  const p = act.profiles;
                  const userName = p ? [p.firstname, p.lastname].filter(Boolean).join(" ") || "System" : "System";
                  return (
                    <div key={act.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-zinc-50/60 transition-colors">
                      <div className={`mt-0.5 w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}>
                        <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800">{act.title}</p>
                        {act.description && (
                          <p className="text-xs text-zinc-500 mt-0.5 truncate">{act.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <User className="w-2.5 h-2.5" /> {userName}
                          </span>
                          {p?.role && <span className="text-[10px] text-zinc-300 capitalize">{p.role}</span>}
                          <span className="text-[10px] font-mono text-zinc-300">{act.id.slice(0, 12)}…</span>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400 flex-shrink-0 mt-0.5">
                        {new Date(act.created_at).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          icon={Activity}
          title="No activity found"
          description={activeSearch ? `No records matched ID "${activeSearch}".` : filter !== "all" ? "Try selecting a different filter." : "Platform events will be logged here."}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
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
                <span key={`ellipsis-${i}`} className="w-7 text-center text-xs text-zinc-400">…</span>
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
