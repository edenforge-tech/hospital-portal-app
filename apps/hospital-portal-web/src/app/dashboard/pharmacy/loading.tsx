export default function PageLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="mb-6">
        <div className="h-7 bg-gray-200 rounded w-40 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-60" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-9 bg-gray-200 rounded-lg flex-1" />
        <div className="h-9 bg-gray-200 rounded-lg w-32" />
        <div className="h-9 bg-gray-200 rounded-lg w-28" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
