export default function AdminLoading() {
  return (
    <div className="flex h-screen bg-gray-100 p-3 gap-3 animate-pulse">
      {/* Sidebar placeholder */}
      <div className="hidden lg:flex w-64 bg-white rounded-2xl flex-shrink-0 flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="h-8 bg-gray-200 rounded-md w-3/4" />
        </div>
        <div className="flex-1 p-3 space-y-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
              <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0" />
              <div className="h-4 bg-gray-200 rounded" style={{ width: `${50 + (i % 5) * 10}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0 gap-3">
        {/* TopNav placeholder */}
        <div className="h-14 bg-white rounded-2xl flex items-center px-4 gap-4 flex-shrink-0">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="flex-1" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
        {/* Content placeholder */}
        <div className="flex-1 bg-white rounded-2xl p-6">
          <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-72 mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="h-4 bg-gray-200 rounded flex-1" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-5 bg-gray-200 rounded-full w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
