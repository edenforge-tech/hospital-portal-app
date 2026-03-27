'use client';

interface VisualAcuityHistoryProps {
  history: any[];
}

export default function VisualAcuityHistory({ history }: VisualAcuityHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No visual acuity history available for this patient.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-gray-900">
                {new Date(record.examinationDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-600">Chart: {record.chart} | Distance: {record.testingDistance}</p>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(record.examinationDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OD */}
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">OD (Right Eye)</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Unaided:</span>
                  <span className="font-medium text-gray-900">{record.distanceVA.OD.unaided}</span>
                </div>
                {record.distanceVA.OD.aided && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aided:</span>
                    <span className="font-medium text-gray-900">{record.distanceVA.OD.aided}</span>
                  </div>
                )}
                {record.distanceVA.OD.pinhole && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pinhole:</span>
                    <span className="font-medium text-gray-900">{record.distanceVA.OD.pinhole}</span>
                  </div>
                )}
                {record.nearVA?.OD.unaided && (
                  <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                    <span className="text-gray-600">Near:</span>
                    <span className="font-medium text-gray-900">{record.nearVA.OD.unaided}</span>
                  </div>
                )}
              </div>
            </div>

            {/* OS */}
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-green-900 mb-2">OS (Left Eye)</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Unaided:</span>
                  <span className="font-medium text-gray-900">{record.distanceVA.OS.unaided}</span>
                </div>
                {record.distanceVA.OS.aided && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aided:</span>
                    <span className="font-medium text-gray-900">{record.distanceVA.OS.aided}</span>
                  </div>
                )}
                {record.distanceVA.OS.pinhole && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pinhole:</span>
                    <span className="font-medium text-gray-900">{record.distanceVA.OS.pinhole}</span>
                  </div>
                )}
                {record.nearVA?.OS.unaided && (
                  <div className="flex justify-between border-t border-green-200 pt-1 mt-1">
                    <span className="text-gray-600">Near:</span>
                    <span className="font-medium text-gray-900">{record.nearVA.OS.unaided}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {record.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {record.notes}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
