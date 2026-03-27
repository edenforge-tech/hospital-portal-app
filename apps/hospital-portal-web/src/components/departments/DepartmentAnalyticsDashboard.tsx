'use client';

import { useState, useEffect } from 'react';
import { departmentsEnhancedApi, Department, DepartmentMetrics } from '@/lib/api/departments-enhanced.api';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Clock, 
  DollarSign,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
  Award,
  Zap,
  Heart,
  Building
} from 'lucide-react';

interface DepartmentAnalyticsDashboardProps {
  department: Department;
}

interface AnalyticsTimeRange {
  value: string;
  label: string;
}

export default function DepartmentAnalyticsDashboard({ department }: DepartmentAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetricCategory, setSelectedMetricCategory] = useState<'all' | 'operational' | 'financial' | 'quality'>('all');

  const timeRanges: AnalyticsTimeRange[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  useEffect(() => {
    if (department) {
      loadMetrics();
    }
  }, [department.id, timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await departmentsEnhancedApi.getDepartmentMetrics(department.id, {
        timeRange,
        includeComparisons: true,
        includeTrends: true,
      });
      
      setMetrics(response);
    } catch (err: any) {
      console.error('Error loading metrics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnalytics = async () => {
    try {
      const blob = await departmentsEnhancedApi.exportDepartmentAnalytics(department.id, {
        timeRange,
        format: 'xlsx',
        includeCharts: true,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${department.departmentName}-analytics-${timeRange}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export analytics');
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPerformanceColor = (score: number, target: number) => {
    const percentage = (score / target) * 100;
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="text-center p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        <BarChart3 className="mx-auto h-12 w-12 mb-4 text-gray-400" />
        <p className="text-gray-500">No analytics data available</p>
        <button
          onClick={loadMetrics}
          className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
        >
          Retry loading analytics
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Department Analytics</h3>
          <p className="text-sm text-gray-600">Performance insights and trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedMetricCategory}
            onChange={(e) => setSelectedMetricCategory(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Metrics</option>
            <option value="operational">Operational</option>
            <option value="financial">Financial</option>
            <option value="quality">Quality</option>
          </select>

          <button
            onClick={handleExportAnalytics}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={loadMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      {(selectedMetricCategory === 'all' || selectedMetricCategory === 'operational') && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Operational Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Patient Volume</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.operationalMetrics.totalPatients}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.operationalMetrics.patientVolumeTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.operationalMetrics.patientVolumeTrend || 0)}`}>
                    {Math.abs(metrics.operationalMetrics.patientVolumeTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Capacity Utilization</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.operationalMetrics.capacityUtilization}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.operationalMetrics.utilizationTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.operationalMetrics.utilizationTrend || 0)}`}>
                    {Math.abs(metrics.operationalMetrics.utilizationTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg. Wait Time</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.operationalMetrics.averageWaitTime}</p>
                    <p className="text-xs text-gray-500">minutes</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(-(metrics.operationalMetrics.waitTimeTrend || 0))} {/* Negative trend is good for wait times */}
                  <span className={`text-sm ml-1 ${getTrendColor(-(metrics.operationalMetrics.waitTimeTrend || 0))}`}>
                    {Math.abs(metrics.operationalMetrics.waitTimeTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Staff Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.operationalMetrics.staffEfficiency}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.operationalMetrics.efficiencyTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.operationalMetrics.efficiencyTrend || 0)}`}>
                    {Math.abs(metrics.operationalMetrics.efficiencyTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Metrics */}
      {(selectedMetricCategory === 'all' || selectedMetricCategory === 'financial') && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Financial Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${metrics.financialMetrics.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.financialMetrics.revenueTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.financialMetrics.revenueTrend || 0)}`}>
                    {Math.abs(metrics.financialMetrics.revenueTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Cost per Patient</p>
                    <p className="text-2xl font-bold text-gray-900">${metrics.financialMetrics.costPerPatient}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(-(metrics.financialMetrics.costTrend || 0))} {/* Negative trend is good for costs */}
                  <span className={`text-sm ml-1 ${getTrendColor(-(metrics.financialMetrics.costTrend || 0))}`}>
                    {Math.abs(metrics.financialMetrics.costTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.financialMetrics.profitMargin}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.financialMetrics.marginTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.financialMetrics.marginTrend || 0)}`}>
                    {Math.abs(metrics.financialMetrics.marginTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Building className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">ROI</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.financialMetrics.roi}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.financialMetrics.roiTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.financialMetrics.roiTrend || 0)}`}>
                    {Math.abs(metrics.financialMetrics.roiTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Metrics */}
      {(selectedMetricCategory === 'all' || selectedMetricCategory === 'quality') && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Quality & Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Patient Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.qualityMetrics.patientSatisfaction}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.qualityMetrics.satisfactionTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.qualityMetrics.satisfactionTrend || 0)}`}>
                    {Math.abs(metrics.qualityMetrics.satisfactionTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Safety Score</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.qualityMetrics.safetyScore}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.qualityMetrics.safetyTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.qualityMetrics.safetyTrend || 0)}`}>
                    {Math.abs(metrics.qualityMetrics.safetyTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.qualityMetrics.qualityScore}%</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metrics.qualityMetrics.qualityTrend || 0)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.qualityMetrics.qualityTrend || 0)}`}>
                    {Math.abs(metrics.qualityMetrics.qualityTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Incident Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.qualityMetrics.incidentRate}</p>
                    <p className="text-xs text-gray-500">per 1000 patients</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(-(metrics.qualityMetrics.incidentTrend || 0))} {/* Negative trend is good for incidents */}
                  <span className={`text-sm ml-1 ${getTrendColor(-(metrics.qualityMetrics.incidentTrend || 0))}`}>
                    {Math.abs(metrics.qualityMetrics.incidentTrend || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance vs Targets */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Performance vs Targets</h4>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Patient Satisfaction</span>
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.qualityMetrics.patientSatisfaction, 90)}`}>
                  {metrics.qualityMetrics.patientSatisfaction}% / 90%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.qualityMetrics.patientSatisfaction / 90) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Capacity Utilization</span>
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.operationalMetrics.capacityUtilization, 85)}`}>
                  {metrics.operationalMetrics.capacityUtilization}% / 85%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.operationalMetrics.capacityUtilization / 85) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Staff Efficiency</span>
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.operationalMetrics.staffEfficiency, 80)}`}>
                  {metrics.operationalMetrics.staffEfficiency}% / 80%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.operationalMetrics.staffEfficiency / 80) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Quality Score</span>
                <span className={`text-sm font-medium ${getPerformanceColor(metrics.qualityMetrics.qualityScore, 95)}`}>
                  {metrics.qualityMetrics.qualityScore}% / 95%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: `${Math.min((metrics.qualityMetrics.qualityScore / 95) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Top Performing Areas</h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Patient Satisfaction</span>
                </div>
                <span className="text-sm font-medium text-green-600">+{metrics.qualityMetrics.satisfactionTrend || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Safety Score</span>
                </div>
                <span className="text-sm font-medium text-green-600">+{metrics.qualityMetrics.safetyTrend || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Revenue Growth</span>
                </div>
                <span className="text-sm font-medium text-green-600">+{metrics.financialMetrics.revenueTrend || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Areas for Improvement</h4>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm text-gray-700">Average Wait Time</span>
                </div>
                <span className="text-sm font-medium text-yellow-600">{metrics.operationalMetrics.averageWaitTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm text-gray-700">Cost per Patient</span>
                </div>
                <span className="text-sm font-medium text-yellow-600">${metrics.financialMetrics.costPerPatient}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-sm text-gray-700">Incident Rate</span>
                </div>
                <span className="text-sm font-medium text-red-600">{metrics.qualityMetrics.incidentRate}/1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}