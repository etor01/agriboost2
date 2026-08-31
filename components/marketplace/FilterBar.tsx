// components/marketplace/FilterBar.tsx
"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface FilterBarProps {
  search: string;
  region: string;
  sort: string;
  regions: string[];
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onRegionChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onClearFilters: () => void;
}

export default function FilterBar({
  search,
  region,
  sort,
  regions,
  filteredCount,
  totalCount,
  hasActiveFilters,
  onSearchChange,
  onRegionChange,
  onSortChange,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="space-y-2.5">
      {/* Controls Container */}
      <div className="bg-white rounded-lg p-2 sm:p-2.5 border border-zinc-200 shadow-2xs flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search crop produce (e.g. Maize, Yam, Tomatoes)..."
            className="w-full pl-9 pr-8 py-1.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Region & Sort Selects */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-zinc-800 text-xs cursor-pointer shadow-2xs font-medium"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-zinc-800 text-xs cursor-pointer shadow-2xs font-medium"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newest Harvest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results Meta Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-500 px-0.5">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3 w-3 text-zinc-400" />
          <span>
            Showing <strong className="text-zinc-900 font-semibold">{filteredCount}</strong> of{" "}
            <strong className="text-zinc-900 font-semibold">{totalCount}</strong> listings
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

