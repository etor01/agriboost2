// app/(dashboard)/farms/loading.tsx
export default function FarmsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-52 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-emerald-100 rounded-xl" />
      </div>

      {/* Farm cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl" />
              <div className="h-5 w-14 bg-gray-100 rounded-full" />
            </div>
            <div className="h-5 w-40 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-28 bg-gray-100 rounded mb-3" />
            <div className="h-px bg-gray-100 mb-3" />
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
