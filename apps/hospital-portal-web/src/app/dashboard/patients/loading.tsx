export default function PatientsLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 bg-gray-200 rounded w-44 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 bg-gray-200 rounded-lg w-28" />
          <div className="h-9 bg-gray-200 rounded-lg w-32" />
        </div>
      </div>
      {/* Search + filter bar */}
      <div className="flex gap-3 mb-4">
        <div className="h-9 bg-gray-200 rounded-lg flex-1" />
        <div className="h-9 bg-gray-200 rounded-lg w-32" />
        <div className="h-9 bg-gray-200 rounded-lg w-28" />
      </div>
      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50">
          {['Name', 'MRN', 'Age', 'Phone', 'Last Visit', 'Status'].map((h) => (
            <div key={h} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-8" />
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
