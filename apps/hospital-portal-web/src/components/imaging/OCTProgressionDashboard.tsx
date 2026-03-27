// OCT Progression Tracking Dashboard
// Temporal trend analysis with baseline comparison and glaucoma staging

'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Download,
  CheckCircle,
  Activity,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  // Area,
  // AreaChart,
  // ReferenceLine,
} from 'recharts';
import toast from 'react-hot-toast';

interface OCTDataPoint {
  date: Date;
  averageRNFL: number;
  averageGCL: number;
  superiorRNFL: number;
  inferiorRNFL: number;
  nasalRNFL: number;
  temporalRNFL: number;
  glaucomaRiskScore: number;
  cupDiscRatio: number;
}

interface ProgressionMetrics {
  rnflSlope: number; // μm/year
  gclSlope: number;
  significantProgression: boolean;
  timeToProgression?: number; // months
  predictedRNFL12Months: number;
  predictedRNFL24Months: number;
}

interface GlaucomaStaging {
  stage: 'Normal' | 'Suspect' | 'Mild' | 'Moderate' | 'Severe' | 'Advanced';
  criteria: string[];
  recommendations: string[];
}

interface OCTProgressionDashboardProps {
  patientId: string;
  patientName: string;
  eye: 'OD' | 'OS';
  dateOfBirth: Date;
  onExportReport?: () => void;
  className?: string;
}

