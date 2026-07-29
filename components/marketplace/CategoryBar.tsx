"use client";

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
    <div className="bg-white/60 backdrop-blur-sm border-b border-white/40 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              active === cat
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "bg-white text-gray-500 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600 hover:shadow-sm"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
