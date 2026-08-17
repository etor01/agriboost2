// app/(dashboard)/orders/loading.tsx
export default function OrdersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-40 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-56 bg-gray-100 rounded mb-6" />

      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-5 flex gap-4 shadow-sm"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-28 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
            <div className="h-8 w-28 bg-emerald-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
