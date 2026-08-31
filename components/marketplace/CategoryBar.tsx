// components/marketplace/CategoryBar.tsx
"use client";

import React from "react";

interface CategoryBarProps {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryBar({
  categories,
  active,
  onChange,
}: CategoryBarProps) {
  return (
    <div className="bg-white border-b border-zinc-200 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-1.5 min-w-max">
        {categories.map((cat) => {
          const isActive = active.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white shadow-2xs font-semibold hover:bg-emerald-700"
                  : "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}


