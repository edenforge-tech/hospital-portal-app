export default function PageLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="mb-6">
        <div className="h-7 bg-gray-200 rounded w-52 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="h-9 w-9 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-40 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
