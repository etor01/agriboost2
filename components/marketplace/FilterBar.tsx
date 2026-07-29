"use client";

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
    <div className="space-y-3">
      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 shadow-sm border border-white/60 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search maize, yams, tomatoes..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-800 placeholder-gray-400 text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Region + Sort */}
        <div className="flex gap-2 flex-shrink-0">
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-600 text-sm cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-600 text-sm cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newest Harvest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results meta */}
      <div className="flex items-center justify-between text-sm text-gray-500 px-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>
            <strong className="text-gray-800 font-semibold">
              {filteredCount}
            </strong>{" "}
            of{" "}
            <strong className="text-gray-800 font-semibold">{totalCount}</strong>{" "}
            products
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
