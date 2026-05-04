export default function PageLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="mb-6">
        <div className="h-7 bg-gray-200 rounded w-44 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-9 bg-gray-200 rounded-lg w-40" />
        <div className="h-9 bg-gray-200 rounded-lg w-40" />
        <div className="flex-1" />
        <div className="h-9 bg-gray-200 rounded-lg w-32" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="h-5 bg-gray-200 rounded w-36 mb-4" />
            <div className="h-40 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
