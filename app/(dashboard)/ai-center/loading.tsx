// app/(dashboard)/ai-center/loading.tsx
export default function AiCenterLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-3xl mx-auto">
      {/* Page header */}
      <div>
        <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-56 bg-gray-100 rounded" />
      </div>

      {/* Upload card */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-sm">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-48 bg-gray-100 border-2 border-dashed border-gray-200 rounded-2xl" />
        <div className="flex gap-3 mt-4">
          <div className="h-10 flex-1 bg-gray-100 rounded-xl" />
          <div className="h-10 w-32 bg-emerald-100 rounded-xl" />
        </div>
      </div>

      {/* History cards */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 flex gap-4 shadow-sm"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-48 bg-gray-100 rounded mb-1" />
              <div className="h-3 w-40 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
