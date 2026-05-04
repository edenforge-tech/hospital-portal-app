export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar placeholder */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col animate-pulse">
        {/* Logo area */}
        <div className="p-4 border-b border-gray-200">
          <div className="h-8 bg-gray-200 rounded-md w-3/4" />
        </div>
        {/* Nav items */}
        <div className="flex-1 p-3 space-y-1 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
              <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0" />
              <div className="h-4 bg-gray-200 rounded flex-1" style={{ width: `${55 + (i % 5) * 10}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar placeholder */}
        <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center gap-4 flex-shrink-0 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="flex-1" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>

        {/* Page content placeholder */}
        <div className="flex-1 p-6 overflow-auto animate-pulse">
          {/* Page header */}
          <div className="mb-6">
            <div className="h-7 bg-gray-200 rounded w-56 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-80" />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>

          {/* Content blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0" />
                    <div className="h-4 bg-gray-200 rounded flex-1" />
                    <div className="h-4 bg-gray-200 rounded w-16 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
