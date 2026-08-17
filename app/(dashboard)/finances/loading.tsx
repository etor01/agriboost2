// app/(dashboard)/finances/loading.tsx
export default function FinancesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header */}
      <div className="h-8 w-40 bg-gray-200 rounded" />

      {/* Balance cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-xl mb-3" />
            <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
            <div className="h-7 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Revenue chart placeholder */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 h-64 shadow-sm">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>

      {/* Transaction list skeleton */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-sm">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 w-40 bg-gray-200 rounded mb-1" />
                <div className="h-2.5 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
