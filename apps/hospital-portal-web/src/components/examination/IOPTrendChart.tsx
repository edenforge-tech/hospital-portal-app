'use client';

import { useMemo } from 'react';

interface IOPTrendChartProps {
  history: any[];
  targetIOPOD?: number;
  targetIOPOS?: number;
}

export default function IOPTrendChart({ history, targetIOPOD, targetIOPOS }: IOPTrendChartProps) {
  // Prepare data for chart (sort by date, most recent first)
  const chartData = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(a.examinationDate).getTime() - new Date(b.examinationDate).getTime())
      .map(record => ({
        date: new Date(record.examinationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: new Date(record.examinationDate),
        iopOD: record.OD.measuredIOP,
        iopOS: record.OS.measuredIOP,
        method: record.method,
      }));
  }, [history]);

  // Find min/max IOP for scaling
  const { minIOP, maxIOP } = useMemo(() => {
    const allIOPs = chartData.flatMap(d => [d.iopOD, d.iopOS]);
    return {
      minIOP: Math.floor(Math.min(...allIOPs, targetIOPOD || 21, targetIOPOS || 21) - 2),
      maxIOP: Math.ceil(Math.max(...allIOPs, 21) + 2),
    };
  }, [chartData, targetIOPOD, targetIOPOS]);

  const iopRange = maxIOP - minIOP;
  const chartHeight = 300;
  const chartWidth = 800;

  // Calculate Y position for IOP value
  const getYPosition = (iop: number) => {
    const percentage = (iop - minIOP) / iopRange;
    return chartHeight - (percentage * chartHeight);
  };

  // Generate SVG path for line chart
  const generatePath = (dataKey: 'iopOD' | 'iopOS') => {
    return chartData
      .map((point, index) => {
        const x = (index / (chartData.length - 1)) * chartWidth;
        const y = getYPosition(point[dataKey]);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No IOP history available
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm font-medium text-gray-700">OD (Right Eye)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm font-medium text-gray-700">OS (Left Eye)</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-red-400 border-t-2 border-dashed border-red-400 mr-2"></div>
            <span className="text-sm font-medium text-gray-700">Normal Limit (21 mmHg)</span>
          </div>
          {(targetIOPOD || targetIOPOS) && (
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-purple-400 border-t-2 border-dashed border-purple-400 mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Target IOP</span>
            </div>
          )}
        </div>

        {/* SVG Chart */}
        <svg
          viewBox={`0 0 ${chartWidth + 100} ${chartHeight + 60}`}
          className="w-full"
          style={{ maxHeight: '400px' }}
        >
          {/* Grid lines */}
          {Array.from({ length: 6 }).map((_, i) => {
            const iop = minIOP + (iopRange / 5) * i;
            const y = getYPosition(iop);
            return (
              <g key={i}>
                <line
                  x1="50"
                  y1={y + 20}
                  x2={chartWidth + 50}
                  y2={y + 20}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x="30"
                  y={y + 25}
                  fontSize="12"
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {Math.round(iop)}
                </text>
              </g>
            );
          })}

          {/* Normal limit line (21 mmHg) */}
          <line
            x1="50"
            y1={getYPosition(21) + 20}
            x2={chartWidth + 50}
            y2={getYPosition(21) + 20}
            stroke="#f87171"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Target IOP lines */}
          {targetIOPOD && (
            <line
              x1="50"
              y1={getYPosition(targetIOPOD) + 20}
              x2={chartWidth / 2 + 50}
              y2={getYPosition(targetIOPOD) + 20}
              stroke="#a78bfa"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
          {targetIOPOS && (
            <line
              x1={chartWidth / 2 + 50}
              y1={getYPosition(targetIOPOS) + 20}
              x2={chartWidth + 50}
              y2={getYPosition(targetIOPOS) + 20}
              stroke="#a78bfa"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* OD Line */}
          <path
            d={generatePath('iopOD').split(' ').map((segment, i) => {
              if (i === 0) return segment;
              const [cmd, x, y] = segment.split(' ');
              return `${cmd} ${parseFloat(x) + 50} ${parseFloat(y) + 20}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
          />

          {/* OS Line */}
          <path
            d={generatePath('iopOS').split(' ').map((segment, i) => {
              if (i === 0) return segment;
              const [cmd, x, y] = segment.split(' ');
              return `${cmd} ${parseFloat(x) + 50} ${parseFloat(y) + 20}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
          />

          {/* Data points - OD */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * chartWidth + 50;
            const y = getYPosition(point.iopOD) + 20;
            return (
              <g key={`od-${index}`}>
                <circle cx={x} cy={y} r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
                <text x={x} y={y - 10} fontSize="11" fill="#1e40af" textAnchor="middle" fontWeight="600">
                  {point.iopOD}
                </text>
              </g>
            );
          })}

          {/* Data points - OS */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * chartWidth + 50;
            const y = getYPosition(point.iopOS) + 20;
            return (
              <g key={`os-${index}`}>
                <circle cx={x} cy={y} r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                <text x={x} y={y + 18} fontSize="11" fill="#047857" textAnchor="middle" fontWeight="600">
                  {point.iopOS}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * chartWidth + 50;
            return (
              <text
                key={`label-${index}`}
                x={x}
                y={chartHeight + 35}
                fontSize="11"
                fill="#6b7280"
                textAnchor="middle"
              >
                {point.date}
              </text>
            );
          })}

          {/* Y-axis label */}
          <text
            x="10"
            y={chartHeight / 2}
            fontSize="12"
            fill="#374151"
            textAnchor="middle"
            transform={`rotate(-90 10 ${chartHeight / 2})`}
            fontWeight="600"
          >
            IOP (mmHg)
          </text>
        </svg>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">OD (Right Eye) Statistics</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Latest IOP:</span>
                <span className="font-medium text-blue-900">{chartData[chartData.length - 1].iopOD} mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Average IOP:</span>
                <span className="font-medium text-blue-900">
                  {(chartData.reduce((sum, d) => sum + d.iopOD, 0) / chartData.length).toFixed(1)} mmHg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Range:</span>
                <span className="font-medium text-blue-900">
                  {Math.min(...chartData.map(d => d.iopOD))} - {Math.max(...chartData.map(d => d.iopOD))} mmHg
                </span>
              </div>
              {targetIOPOD && (
                <div className="flex justify-between pt-1 border-t border-blue-200">
                  <span className="text-gray-700">Target IOP:</span>
                  <span className="font-medium text-purple-900">{targetIOPOD} mmHg</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">OS (Left Eye) Statistics</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Latest IOP:</span>
                <span className="font-medium text-green-900">{chartData[chartData.length - 1].iopOS} mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Average IOP:</span>
                <span className="font-medium text-green-900">
                  {(chartData.reduce((sum, d) => sum + d.iopOS, 0) / chartData.length).toFixed(1)} mmHg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Range:</span>
                <span className="font-medium text-green-900">
                  {Math.min(...chartData.map(d => d.iopOS))} - {Math.max(...chartData.map(d => d.iopOS))} mmHg
                </span>
              </div>
              {targetIOPOS && (
                <div className="flex justify-between pt-1 border-t border-green-200">
                  <span className="text-gray-700">Target IOP:</span>
                  <span className="font-medium text-purple-900">{targetIOPOS} mmHg</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
