// app/(dashboard)/dashboard/loading.tsx
// Next.js automatically shows this while the async DashboardPage server component loads.

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 w-72">
          <div className="h-3 w-40 bg-emerald-100 rounded mb-2" />
          <div className="h-7 w-56 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-44 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-white/70 rounded-xl border border-white/60" />
          <div className="h-10 w-32 bg-emerald-100 rounded-xl" />
        </div>
      </div>

      {/* KPI row skeleton — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-5"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100" />
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-24 bg-gray-100 rounded mt-3" />
            <div className="h-7 w-20 bg-gray-200 rounded mt-1" />
            <div className="h-2.5 w-28 bg-gray-100 rounded mt-1" />
          </div>
        ))}
      </div>

      {/* Weather + Quick Actions row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 h-48" />
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 h-48">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 3-col grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 h-64"
          >
            <div className="h-4 w-36 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-12 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
