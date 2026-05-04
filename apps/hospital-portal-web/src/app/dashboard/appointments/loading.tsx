export default function AppointmentsLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-72" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg w-36" />
      </div>
      {/* Calendar skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 rounded w-32" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, week) => (
          <div key={week} className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, day) => (
              <div key={day} className="h-16 bg-gray-100 rounded border border-gray-200" />
            ))}
          </div>
        ))}
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
