'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  FileText,
  Download,
  RefreshCw,
  Filter,
  Plus,
  Settings,
  Star,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Search,
  Bell,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  Maximize2,
  Grid,
  List,
  CalendarDays,
  Building2,
  Stethoscope,
  Bed,
  Package,
  ClipboardList
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
  format: 'number' | 'currency' | 'percentage';
}

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'standard' | 'custom' | 'scheduled';
  lastRunAt?: string;
  runCount: number;
  isFavorite: boolean;
  status: 'active' | 'draft' | 'archived';
}

interface Alert {
  id: string;
  name: string;
  metric: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'triggered' | 'acknowledged';
  lastTriggeredAt?: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  previousValue?: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMetrics: DashboardMetric[] = [
  {
    id: '1',
    name: 'Total Patients',
    value: 12847,
    previousValue: 12234,
    change: 613,
    changePercentage: 5.01,
    trend: 'up',
    icon: Users,
    color: 'blue',
    format: 'number'
  },
  {
    id: '2',
    name: 'Appointments Today',
    value: 186,
    previousValue: 172,
    change: 14,
    changePercentage: 8.14,
    trend: 'up',
    icon: Calendar,
    color: 'green',
    format: 'number'
  },
  {
    id: '3',
    name: 'Revenue (MTD)',
    value: 487500,
    previousValue: 452000,
    change: 35500,
    changePercentage: 7.85,
    trend: 'up',
    icon: DollarSign,
    color: 'emerald',
    format: 'currency'
  },
  {
    id: '4',
    name: 'Bed Occupancy',
    value: 78.5,
    previousValue: 82.3,
    change: -3.8,
    changePercentage: -4.62,
    trend: 'down',
    icon: Bed,
    color: 'purple',
    format: 'percentage'
  },
  {
    id: '5',
    name: 'Avg Wait Time',
    value: 23,
    previousValue: 28,
    change: -5,
    changePercentage: -17.86,
    trend: 'down',
    icon: Clock,
    color: 'orange',
    format: 'number'
  },
  {
    id: '6',
    name: 'Staff On Duty',
    value: 342,
    previousValue: 338,
    change: 4,
    changePercentage: 1.18,
    trend: 'up',
    icon: Stethoscope,
    color: 'cyan',
    format: 'number'
  }
];

const mockReports: Report[] = [
  { id: '1', name: 'Daily Patient Census', description: 'Daily summary of patient admissions and discharges', category: 'clinical', type: 'scheduled', lastRunAt: '2026-01-23T06:00:00Z', runCount: 365, isFavorite: true, status: 'active' },
  { id: '2', name: 'Revenue Analysis', description: 'Comprehensive revenue breakdown by department', category: 'financial', type: 'standard', lastRunAt: '2026-01-22T15:30:00Z', runCount: 156, isFavorite: true, status: 'active' },
  { id: '3', name: 'Staff Performance Report', description: 'Staff productivity and performance metrics', category: 'staff', type: 'standard', lastRunAt: '2026-01-20T09:00:00Z', runCount: 89, isFavorite: false, status: 'active' },
  { id: '4', name: 'Appointment Trends', description: 'Analysis of appointment patterns and no-shows', category: 'operational', type: 'custom', lastRunAt: '2026-01-21T14:00:00Z', runCount: 45, isFavorite: false, status: 'active' },
  { id: '5', name: 'Inventory Status', description: 'Current inventory levels and reorder alerts', category: 'inventory', type: 'scheduled', lastRunAt: '2026-01-23T08:00:00Z', runCount: 245, isFavorite: true, status: 'active' },
  { id: '6', name: 'HIPAA Compliance Audit', description: 'Monthly compliance status and violations', category: 'compliance', type: 'scheduled', lastRunAt: '2026-01-01T00:00:00Z', runCount: 12, isFavorite: false, status: 'active' }
];

const mockAlerts: Alert[] = [
  { id: '1', name: 'High ER Wait Time', metric: 'ER Wait Time > 45 min', severity: 'warning', status: 'triggered', lastTriggeredAt: '2026-01-23T10:30:00Z' },
  { id: '2', name: 'Low Bed Availability', metric: 'ICU Beds < 10%', severity: 'critical', status: 'active' },
  { id: '3', name: 'Revenue Target', metric: 'Daily Revenue < $15,000', severity: 'info', status: 'active' }
];

const appointmentTrendData: ChartDataPoint[] = [
  { label: 'Mon', value: 145, previousValue: 132 },
  { label: 'Tue', value: 168, previousValue: 155 },
  { label: 'Wed', value: 172, previousValue: 160 },
  { label: 'Thu', value: 186, previousValue: 172 },
  { label: 'Fri', value: 154, previousValue: 148 },
  { label: 'Sat', value: 89, previousValue: 82 },
  { label: 'Sun', value: 45, previousValue: 40 }
];

const departmentData: ChartDataPoint[] = [
  { label: 'Emergency', value: 2450 },
  { label: 'Cardiology', value: 1820 },
  { label: 'Orthopedics', value: 1540 },
  { label: 'Pediatrics', value: 1280 },
  { label: 'Neurology', value: 980 },
  { label: 'Other', value: 4777 }
];

const revenueData: ChartDataPoint[] = [
  { label: 'Jan', value: 425000 },
  { label: 'Feb', value: 398000 },
  { label: 'Mar', value: 467000 },
  { label: 'Apr', value: 512000 },
  { label: 'May', value: 489000 },
  { label: 'Jun', value: 534000 },
  { label: 'Jul', value: 521000 },
  { label: 'Aug', value: 498000 },
  { label: 'Sep', value: 545000 },
  { label: 'Oct', value: 578000 },
  { label: 'Nov', value: 612000 },
  { label: 'Dec', value: 487500 }
];

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const MetricCard: React.FC<{ metric: DashboardMetric }> = ({ metric }) => {
  const Icon = metric.icon;
  const isPositive = metric.trend === 'up';
  const isNegative = metric.trend === 'down';
  
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.name}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {formatValue(metric.value, metric.format)}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {isPositive && (
          <span className="flex items-center text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{metric.changePercentage.toFixed(1)}%
          </span>
        )}
        {isNegative && (
          <span className="flex items-center text-sm text-red-600 dark:text-red-400">
            <TrendingDown className="w-4 h-4 mr-1" />
            {metric.changePercentage.toFixed(1)}%
          </span>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">vs last period</span>
      </div>
    </div>
  );
};

const SimpleBarChart: React.FC<{ data: ChartDataPoint[]; title: string; color?: string }> = ({ 
  data, 
  title, 
  color = 'blue' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-end gap-2 h-48">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full relative group">
              <div
                className={`w-full bg-${color}-500 dark:bg-${color}-400 rounded-t transition-all hover:bg-${color}-600 dark:hover:bg-${color}-500`}
                style={{ height: `${(point.value / maxValue) * 160}px` }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                {new Intl.NumberFormat('en-US').format(point.value)}
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimpleLineChart: React.FC<{ data: ChartDataPoint[]; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.previousValue || 0)));
  const minValue = Math.min(...data.map(d => Math.min(d.value, d.previousValue || d.value)));
  const range = maxValue - minValue;
  
  const getY = (value: number) => 160 - ((value - minValue) / range) * 140;
  const width = 100 / (data.length - 1);
  
  const currentPath = data.map((point, i) => {
    const x = i * width;
    const y = getY(point.value);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  const previousPath = data.map((point, i) => {
    const x = i * width;
    const y = getY(point.previousValue || point.value);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Previous</span>
          </div>
        </div>
      </div>
      <div className="relative h-48">
        <svg viewBox="0 0 100 160" className="w-full h-full" preserveAspectRatio="none">
          <path
            d={previousPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-300 dark:text-gray-600"
            strokeDasharray="2 2"
          />
          <path
            d={currentPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-blue-500"
          />
          {data.map((point, i) => (
            <circle
              key={i}
              cx={i * width}
              cy={getY(point.value)}
              r="1.5"
              className="fill-blue-500"
            />
          ))}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {data.map((point, i) => (
            <span key={i} className="text-xs text-gray-500 dark:text-gray-400">{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SimplePieChart: React.FC<{ data: ChartDataPoint[]; title: string }> = ({ data, title }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];
  
  let currentAngle = 0;
  const paths = data.map((point, index) => {
    const percentage = point.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors[index % colors.length],
      label: point.label,
      value: point.value,
      percentage: (percentage * 100).toFixed(1)
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {paths.map((p, i) => (
              <path
                key={i}
                d={p.path}
                fill={p.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            <circle cx="50" cy="50" r="20" className="fill-white dark:fill-gray-800" />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          {paths.map((p, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">{p.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{p.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReportCard: React.FC<{ report: Report; onRun: () => void; onToggleFavorite: () => void }> = ({ 
  report, 
  onRun, 
  onToggleFavorite 
}) => {
  const categoryColors = {
    clinical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    financial: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    staff: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    operational: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    inventory: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    compliance: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[report.category as keyof typeof categoryColors]}`}>
              {report.category}
            </span>
            {report.type === 'scheduled' && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                <Clock className="w-3 h-3 inline mr-1" />
                Scheduled
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{report.description}</p>
          {report.lastRunAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Last run: {new Date(report.lastRunAt).toLocaleString()}
            </p>
          )}
        </div>
        <button 
          onClick={onToggleFavorite}
          className={`p-1 rounded ${report.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
        >
          <Star className={`w-5 h-5 ${report.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onRun}
          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run Report
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Eye className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  const severityColors = {
    info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
  };

  const statusIndicators = {
    active: 'bg-green-500',
    triggered: 'bg-red-500 animate-pulse',
    acknowledged: 'bg-yellow-500'
  };

  return (
    <div className={`p-4 rounded-lg border ${severityColors[alert.severity]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${statusIndicators[alert.status]}`} />
          <div>
            <h4 className="font-medium">{alert.name}</h4>
            <p className="text-sm opacity-80">{alert.metric}</p>
          </div>
        </div>
        <span className="text-xs font-medium uppercase">{alert.status}</span>
      </div>
      {alert.lastTriggeredAt && (
        <p className="text-xs mt-2 opacity-70">
          Triggered: {new Date(alert.lastTriggeredAt).toLocaleString()}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportingDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'alerts'>('dashboard');
  const [dateRange, setDateRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>(mockReports);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleToggleFavorite = (reportId: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, isFavorite: !r.isFavorite } : r
    ));
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteReports = reports.filter(r => r.isFavorite);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Reporting & Analytics
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
              >
                <option value="1d">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Export Button */}
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>

              {/* Create Report Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Report</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Grid },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'alerts', label: 'Alerts', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'alerts' && mockAlerts.filter(a => a.status === 'triggered').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {mockAlerts.filter(a => a.status === 'triggered').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {mockMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimpleLineChart data={appointmentTrendData} title="Appointment Trends (This Week)" />
              <SimplePieChart data={departmentData} title="Patients by Department" />
            </div>

            {/* Revenue Chart */}
            <SimpleBarChart data={revenueData} title="Monthly Revenue (2026)" color="emerald" />

            {/* Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Favorite Reports */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Favorite Reports
                  </h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
                </div>
                <div className="space-y-3">
                  {favoriteReports.slice(0, 4).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{report.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{report.category}</p>
                      </div>
                      <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Run
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Active Alerts
                  </h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Manage</button>
                </div>
                <div className="space-y-3">
                  {mockAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reports..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Categories</option>
                  <option value="clinical">Clinical</option>
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                  <option value="staff">Staff</option>
                  <option value="inventory">Inventory</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reports Grid */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-3'
            }>
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onRun={() => console.log('Run report:', report.id)}
                  onToggleFavorite={() => handleToggleFavorite(report.id)}
                />
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reports found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alert Configuration
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Alert</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Triggered Alerts */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Triggered Alerts
                </h3>
                <div className="space-y-3">
                  {mockAlerts.filter(a => a.status === 'triggered').map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                  {mockAlerts.filter(a => a.status === 'triggered').length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No triggered alerts
                    </p>
                  )}
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Active Monitoring
                </h3>
                <div className="space-y-3">
                  {mockAlerts.filter(a => a.status === 'active').map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
