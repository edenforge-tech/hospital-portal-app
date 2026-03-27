'use client';

import { useState, useEffect } from 'react';
import { TestTube, FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Search } from 'lucide-react';

interface LabStats {
  pendingTests: number;
  completedToday: number;
  abnormalResults: number;
  averageTurnaround: string;
}

interface LabTest {
  id: string;
  testName: string;
  category: string;
  orderedDate: string;
  orderedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  specimenType: string;
  completedDate?: string;
  results?: {
    value: string;
    unit: string;
    normalRange: string;
    isAbnormal: boolean;
  };
}

export default function LaboratoryPage() {
  const [stats, setStats] = useState<LabStats>({
    pendingTests: 0,
    completedToday: 0,
    abnormalResults: 0,
    averageTurnaround: '0h'
  });
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadLabData();
  }, []);

  const loadLabData = async () => {
    try {
      // Simulated data - will be replaced with real API calls
      setStats({
        pendingTests: 5,
        completedToday: 12,
        abnormalResults: 2,
        averageTurnaround: '4.5h'
      });

      setTests([
        {
          id: '1',
          testName: 'Visual Field Test',
          category: 'Ophthalmology',
          orderedDate: '2026-01-24T08:00:00',
          orderedBy: 'Dr. Sarah Johnson',
          status: 'completed',
          priority: 'routine',
          specimenType: 'Visual Assessment',
          completedDate: '2026-01-24T10:30:00',
          results: {
            value: 'Normal',
            unit: '',
            normalRange: 'No defects',
            isAbnormal: false
          }
        },
        {
          id: '2',
          testName: 'Intraocular Pressure (IOP)',
          category: 'Glaucoma Screening',
          orderedDate: '2026-01-24T09:00:00',
          orderedBy: 'Dr. Sarah Johnson',
          status: 'completed',
          priority: 'routine',
          specimenType: 'Tonometry',
          completedDate: '2026-01-24T09:15:00',
          results: {
            value: '18',
            unit: 'mmHg',
            normalRange: '10-21 mmHg',
            isAbnormal: false
          }
        },
        {
          id: '3',
          testName: 'OCT Scan (Optical Coherence Tomography)',
          category: 'Retinal Imaging',
          orderedDate: '2026-01-24T10:00:00',
          orderedBy: 'Dr. Michael Chen',
          status: 'in_progress',
          priority: 'urgent',
          specimenType: 'Retinal Scan'
        },
        {
          id: '4',
          testName: 'Fundus Photography',
          category: 'Diabetic Retinopathy Screening',
          orderedDate: '2026-01-24T11:00:00',
          orderedBy: 'Dr. Michael Chen',
          status: 'pending',
          priority: 'routine',
          specimenType: 'Retinal Photography'
        },
        {
          id: '5',
          testName: 'Corneal Topography',
          category: 'Refractive Surgery Evaluation',
          orderedDate: '2026-01-24T12:00:00',
          orderedBy: 'Dr. Sarah Johnson',
          status: 'pending',
          priority: 'routine',
          specimenType: 'Corneal Mapping'
        }
      ]);
    } catch (error) {
      console.error('Failed to load lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Pending Tests',
      value: stats.pendingTests,
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Abnormal Results',
      value: stats.abnormalResults,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Avg Turnaround',
      value: stats.averageTurnaround,
      icon: TrendingUp,
      color: 'bg-blue-500'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      routine: 'bg-gray-100 text-gray-700',
      urgent: 'bg-orange-100 text-orange-700',
      stat: 'bg-red-100 text-red-700'
    };
    return styles[priority as keyof typeof styles] || styles.routine;
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading laboratory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Laboratory Management</h1>
        <p className="text-gray-600 mt-1">Manage test orders, results, and specimen tracking</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {stats.abnormalResults > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Abnormal Results Detected</p>
              <p className="text-sm text-red-700">
                {stats.abnormalResults} test(s) returned abnormal results. Review immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lab Tests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Lab Tests</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Order New Test
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {filteredTests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No lab tests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{test.testName}</h3>
                        <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(test.status)}`}>
                          {test.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(test.priority)}`}>
                          {test.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="text-gray-900 font-medium">{test.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Specimen Type</p>
                          <p className="text-gray-900 font-medium">{test.specimenType}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ordered By</p>
                          <p className="text-gray-900 font-medium">{test.orderedBy}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ordered Date</p>
                          <p className="text-gray-900 font-medium">
                            {new Date(test.orderedDate).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {test.results && (
                        <div className="bg-gray-50 rounded p-3 mt-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Results</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Value</p>
                              <p className={`font-medium ${test.results.isAbnormal ? 'text-red-600' : 'text-green-600'}`}>
                                {test.results.value} {test.results.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Normal Range</p>
                              <p className="text-gray-900">{test.results.normalRange}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Status</p>
                              <p className={test.results.isAbnormal ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                {test.results.isAbnormal ? 'Abnormal' : 'Normal'}
                              </p>
                            </div>
                          </div>
                          {test.completedDate && (
                            <p className="text-xs text-gray-500 mt-2">
                              Completed: {new Date(test.completedDate).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {test.status === 'completed' && (
                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          View Report
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded">
              <TestTube className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Test Catalog</h3>
          </div>
          <p className="text-sm text-gray-600">Browse available tests</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Reports Archive</h3>
          </div>
          <p className="text-sm text-gray-600">Historical test results</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Analytics</h3>
          </div>
          <p className="text-sm text-gray-600">Test volume and trends</p>
        </div>
      </div>
    </div>
  );
}
