export default function PageLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="mb-6">
        <div className="h-7 bg-gray-200 rounded w-52 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4" />
          <div className="h-48 bg-gray-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4" />
          <div className="h-48 bg-gray-100 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2.5 border-b border-gray-100 last:border-0">
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