export default function OCTProgressionDashboard({
  patientId,
  patientName,
  eye,
  dateOfBirth,
  onExportReport,
  className = '',
}: OCTProgressionDashboardProps) {
  const [octHistory, setOctHistory] = useState<OCTDataPoint[]>([]);
  const [progression, setProgression] = useState<ProgressionMetrics | null>(null);
  const [staging, setStaging] = useState<GlaucomaStaging | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'6m' | '1y' | '2y' | 'all'>('1y');
  const [isLoading, setIsLoading] = useState(true);
  const [showPrediction, setShowPrediction] = useState(false);

  // Calculate patient age
  const calculateAge = (dob: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch OCT history
  const fetchOCTHistory = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call (in production: await api.get(`/oct/history/${patientId}/${eye}`))
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate mock historical data (8 data points over 2 years)
      const mockData: OCTDataPoint[] = Array.from({ length: 8 }, (_, i) => {
        const monthsAgo = (7 - i) * 3; // Data points every 3 months
        const date = new Date();
        date.setMonth(date.getMonth() - monthsAgo);

        // Simulate progressive RNFL thinning
        const baseRNFL = 105;
        const thinningRate = -2.5; // μm/year (moderate progression)
        const yearsAgo = monthsAgo / 12;
        const rnflThickness = baseRNFL - thinningRate * (2 - yearsAgo) + Math.random() * 4 - 2;

        return {
          date,
          averageRNFL: Math.max(55, rnflThickness),
          averageGCL: Math.max(45, 75 - (2 - yearsAgo) * 1.5 + Math.random() * 3 - 1.5),
          superiorRNFL: Math.max(50, rnflThickness + 15 + Math.random() * 5),
          inferiorRNFL: Math.max(50, rnflThickness + 20 + Math.random() * 5),
          nasalRNFL: Math.max(45, rnflThickness - 15 + Math.random() * 5),
          temporalRNFL: Math.max(40, rnflThickness - 25 + Math.random() * 5),
          glaucomaRiskScore: Math.min(100, 20 + (2 - yearsAgo) * 15 + Math.random() * 10),
          cupDiscRatio: Math.min(0.85, 0.35 + (2 - yearsAgo) * 0.08 + Math.random() * 0.05),
        };
      });

      setOctHistory(mockData);
      
      // Calculate progression metrics
      calculateProgressionMetrics(mockData);
      
      // Determine glaucoma staging
      determineGlaucomaStage(mockData[mockData.length - 1]);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch OCT history:', error);
      toast.error('Failed to load OCT progression data');
      setIsLoading(false);
    }
  };

  // Calculate progression metrics using linear regression
  const calculateProgressionMetrics = (data: OCTDataPoint[]) => {
    if (data.length < 2) return;

    // Convert dates to months from baseline
    const baselineDate = data[0].date.getTime();
    const dataPoints = data.map((d) => ({
      months: (d.date.getTime() - baselineDate) / (1000 * 60 * 60 * 24 * 30),
      rnfl: d.averageRNFL,
      gcl: d.averageGCL,
    }));

    // Linear regression for RNFL
    const rnflSlope = calculateSlope(
      dataPoints.map((d) => d.months),
      dataPoints.map((d) => d.rnfl)
    );
    
    // Linear regression for GCL
    const gclSlope = calculateSlope(
      dataPoints.map((d) => d.months),
      dataPoints.map((d) => d.gcl)
    );

    // Convert to μm/year
    const rnflSlopePerYear = (rnflSlope * 12);
    const gclSlopePerYear = (gclSlope * 12);

    // Determine if progression is significant (>2 μm/year for RNFL)
    const significantProgression = rnflSlopePerYear < -2 || gclSlopePerYear < -1.5;

    // Predict future values
    const latestRNFL = data[data.length - 1].averageRNFL;
    const predictedRNFL12Months = latestRNFL + rnflSlopePerYear;
    const predictedRNFL24Months = latestRNFL + rnflSlopePerYear * 2;

    // Estimate time to reach critical threshold (70 μm)
    let timeToProgression: number | undefined;
    if (rnflSlopePerYear < 0 && latestRNFL > 70) {
      timeToProgression = Math.round(((latestRNFL - 70) / Math.abs(rnflSlopePerYear)) * 12);
    }

    setProgression({
      rnflSlope: Math.round(rnflSlopePerYear * 10) / 10,
      gclSlope: Math.round(gclSlopePerYear * 10) / 10,
      significantProgression,
      timeToProgression,
      predictedRNFL12Months: Math.round(predictedRNFL12Months),
      predictedRNFL24Months: Math.round(predictedRNFL24Months),
    });
  };

  // Calculate linear regression slope
  const calculateSlope = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  };

  // Determine glaucoma stage based on latest OCT
  const determineGlaucomaStage = (latestData: OCTDataPoint) => {
    const { averageRNFL, averageGCL, cupDiscRatio } = latestData;

    let stage: GlaucomaStaging['stage'] = 'Normal';
    const criteria: string[] = [];
    const recommendations: string[] = [];

    // Staging criteria (Hodapp-Parrish-Anderson classification modified for OCT)
    if (averageRNFL >= 95 && cupDiscRatio < 0.5 && averageGCL >= 75) {
      stage = 'Normal';
      criteria.push('RNFL thickness within normal limits');
      criteria.push('Cup-disc ratio normal');
      recommendations.push('Continue annual screening');
      recommendations.push('Monitor IOP and visual fields');
    } else if (averageRNFL >= 85 && averageRNFL < 95 && cupDiscRatio < 0.6) {
      stage = 'Suspect';
      criteria.push('Borderline RNFL thinning');
      criteria.push('Cup-disc ratio borderline');
      recommendations.push('Repeat OCT in 6 months');
      recommendations.push('Perform visual field testing');
      recommendations.push('Consider IOP monitoring');
    } else if (averageRNFL >= 75 && averageRNFL < 85) {
      stage = 'Mild';
      criteria.push(`RNFL: ${Math.round(averageRNFL)}μm (mild thinning)`);
      criteria.push(`GCL: ${Math.round(averageGCL)}μm`);
      recommendations.push('Start IOP-lowering therapy if not on treatment');
      recommendations.push('OCT every 4-6 months');
      recommendations.push('Visual field testing every 6 months');
    } else if (averageRNFL >= 65 && averageRNFL < 75) {
      stage = 'Moderate';
      criteria.push(`RNFL: ${Math.round(averageRNFL)}μm (moderate thinning)`);
      criteria.push(`C/D ratio: ${cupDiscRatio.toFixed(2)}`);
      recommendations.push('Optimize IOP-lowering therapy (target <15 mmHg)');
      recommendations.push('OCT every 3-4 months');
      recommendations.push('Consider SLT or surgical intervention');
    } else if (averageRNFL >= 55 && averageRNFL < 65) {
      stage = 'Severe';
      criteria.push(`RNFL: ${Math.round(averageRNFL)}μm (severe thinning)`);
      criteria.push(`GCL: ${Math.round(averageGCL)}μm (significant loss)`);
      recommendations.push('Aggressive IOP reduction (target <12 mmHg)');
      recommendations.push('OCT every 2-3 months');
      recommendations.push('Surgical intervention likely needed');
      recommendations.push('Neuroprotection strategies');
    } else {
      stage = 'Advanced';
      criteria.push(`RNFL: ${Math.round(averageRNFL)}μm (advanced loss)`);
      criteria.push('Significant structural damage');
      recommendations.push('URGENT: Surgical intervention');
      recommendations.push('Very aggressive IOP control (<10 mmHg)');
      recommendations.push('Monthly monitoring');
      recommendations.push('Low vision rehabilitation referral');
    }

    setStaging({ stage, criteria, recommendations });
  };

  // Filter data by time range
  const getFilteredData = () => {
    if (selectedTimeRange === 'all') return octHistory;

    const months = selectedTimeRange === '6m' ? 6 : selectedTimeRange === '1y' ? 12 : 24;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    return octHistory.filter((d) => d.date >= cutoffDate);
  };

  // Format chart data
  const formatChartData = (data: OCTDataPoint[]) => {
    return data.map((d) => ({
      date: d.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      'Average RNFL': d.averageRNFL,
      'Average GCL': d.averageGCL,
      Superior: d.superiorRNFL,
      Inferior: d.inferiorRNFL,
      Nasal: d.nasalRNFL,
      Temporal: d.temporalRNFL,
      'Risk Score': d.glaucomaRiskScore,
      'C/D Ratio': d.cupDiscRatio * 100,
    }));
  };

  // Get stage color
  const getStageColor = (stage: GlaucomaStaging['stage']) => {
    switch (stage) {
      case 'Normal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Suspect':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Mild':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Moderate':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Severe':
      case 'Advanced':
        return 'bg-red-200 text-red-900 border-red-400';
    }
  };

  // Initialize
  useEffect(() => {
    fetchOCTHistory();
  }, []);

  const patientAge = calculateAge(dateOfBirth);
  const filteredData = getFilteredData();
  const chartData = formatChartData(filteredData);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            OCT Progression Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {patientName} - {eye === 'OD' ? 'Right Eye' : 'Left Eye'} - Age {patientAge}
          </p>
        </div>
        <button
          onClick={onExportReport}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-900 font-medium">Loading OCT progression data...</p>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && octHistory.length > 0 && (
        <>
          {/* Current Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Glaucoma Stage */}
            {staging && (
              <div className={`border-2 rounded-lg p-4 ${getStageColor(staging.stage)}`}>
                <div className="text-xs font-semibold mb-1">Current Stage</div>
                <div className="text-2xl font-bold">{staging.stage}</div>
                <div className="text-xs mt-2">
                  {staging.stage === 'Normal' && <CheckCircle className="w-4 h-4 inline" />}
                  {staging.stage !== 'Normal' && <span className="text-red-600">⚠</span>}
                </div>
              </div>
            )}

            {/* Latest RNFL */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-600 mb-1">Latest RNFL</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(octHistory[octHistory.length - 1].averageRNFL)}μm
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {octHistory[octHistory.length - 1].date.toLocaleDateString()}
              </div>
            </div>

            {/* Progression Rate */}
            {progression && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-600 mb-1">Progression Rate</div>
                <div
                  className={`text-2xl font-bold flex items-center gap-1 ${
                    progression.significantProgression ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {progression.rnflSlope > 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : progression.rnflSlope < 0 ? (
                    <span className="text-red-600">↓</span>
                  ) : (
                    <span className="text-gray-600">−</span>
                  )}
                  {Math.abs(progression.rnflSlope)}
                </div>
                <div className="text-xs text-gray-500 mt-2">μm/year</div>
              </div>
            )}

            {/* Time to Threshold */}
            {progression && progression.timeToProgression && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <div className="text-xs font-semibold text-red-700 mb-1">
                  Time to Critical Level
                </div>
                <div className="text-2xl font-bold text-red-800">
                  {progression.timeToProgression}mo
                </div>
                <div className="text-xs text-red-600 mt-2">If trend continues</div>
              </div>
            )}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            {(['6m', '1y', '2y', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTimeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? 'All' : range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RNFL Thickness Trend */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                RNFL Thickness Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: 'Thickness (μm)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {/* <ReferenceLine y={95} stroke="green" strokeDasharray="3 3" label="Normal" /> */}
                  {/* <ReferenceLine y={75} stroke="orange" strokeDasharray="3 3" label="Mild" /> */}
                  {/* <ReferenceLine y={65} stroke="red" strokeDasharray="3 3" label="Moderate" /> */}
                  <Line
                    type="monotone"
                    dataKey="Average RNFL"
                    stroke="#4F46E5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quadrant Analysis */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quadrant Thickness Analysis
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Superior" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="Inferior" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="Nasal" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Temporal" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* GCL Thickness Trend */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                GCL Thickness Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {/* <ReferenceLine y={75} stroke="green" strokeDasharray="3 3" label="Normal" /> */}
                  {/* <ReferenceLine y={60} stroke="orange" strokeDasharray="3 3" label="Borderline" /> */}
                  <Line
                    type="monotone"
                    dataKey="Average GCL"
                    stroke="#7C3AED"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Score Trend */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Glaucoma Risk Score Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Risk Score" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clinical Recommendations */}
          {staging && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagnostic Criteria */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Diagnostic Criteria
                </h3>
                <ul className="space-y-2">
                  {staging.criteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinical Recommendations */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <span className="text-amber-600">⚠</span>
                  Clinical Recommendations
                </h3>
                <ul className="space-y-2">
                  {staging.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-700 font-bold flex-shrink-0">{index + 1}.</span>
                      <span className="text-amber-900">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Prediction Panel */}
          {progression && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <span className="text-blue-600">↓</span>
                  Future Progression Prediction
                </h3>
                <button
                  onClick={() => setShowPrediction(!showPrediction)}
                  className="text-sm text-blue-700 hover:text-blue-900 underline"
                >
                  {showPrediction ? 'Hide' : 'Show'} Details
                </button>
              </div>
              {showPrediction && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Predicted RNFL (12 months)</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {progression.predictedRNFL12Months}μm
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Predicted RNFL (24 months)</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {progression.predictedRNFL24Months}μm
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Progression Status</div>
                    <div
                      className={`text-sm font-semibold ${
                        progression.significantProgression ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {progression.significantProgression ? 'Significant' : 'Stable'}
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-blue-700 mt-3">
                * Predictions based on linear regression analysis. Actual progression may vary based on treatment response.
              </p>
            </div>
          )}
        </>
      )}

      {/* No Data State */}
      {!isLoading && octHistory.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No OCT history available</p>
          <p className="text-sm text-gray-500 mt-1">
            Perform OCT scans to start tracking progression
          </p>
        </div>
      )}
    </div>
  );
}
