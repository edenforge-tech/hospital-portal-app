'use client';

import { useState, useEffect } from 'react';
import { Droplet, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';

interface IOPDataPoint {
  date: string;
  iopOD: number;
  iopOS: number;
  cctOD?: number;
  cctOS?: number;
  medicationChange?: string;
}

interface IOPTrackingChartProps {
  patientId: string;
  currentIOP: { OD: number; OS: number };
  targetIOP: number;
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

export default function IOPTrackingChart({
  patientId,
  currentIOP,
  targetIOP,
  onSave,
  canEdit = false,
}: IOPTrackingChartProps) {
  const [timePeriod, setTimePeriod] = useState<'3mo' | '6mo' | '1yr' | 'all'>('6mo');
  const [cctCorrectionEnabled, setCctCorrectionEnabled] = useState(false);
  const [iopHistory, setIopHistory] = useState<IOPDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIOPHistory = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        const mockHistory: IOPDataPoint[] = [
          { date: '2025-07-15', iopOD: 28, iopOS: 26, cctOD: 545, cctOS: 548 },
          { date: '2025-08-20', iopOD: 26, iopOS: 24, cctOD: 545, cctOS: 548, medicationChange: 'Started Timolol' },
          { date: '2025-09-15', iopOD: 24, iopOS: 22, cctOD: 545, cctOS: 548 },
          { date: '2025-10-20', iopOD: 22, iopOS: 20, cctOD: 545, cctOS: 548 },
          { date: '2025-11-15', iopOD: 38, iopOS: 36, cctOD: 545, cctOS: 548, medicationChange: 'Added Dorzolamide' },
          { date: '2025-12-20', iopOD: 42, iopOS: 40, cctOD: 545, cctOS: 548 },
          { date: '2026-01-20', iopOD: 40, iopOS: 38, cctOD: 545, cctOS: 548, medicationChange: 'Added Brimonidine' },
          { date: '2026-01-27', iopOD: currentIOP.OD, iopOS: currentIOP.OS, cctOD: 545, cctOS: 548 },
        ];

        setIopHistory(mockHistory);
      } catch (error) {
        console.error('Failed to load IOP history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIOPHistory();
  }, [patientId, currentIOP]);

  const applyCCTCorrection = (iop: number, cct: number) => {
    // CCT correction formula: For every 10 microns above 545, subtract ~0.7 mmHg
    // For every 10 microns below 545, add ~0.7 mmHg
    const cctDiff = cct - 545;
    const correction = (cctDiff / 10) * 0.7;
    return Math.round((iop - correction) * 10) / 10;
  };

  const filteredHistory = iopHistory.filter((point) => {
    const pointDate = new Date(point.date);
    const now = new Date();
    
    switch (timePeriod) {
      case '3mo':
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        return pointDate >= threeMonthsAgo;
      case '6mo':
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
        return pointDate >= sixMonthsAgo;
      case '1yr':
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        return pointDate >= oneYearAgo;
      case 'all':
      default:
        return true;
    }
  });

  const calculateStats = () => {
    if (filteredHistory.length === 0) return null;

    const iopODValues = filteredHistory.map((p) =>
      cctCorrectionEnabled && p.cctOD ? applyCCTCorrection(p.iopOD, p.cctOD) : p.iopOD
    );
    const iopOSValues = filteredHistory.map((p) =>
      cctCorrectionEnabled && p.cctOS ? applyCCTCorrection(p.iopOS, p.cctOS) : p.iopOS
    );

    const avgOD = Math.round((iopODValues.reduce((a, b) => a + b, 0) / iopODValues.length) * 10) / 10;
    const avgOS = Math.round((iopOSValues.reduce((a, b) => a + b, 0) / iopOSValues.length) * 10) / 10;

    const atGoalOD = iopODValues.filter((iop) => iop <= targetIOP).length;
    const atGoalOS = iopOSValues.filter((iop) => iop <= targetIOP).length;

    const percentAtGoalOD = Math.round((atGoalOD / iopODValues.length) * 100);
    const percentAtGoalOS = Math.round((atGoalOS / iopOSValues.length) * 100);

    const fluctuationOD = Math.round((Math.max(...iopODValues) - Math.min(...iopODValues)) * 10) / 10;
    const fluctuationOS = Math.round((Math.max(...iopOSValues) - Math.min(...iopOSValues)) * 10) / 10;

    return { avgOD, avgOS, percentAtGoalOD, percentAtGoalOS, fluctuationOD, fluctuationOS };
  };

  const stats = calculateStats();

  const getChartHeight = (iop: number) => {
    const maxIOP = 50;
    const minIOP = 0;
    const range = maxIOP - minIOP;
    return `${((iop - minIOP) / range) * 100}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-blue-600" />
            IOP Trend Analysis
          </h3>
          
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {(['3mo', '6mo', '1yr', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  timePeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'all' ? 'All' : period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cctCorrectionEnabled}
              onChange={(e) => setCctCorrectionEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">CCT Correction</span>
          </label>

          <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Average IOP</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">OD:</span>
                <span className="text-lg font-bold text-blue-900">{stats.avgOD} mmHg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">OS:</span>
                <span className="text-lg font-bold text-blue-900">{stats.avgOS} mmHg</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 mb-3">% At Goal (≤{targetIOP})</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">OD:</span>
                <span className="text-lg font-bold text-green-900">{stats.percentAtGoalOD}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">OS:</span>
                <span className="text-lg font-bold text-green-900">{stats.percentAtGoalOS}%</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-orange-900 mb-3">IOP Fluctuation</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700">OD:</span>
                <span className="text-lg font-bold text-orange-900">{stats.fluctuationOD} mmHg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700">OS:</span>
                <span className="text-lg font-bold text-orange-900">{stats.fluctuationOS} mmHg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {/* Chart Legend */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-700">OD (Right Eye)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-700">OS (Left Eye)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-red-400 border-t-2 border-dashed border-red-600"></div>
                <span className="text-sm text-gray-700">Target IOP (≤{targetIOP} mmHg)</span>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="relative h-96 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 p-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600 font-mono py-4">
              <span>50</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            {/* Target IOP line */}
            <div
              className="absolute left-12 right-4 border-t-2 border-dashed border-red-500"
              style={{ bottom: `calc(${getChartHeight(targetIOP)} - 16px)` }}
            >
              <span className="absolute -top-3 -right-0 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                Target
              </span>
            </div>

            {/* Data points */}
            <div className="absolute left-12 right-4 top-4 bottom-4 flex items-end justify-between">
              {filteredHistory.map((point, index) => {
                const iopODDisplay = cctCorrectionEnabled && point.cctOD
                  ? applyCCTCorrection(point.iopOD, point.cctOD)
                  : point.iopOD;
                const iopOSDisplay = cctCorrectionEnabled && point.cctOS
                  ? applyCCTCorrection(point.iopOS, point.cctOS)
                  : point.iopOS;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                    {/* Medication change marker */}
                    {point.medicationChange && (
                      <div className="absolute -top-8 bg-purple-100 border-2 border-purple-400 rounded px-2 py-1 text-xs text-purple-900 font-semibold whitespace-nowrap">
                        💊 {point.medicationChange}
                      </div>
                    )}

                    {/* OD bar */}
                    <div className="relative w-full flex justify-center">
                      <div
                        className="w-8 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative group"
                        style={{ height: getChartHeight(iopODDisplay) }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {iopODDisplay} mmHg
                        </div>
                      </div>
                    </div>

                    {/* OS bar */}
                    <div className="relative w-full flex justify-center -mt-1">
                      <div
                        className="w-8 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer relative group"
                        style={{ height: getChartHeight(iopOSDisplay) }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-900 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {iopOSDisplay} mmHg
                        </div>
                      </div>
                    </div>

                    {/* Date label */}
                    <p className="text-xs text-gray-600 font-mono mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {new Date(point.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Interpretation */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-yellow-900 mb-1">Clinical Interpretation</h4>
            <p className="text-sm text-yellow-800">
              {stats && stats.percentAtGoalOD < 50 && stats.percentAtGoalOS < 50 ? (
                <>
                  <strong>Poor IOP Control:</strong> Both eyes are above target IOP more than 50% of the time. 
                  Consider escalating therapy or surgical intervention. Reassess target IOP based on disease severity.
                </>
              ) : stats && stats.fluctuationOD > 10 && stats.fluctuationOS > 10 ? (
                <>
                  <strong>High IOP Fluctuation:</strong> Large IOP variability detected ({'>'}10 mmHg range). 
                  Check medication compliance, consider 24-hour IOP monitoring, and evaluate for steroid response.
                </>
              ) : (
                <>
                  <strong>IOP Control Status:</strong> Review individual visits to ensure IOP remains consistently at target. 
                  Monitor for progression with visual field and optic nerve imaging.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
