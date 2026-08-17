// app/(dashboard)/tasks/loading.tsx
export default function TasksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 w-44 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-100 rounded-full" />
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-48 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-14 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
